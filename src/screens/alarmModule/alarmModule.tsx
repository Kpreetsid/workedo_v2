import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

import Fonts from "@/constants/Typography";
import Header from "@/src/components/global/Header";
import { alarmEndpoints, alarmOverview } from "@/src/services/alarms.service";
import { assetTree } from "@/src/services/asset.service";

type Severity = "All" | "Alert" | "Danger" | "Critical";
type Tab = "overview" | "thresholds";

const severities: Severity[] = ["All", "Alert", "Danger", "Critical"];

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const resolveAssetName = (asset: any) => asset?.asset_name || asset?.name || "Unnamed asset";
const resolveLocationName = (asset: any) => asset?.location_name || asset?.locationData?.location_name || "No location";

const monthAgoIso = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
};

const collectAssetIds = (assets: any[]): string[] => {
  const ids = new Set<string>();
  const walk = (nodes: any[] = []) => {
    nodes.forEach((node) => {
      const id = resolveId(node);
      if (id) ids.add(id);
      if (Array.isArray(node.childs)) walk(node.childs);
    });
  };
  walk(assets);
  return Array.from(ids);
};

const flattenTopAssets = (assets: any[]): any[] => {
  const topAssets: any[] = [];
  const walk = (nodes: any[] = []) => {
    nodes.forEach((node) => {
      if (node?.top_level || !node?.parent_id) {
        topAssets.push(node);
      }
      if (Array.isArray(node.childs)) walk(node.childs);
    });
  };
  walk(assets);
  return topAssets;
};

const convertToAlarmPayload = (assets: any[]) => {
  const payload: Record<string, any[]> = {};

  const collectChildren = (parent: any, result: any[]) => {
    if (!Array.isArray(parent?.childs)) return;
    parent.childs.forEach((child: any) => {
      const childId = resolveId(child);
      result.push({
        id: childId,
        asset_name: resolveAssetName(child),
        top_level: false,
        asset_class: child?.asset_class || "class_3",
        location_name: resolveLocationName(child),
        parent_id: {
          _id: resolveId(parent),
          id: resolveId(parent),
          asset_name: resolveAssetName(parent),
        },
      });
      collectChildren(child, result);
    });
  };

  assets.forEach((asset) => {
    const id = resolveId(asset);
    const assetName = resolveAssetName(asset);
    if (!id) return;
    payload[assetName] = [{
      id,
      asset_name: assetName,
      asset_class: asset?.asset_class || "class_3",
      top_level: true,
      location_name: resolveLocationName(asset),
    }];
    collectChildren(asset, payload[assetName]);
  });

  return payload;
};

const countSeverityTotal = (row: any) => {
  const breakdown = row?.severity_breakdown || row?.alarms_count || {};
  return Object.values(breakdown).reduce((sum: number, value: any) => sum + Number(value || 0), 0);
};

export default function AlarmModuleScreen() {
  const [tab, setTab] = useState<Tab>("overview");
  const [severity, setSeverity] = useState<Severity>("All");
  const [topAssets, setTopAssets] = useState<any[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [overviewRows, setOverviewRows] = useState<any[]>([]);
  const [endpointRows, setEndpointRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedTopAssets = useMemo(
    () => topAssets.filter((asset) => selectedAssetIds.includes(resolveId(asset))),
    [topAssets, selectedAssetIds]
  );

  const selectedLeafIds = useMemo(
    () => collectAssetIds(selectedTopAssets.length ? selectedTopAssets : topAssets),
    [selectedTopAssets, topAssets]
  );

  const fetchModule = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const treeRes = await assetTree();
      const tree = Array.isArray(treeRes?.data) ? treeRes.data : [];
      const top = flattenTopAssets(tree);
      setTopAssets(top);

      const assetsForPayload = selectedAssetIds.length
        ? top.filter((asset) => selectedAssetIds.includes(resolveId(asset)))
        : top;
      const alarmPayload = convertToAlarmPayload(assetsForPayload);
      const ids = collectAssetIds(assetsForPayload);

      if (!Object.keys(alarmPayload).length) {
        setOverviewRows([]);
        setEndpointRows([]);
        return;
      }

      const [overviewRes, endpointRes] = await Promise.all([
        alarmOverview({
          asset_list: alarmPayload,
          date_from: monthAgoIso(),
          date_to: new Date().toISOString(),
          sort_by: "asset_name",
          severity_level: severity === "All" ? ["Alert", "Danger", "Critical"] : severity,
        }),
        ids.length ? alarmEndpoints({ asset_id: ids }) : Promise.resolve({ data: [] }),
      ]);

      setOverviewRows(Array.isArray(overviewRes?.data) ? overviewRes.data : []);
      setEndpointRows(Array.isArray(endpointRes?.data) ? endpointRes.data : []);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to load alarm module", ToastAndroid.LONG);
      setOverviewRows([]);
      setEndpointRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAssetIds, severity]);

  useFocusEffect(
    useCallback(() => {
      fetchModule();
    }, [fetchModule])
  );

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchModule(false);
  };

  const totalAlarms = overviewRows.reduce((sum, row) => sum + countSeverityTotal(row), 0);

  return (
    <View style={styles.container}>
      <Header title="Alarm Module" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Alarm Count</Text>
            <Text style={styles.summaryValue}>{totalAlarms}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Endpoints</Text>
            <Text style={styles.summaryValue}>{endpointRows.length}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <Segment label="Overview" active={tab === "overview"} onPress={() => setTab("overview")} />
          <Segment label="Thresholds" active={tab === "thresholds"} onPress={() => setTab("thresholds")} />
        </View>

        <Text style={styles.filterTitle}>Severity</Text>
        <View style={styles.filterRow}>
          {severities.map((item) => (
            <Pressable
              key={item}
              style={[styles.filterChip, severity === item && styles.filterChipActive]}
              onPress={() => setSeverity(item)}
            >
              <Text style={[styles.filterChipText, severity === item && styles.filterChipTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterTitle}>Top Assets</Text>
        <View style={styles.filterRow}>
          {topAssets.slice(0, 12).map((asset) => {
            const assetId = resolveId(asset);
            const active = selectedAssetIds.includes(assetId);
            return (
              <Pressable
                key={assetId}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => toggleAsset(assetId)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {resolveAssetName(asset)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedAssetIds.length ? (
          <Pressable style={styles.clearButton} onPress={() => setSelectedAssetIds([])}>
            <Ionicons name="close-circle-outline" size={16} color="#742BDE" />
            <Text style={styles.clearButtonText}>Clear asset filters</Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#742BDE" />
            <Text style={styles.loadingText}>Loading alarm data...</Text>
          </View>
        ) : tab === "overview" ? (
          <OverviewList rows={overviewRows} />
        ) : (
          <ThresholdList rows={endpointRows} selectedAssetCount={selectedLeafIds.length} />
        )}
      </ScrollView>
    </View>
  );
}

function Segment({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function OverviewList({ rows }: { rows: any[] }) {
  if (!rows.length) {
    return <EmptyState icon="alert-circle-outline" title="No alarm data found" message="No alarm data is available for the selected assets and severity." />;
  }

  return (
    <View style={styles.list}>
      {rows.map((row, index) => (
        <View key={`${row.asset_id || row.asset_name}-${index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}><Ionicons name="alert-circle-outline" size={20} color="#742BDE" /></View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{row.asset_name || "Unnamed asset"}</Text>
              <Text style={styles.cardMeta}>{row.location_name || "No location"}</Text>
            </View>
            <Text style={styles.cardTotal}>{countSeverityTotal(row)}</Text>
          </View>
          <Breakdown title="Severity" data={row.severity_breakdown || row.alarms_count} />
          <Breakdown title="Alarm Type" data={row.alarm_type_count} />
        </View>
      ))}
    </View>
  );
}

function ThresholdList({ rows, selectedAssetCount }: { rows: any[]; selectedAssetCount: number }) {
  if (!rows.length) {
    return <EmptyState icon="options-outline" title="No endpoints found" message="No sensor endpoints were found for the selected assets." />;
  }

  return (
    <View style={styles.list}>
      <Text style={styles.helperText}>{selectedAssetCount} assets scanned for alarm threshold configuration.</Text>
      {rows.map((endpoint, index) => (
        <View key={`${endpoint._id || endpoint.id || index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}><Ionicons name="hardware-chip-outline" size={20} color="#742BDE" /></View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{endpoint.endpoint_name || endpoint.name || endpoint._id || "Endpoint"}</Text>
              <Text style={styles.cardMeta}>{endpoint.asset_name || "No asset"} • {endpoint.axis || "No axis"}</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{Number(endpoint.alarm_filled_percentage || 0)}%</Text>
            </View>
          </View>
          <Text style={styles.description}>Composite: {endpoint.composite_id || endpoint._id || "-"}</Text>
        </View>
      ))}
    </View>
  );
}

function Breakdown({ title, data }: { title: string; data: any }) {
  const entries = Object.entries(data || {}).filter(([, value]) => Number(value || 0) > 0);
  if (!entries.length) return null;

  return (
    <View style={styles.breakdown}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      <View style={styles.breakdownRow}>
        {entries.map(([key, value]) => (
          <View key={key} style={styles.breakdownPill}>
            <Text style={styles.breakdownLabel}>{key}</Text>
            <Text style={styles.breakdownValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyState({ icon, title, message }: { icon: keyof typeof Ionicons.glyphMap; title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={36} color="#B8B2C8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#742BDE", textTransform: "uppercase" },
  summaryValue: { marginTop: 5, fontFamily: Fonts.semiBold, fontSize: 24, color: "#222" },
  tabs: { marginTop: 14, backgroundColor: "#fff", borderRadius: 8, padding: 4, flexDirection: "row", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  segment: { flex: 1, alignItems: "center", borderRadius: 6, paddingVertical: 9 },
  segmentActive: { backgroundColor: "#742BDE" },
  segmentText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#6B6875" },
  segmentTextActive: { color: "#fff" },
  filterTitle: { marginTop: 14, marginBottom: 8, fontFamily: Fonts.semiBold, fontSize: 12, color: "#222" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fff", borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  filterChipActive: { backgroundColor: "#742BDE", borderColor: "#742BDE" },
  filterChipText: { fontFamily: Fonts.medium, fontSize: 11, color: "#6B6875" },
  filterChipTextActive: { color: "#fff" },
  clearButton: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", padding: 8 },
  clearButtonText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  loading: { padding: 30, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 14, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F2EBFF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitleWrap: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#222" },
  cardMeta: { marginTop: 3, fontFamily: Fonts.regular, fontSize: 11, color: "#8B8B94" },
  cardTotal: { fontFamily: Fonts.semiBold, fontSize: 22, color: "#742BDE" },
  description: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 12, color: "#575463" },
  breakdown: { marginTop: 12 },
  breakdownTitle: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#222", marginBottom: 8 },
  breakdownRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  breakdownPill: { borderRadius: 8, backgroundColor: "#F7F5FA", paddingHorizontal: 10, paddingVertical: 8 },
  breakdownLabel: { fontFamily: Fonts.medium, fontSize: 10, color: "#6B6875" },
  breakdownValue: { marginTop: 2, fontFamily: Fonts.semiBold, fontSize: 13, color: "#222" },
  progressPill: { borderRadius: 999, backgroundColor: "#F2EBFF", paddingHorizontal: 10, paddingVertical: 6 },
  progressText: { fontFamily: Fonts.semiBold, fontSize: 11, color: "#742BDE" },
  helperText: { fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
});

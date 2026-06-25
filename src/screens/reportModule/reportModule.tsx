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
import { assetTree } from "@/src/services/asset.service";
import { reportHealthList, reportOverview, reportSensorUptime } from "@/src/services/report.service";

type Tab = "overview" | "health" | "sensor";

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const assetName = (asset: any) => asset?.asset_name || asset?.name || "Unnamed asset";

const flattenTopAssets = (assets: any[]): any[] => {
  const top: any[] = [];
  const walk = (nodes: any[] = []) => {
    nodes.forEach((node) => {
      if (node?.top_level || !node?.parent_id) top.push(node);
      if (Array.isArray(node.childs)) walk(node.childs);
    });
  };
  walk(assets);
  return top;
};

const monthRange = () => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return {
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
};

const healthColor = (status?: string) => {
  switch (status) {
    case "Critical": return "#D63928";
    case "Danger": return "#D97706";
    case "Alert": return "#B58900";
    case "Healthy": return "#257A3E";
    default: return "#6B6875";
  }
};

export default function ReportModuleScreen() {
  const [tab, setTab] = useState<Tab>("overview");
  const [topAssets, setTopAssets] = useState<any[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [overviewRows, setOverviewRows] = useState<any[]>([]);
  const [overviewStatus, setOverviewStatus] = useState<Record<string, number>>({});
  const [healthRows, setHealthRows] = useState<any[]>([]);
  const [sensorRows, setSensorRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const effectiveAssetIds = useMemo(
    () => selectedAssetIds.length ? selectedAssetIds : topAssets.map(resolveId).filter(Boolean),
    [selectedAssetIds, topAssets]
  );

  const fetchReports = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const treeRes = await assetTree();
      const top = flattenTopAssets(Array.isArray(treeRes?.data) ? treeRes.data : []);
      setTopAssets(top);

      const assetIds = selectedAssetIds.length ? selectedAssetIds : top.map(resolveId).filter(Boolean);
      if (!assetIds.length) {
        setOverviewRows([]);
        setHealthRows([]);
        setSensorRows([]);
        setOverviewStatus({});
        return;
      }

      const range = monthRange();
      const [overviewRes, healthRes, sensorRes] = await Promise.all([
        reportOverview({
          asset_list: assetIds,
          date_from: null,
          date_to: null,
          alarmFromDate: undefined,
          page: 1,
          page_size: 20,
          healthStatus: [],
        }),
        reportHealthList({
          asset_ids: assetIds,
          date_from: range.fromDate,
          date_to: range.toDate,
        }),
        reportSensorUptime({
          page: 1,
          asset_ids: assetIds,
        }),
      ]);

      setOverviewRows(Array.isArray(overviewRes?.data) ? overviewRes.data : []);
      setOverviewStatus(overviewRes?.asset_status || {});
      setHealthRows(Array.isArray(healthRes) ? healthRes : []);
      setSensorRows(Array.isArray(sensorRes?.data) ? sensorRes.data : []);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to load report module", ToastAndroid.LONG);
      setOverviewRows([]);
      setHealthRows([]);
      setSensorRows([]);
      setOverviewStatus({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAssetIds]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports])
  );

  const toggleAsset = (id: string) => {
    setSelectedAssetIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Report Module" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryRow}>
          <Summary label="Assets" value={effectiveAssetIds.length} />
          <Summary label="Reports" value={overviewRows.length} />
          <Summary label="Sensors" value={sensorRows.length} />
        </View>

        <View style={styles.tabs}>
          <Segment label="Overview" active={tab === "overview"} onPress={() => setTab("overview")} />
          <Segment label="Health" active={tab === "health"} onPress={() => setTab("health")} />
          <Segment label="Sensors" active={tab === "sensor"} onPress={() => setTab("sensor")} />
        </View>

        <Text style={styles.filterTitle}>Top Assets</Text>
        <View style={styles.filterRow}>
          {topAssets.slice(0, 12).map((asset) => {
            const id = resolveId(asset);
            const active = selectedAssetIds.includes(id);
            return (
              <Pressable key={id} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => toggleAsset(id)}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{assetName(asset)}</Text>
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
            <Text style={styles.loadingText}>Loading report data...</Text>
          </View>
        ) : tab === "overview" ? (
          <Overview rows={overviewRows} status={overviewStatus} />
        ) : tab === "health" ? (
          <Health rows={healthRows} />
        ) : (
          <Sensors rows={sensorRows} />
        )}
      </ScrollView>
    </View>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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

function Overview({ rows, status }: { rows: any[]; status: Record<string, number> }) {
  if (!rows.length) return <EmptyState title="No report overview found" message="No asset report data is available for the selected assets." />;

  return (
    <View style={styles.list}>
      <View style={styles.statusGrid}>
        {["Healthy", "Alert", "Danger", "Critical", "Not Defined"].map((item) => (
          <View key={item} style={styles.statusBox}>
            <Text style={[styles.statusCount, { color: healthColor(item) }]}>{Number(status[item] || 0)}</Text>
            <Text style={styles.statusLabel}>{item}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, index) => (
        <View key={`${row.asset_id || index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}><Ionicons name="analytics-outline" size={20} color="#742BDE" /></View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{row.asset_name || "Unnamed asset"}</Text>
              <Text style={styles.cardMeta}>{row.location_name || "No location"}</Text>
            </View>
            <Text style={[styles.healthText, { color: healthColor(row.asset_health?.status) }]}>{row.asset_health?.status || "Not Defined"}</Text>
          </View>
          <MetricRow label="Alarms" value={Object.entries(row.alarms || {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "None"} />
          <MetricRow label="Faults" value={(row.fault_detection || []).map((item: any) => `${item.name}: ${item.count}`).join(", ") || "None"} />
        </View>
      ))}
    </View>
  );
}

function Health({ rows }: { rows: any[] }) {
  if (!rows.length) return <EmptyState title="No health monitoring data" message="No asset health history exists for the selected assets." />;

  return (
    <View style={styles.list}>
      {rows.map((row, index) => {
        const latest = Array.isArray(row.asset_health) ? row.asset_health[row.asset_health.length - 1] : null;
        return (
          <View key={`${row.asset_id || index}`} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}><Ionicons name="pulse-outline" size={20} color="#742BDE" /></View>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTitle}>{row.asset_name || "Unnamed asset"}</Text>
                <Text style={styles.cardMeta}>{row.asset_health?.length || 0} health records</Text>
              </View>
              <Text style={[styles.healthText, { color: healthColor(latest?.status) }]}>{latest?.status || "No status"}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Sensors({ rows }: { rows: any[] }) {
  if (!rows.length) return <EmptyState title="No sensor tracking found" message="No sensor uptime data exists for the selected assets." />;

  return (
    <View style={styles.list}>
      {rows.map((row, index) => (
        <View key={`${row.parent_asset_id || row.asset_id || index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}><Ionicons name="hardware-chip-outline" size={20} color="#742BDE" /></View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{row.parent_asset_name || row.asset_name || "Asset"}</Text>
              <Text style={styles.cardMeta}>{row.location_name || "No location"}</Text>
            </View>
            <Text style={styles.healthText}>{row.mounts?.length || 0} mounts</Text>
          </View>
          {(row.mounts || []).slice(0, 4).map((mount: any, mountIndex: number) => (
            <MetricRow key={`${mount.composite_id || mountIndex}`} label={mount.endpoint_name || mount.mount_location || "Endpoint"} value={`${mount.uptime ?? mount.uptime_percentage ?? "-"} uptime`} />
          ))}
        </View>
      ))}
    </View>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={36} color="#B8B2C8" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE", textTransform: "uppercase" },
  summaryValue: { marginTop: 5, fontFamily: Fonts.semiBold, fontSize: 22, color: "#222" },
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
  healthText: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusBox: { minWidth: "30%", backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  statusCount: { fontFamily: Fonts.semiBold, fontSize: 18 },
  statusLabel: { marginTop: 2, fontFamily: Fonts.medium, fontSize: 10, color: "#6B6875" },
  metricRow: { marginTop: 10, borderRadius: 8, backgroundColor: "#F7F5FA", padding: 10 },
  metricLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE", textTransform: "uppercase" },
  metricValue: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#222" },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
});

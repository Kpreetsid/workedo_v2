import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { deleteInspection, getInspections } from "@/src/services/inspection.service";
import { Inspection, InspectionAssignedUser } from "@/src/types/inspection";

const resolveId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value.id || value._id || "");
};

const resolveName = (value: any, fallback = "Not assigned") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.location_name || value.asset_name || value.title || fallback;
};

const userName = (value: any) => {
  if (!value) return "Unknown";
  const user = value.assignedUser || value.user || value;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.username || user.email || "Unknown";
};

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const isDone = (inspection: Inspection) => {
  const status = String(inspection.status || "").toLowerCase();
  return ["completed", "closed", "done"].includes(status);
};

export default function InspectionsScreen() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedTab, setSelectedTab] = useState<"todo" | "done">("todo");
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInspections = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await getInspections();
      setInspections(Array.isArray(res?.data) ? [...res.data].reverse() : []);
    } catch (error: any) {
      if (error?.status !== 404) {
        ToastAndroid.show(error?.message || "Unable to load inspections", ToastAndroid.LONG);
      }
      setInspections([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInspections();
    }, [fetchInspections])
  );

  const filteredInspections = useMemo(
    () => inspections.filter((inspection) => selectedTab === "done" ? isDone(inspection) : !isDone(inspection)),
    [inspections, selectedTab]
  );

  const confirmDelete = (inspection: Inspection) => {
    const inspectionId = resolveId(inspection);
    if (!inspectionId) return;

    Alert.alert("Delete Inspection", `Delete "${inspection.title || "this inspection"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteInspection(inspectionId);
            if (res?.status) {
              ToastAndroid.show("Inspection deleted", ToastAndroid.SHORT);
              fetchInspections(false);
            }
          } catch (error: any) {
            ToastAndroid.show(error?.message || "Unable to delete inspection", ToastAndroid.LONG);
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Inspections" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryRow}>
          <SummaryCard label="To Do" value={inspections.filter((item) => !isDone(item)).length} active={selectedTab === "todo"} onPress={() => setSelectedTab("todo")} />
          <SummaryCard label="Done" value={inspections.filter(isDone).length} active={selectedTab === "done"} onPress={() => setSelectedTab("done")} />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#742BDE" />
            <Text style={styles.loadingText}>Loading inspections...</Text>
          </View>
        ) : filteredInspections.length ? (
          <View style={styles.list}>
            {filteredInspections.map((inspection) => (
              <InspectionCard
                key={resolveId(inspection)}
                inspection={inspection}
                onOpen={() => setSelectedInspection(inspection)}
                onDelete={() => confirmDelete(inspection)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={36} color="#B8B2C8" />
            <Text style={styles.emptyTitle}>No inspections found</Text>
            <Text style={styles.emptyMessage}>There are no inspections in this tab.</Text>
          </View>
        )}
      </ScrollView>
      <InspectionDetailModal inspection={selectedInspection} onClose={() => setSelectedInspection(null)} />
    </View>
  );
}

function SummaryCard({ label, value, active, onPress }: { label: string; value: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.summaryCard, active && styles.summaryCardActive]} onPress={onPress}>
      <Text style={[styles.summaryLabel, active && styles.summaryLabelActive]}>{label}</Text>
      <Text style={[styles.summaryValue, active && styles.summaryValueActive]}>{value}</Text>
    </Pressable>
  );
}

function InspectionCard({ inspection, onOpen, onDelete }: { inspection: Inspection; onOpen: () => void; onDelete: () => void }) {
  const assigned = (inspection.assignedUsers || []).map((item: InspectionAssignedUser) => userName(item)).join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="clipboard-outline" size={20} color="#742BDE" />
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardTitle}>{inspection.title || "Untitled inspection"}</Text>
          <Text style={styles.cardMeta}>{resolveName(inspection.asset_id)} • {resolveName(inspection.location_id)}</Text>
        </View>
        <View style={[styles.statusPill, isDone(inspection) && styles.statusDone]}>
          <Text style={[styles.statusText, isDone(inspection) && styles.statusTextDone]}>{inspection.status || "Open"}</Text>
        </View>
      </View>
      {inspection.description ? <Text style={styles.description}>{inspection.description}</Text> : null}
      <View style={styles.detailGrid}>
        <Detail label="Form" value={resolveName(inspection.form_id)} />
        <Detail label="Start" value={formatDate(inspection.start_date)} />
        <Detail label="Created By" value={userName(inspection.createdBy)} />
        <Detail label="Assigned" value={assigned || "Unassigned"} />
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onOpen}>
          <Ionicons name="eye-outline" size={17} color="#742BDE" />
          <Text style={styles.actionText}>Details</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={17} color="#D63928" />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function InspectionDetailModal({ inspection, onClose }: { inspection: Inspection | null; onClose: () => void }) {
  const reportEntries = Object.entries(inspection?.inspection_report || {});

  return (
    <Modal visible={!!inspection} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{inspection?.title || "Inspection Details"}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={22} color="#222" /></Pressable>
          </View>
          <ScrollView>
            <Detail label="Status" value={inspection?.status || "Open"} />
            <Detail label="Form" value={resolveName(inspection?.form_id)} />
            <Detail label="Location" value={resolveName(inspection?.location_id)} />
            <Detail label="Asset" value={resolveName(inspection?.asset_id)} />
            <Detail label="Actions" value={String(inspection?.no_of_actions ?? 0)} />
            <Text style={styles.reportTitle}>Report Data</Text>
            {reportEntries.length ? reportEntries.map(([key, value]) => (
              <View key={key} style={styles.reportRow}>
                <Text style={styles.reportKey}>{key}</Text>
                <Text style={styles.reportValue}>{typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}</Text>
              </View>
            )) : <Text style={styles.emptyReport}>No report data submitted.</Text>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  summaryCardActive: { backgroundColor: "#742BDE", borderColor: "#742BDE" },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#6B6875" },
  summaryLabelActive: { color: "#fff" },
  summaryValue: { marginTop: 5, fontFamily: Fonts.semiBold, fontSize: 24, color: "#222" },
  summaryValueActive: { color: "#fff" },
  loading: { padding: 30, alignItems: "center" },
  loadingText: { marginTop: 8, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875" },
  list: { marginTop: 14, gap: 12 },
  card: { backgroundColor: "#fff", borderRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconWrap: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#F2EBFF", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitleWrap: { flex: 1, paddingRight: 8 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: "#222" },
  cardMeta: { marginTop: 3, fontFamily: Fonts.regular, fontSize: 11, color: "#8B8B94" },
  statusPill: { borderRadius: 999, backgroundColor: "#FFF3D8", paddingHorizontal: 9, paddingVertical: 5 },
  statusDone: { backgroundColor: "#E6F6EA" },
  statusText: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#8C5E00" },
  statusTextDone: { color: "#257A3E" },
  description: { marginTop: 10, fontFamily: Fonts.regular, fontSize: 13, color: "#575463", lineHeight: 18 },
  detailGrid: { marginTop: 10, gap: 8 },
  detailItem: { borderRadius: 8, backgroundColor: "#F7F5FA", padding: 10, marginBottom: 8 },
  detailLabel: { fontFamily: Fonts.semiBold, fontSize: 10, color: "#742BDE", textTransform: "uppercase" },
  detailValue: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#222" },
  actions: { marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#EEE", paddingTop: 10, flexDirection: "row", alignItems: "center", gap: 10 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 8 },
  actionText: { fontFamily: Fonts.medium, fontSize: 12, color: "#742BDE" },
  deleteText: { color: "#D63928" },
  emptyState: { marginTop: 14, alignItems: "center", backgroundColor: "#fff", borderRadius: 8, padding: 28, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF" },
  emptyTitle: { marginTop: 10, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  emptyMessage: { marginTop: 4, fontFamily: Fonts.regular, fontSize: 12, color: "#6B6875", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 18 },
  modalCard: { maxHeight: "88%", backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  modalTitle: { flex: 1, paddingRight: 10, fontFamily: Fonts.semiBold, fontSize: 16, color: "#222" },
  reportTitle: { marginTop: 8, marginBottom: 8, fontFamily: Fonts.semiBold, fontSize: 14, color: "#222" },
  reportRow: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#E7E4EF", padding: 10, marginBottom: 8 },
  reportKey: { fontFamily: Fonts.semiBold, fontSize: 12, color: "#742BDE" },
  reportValue: { marginTop: 5, fontFamily: Fonts.regular, fontSize: 12, color: "#575463" },
  emptyReport: { fontFamily: Fonts.regular, fontSize: 12, color: "#8B8B94", textAlign: "center", padding: 18 },
});

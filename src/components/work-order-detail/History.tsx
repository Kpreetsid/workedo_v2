import Fonts from "@/constants/Typography";
import { getWorkOrderActivity, getWorkOrderHistory } from "@/src/services/work-order.service";
import { WorkOrder, WorkOrderHistorySnapshot } from "@/src/types/workOrder";
import { WorkOrderActivityRecord } from "@/src/types/workOrderActivity";
import {
  getWorkOrderActivityDetails,
  getWorkOrderActivityIcon,
  getWorkOrderActivityLabel,
  getWorkOrderActivityTone,
  getWorkOrderSnapshotActor,
  getWorkOrderSnapshotDetails,
  getWorkOrderSnapshotSummary,
  matchesWorkOrderActivityFilter,
  WORK_ORDER_ACTIVITY_FILTERS,
  WorkOrderActivityFilterId,
} from "@/src/utils/workOrderActivity";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

interface Props {
  params: WorkOrder;
}

export default function History({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activity, setActivity] = useState<WorkOrderActivityRecord[]>([]);
  const [history, setHistory] = useState<WorkOrderHistorySnapshot[]>([]);
  const [activityFilter, setActivityFilter] = useState<WorkOrderActivityFilterId>("all");

  const fetchAuditData = useCallback(async (showLoader = true) => {
    if (!params?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const [activityRes, historyRes] = await Promise.allSettled([
        getWorkOrderActivity(params.id),
        getWorkOrderHistory(params.id),
      ]);

      if (activityRes.status === "fulfilled" && activityRes.value?.status) {
        setActivity(Array.isArray(activityRes.value.data) ? activityRes.value.data : []);
      } else {
        setActivity([]);
      }

      if (historyRes.status === "fulfilled" && historyRes.value?.status) {
        setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      setActivity([]);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  const activityCounts = useMemo(() => {
    return WORK_ORDER_ACTIVITY_FILTERS.reduce<Record<WorkOrderActivityFilterId, number>>((acc, filter) => {
      acc[filter.id] = activity.filter((entry) => matchesWorkOrderActivityFilter(entry, filter.id)).length;
      return acc;
    }, {
      all: activity.length,
      general: 0,
      status: 0,
      assignees: 0,
      parts: 0,
      procedures: 0,
      execution: 0,
      tasks: 0,
      files: 0,
      comments: 0,
      children: 0,
    });
  }, [activity]);

  const filteredActivity = useMemo(() => {
    return activity.filter((entry) => matchesWorkOrderActivityFilter(entry, activityFilter));
  }, [activity, activityFilter]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="small" color="#742BDE" />
        <Text style={styles.loaderText}>Loading activity...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAuditData(false);
          }}
        />
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Work Order Audit Trail</Text>
        <Text style={styles.heroTitle}>{params?.order_no || "Activity history"}</Text>
        <Text style={styles.heroSubtitle}>{params?.title || "All recorded actions and saved snapshots for this work order."}</Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatLabel}>Activity</Text>
            <Text style={styles.heroStatValue}>{activity.length}</Text>
          </View>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatLabel}>Snapshots</Text>
            <Text style={styles.heroStatValue}>{history.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Trail</Text>
        <Text style={styles.sectionSubtitle}>Tracked actions from the current work order workflow.</Text>

        <View style={styles.filterChipRow}>
          {WORK_ORDER_ACTIVITY_FILTERS.map((filter) => {
            const isActive = activityFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActivityFilter(filter.id)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label} ({activityCounts[filter.id] || 0})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredActivity.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No work order activity recorded for this filter yet.</Text>
          </View>
        ) : (
          filteredActivity.map((entry, index) => {
            const tone = getWorkOrderActivityTone(entry.action_type);
            const details = getWorkOrderActivityDetails(entry);
            return (
              <View key={entry.id || entry._id || `${entry.action_type}-${index}`} style={[styles.timelineCard, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                <View style={styles.timelineHeader}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={getWorkOrderActivityIcon(entry.action_type)} size={16} color={tone.icon} />
                  </View>
                  <View style={styles.timelineHeaderText}>
                    <View style={styles.timelineTitleRow}>
                      <Text style={[styles.timelineTitle, { color: tone.text }]}>{getWorkOrderActivityLabel(entry.action_type)}</Text>
                      {entry.order_no ? <Text style={styles.timelineOrderBadge}>#{entry.order_no}</Text> : null}
                    </View>
                    <Text style={styles.timelineMeta}>
                      {entry.actor_name || "System"} • {moment(entry.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.timelineNote}>{entry.note || "No note provided."}</Text>
                {details.map((detail) => (
                  <Text key={`${entry.id || entry._id}-${detail}`} style={styles.timelineDetail}>• {detail}</Text>
                ))}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Version History</Text>
        <Text style={styles.sectionSubtitle}>Saved snapshots of work order record changes.</Text>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No saved history snapshots found for this work order.</Text>
          </View>
        ) : (
          history.map((entry, index) => {
            const details = getWorkOrderSnapshotDetails(entry);
            const summary = getWorkOrderSnapshotSummary(entry);
            const actorName = getWorkOrderSnapshotActor(entry);

            return (
              <View key={entry.id || entry._id || `snapshot-${index}`} style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.snapshotTitle}>
                      {moment(entry?.history_created_at || entry?.updatedAt || entry?.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </Text>
                    <Text style={styles.snapshotMeta}>{actorName}</Text>
                  </View>
                  {entry?.status ? <Text style={styles.snapshotStatus}>{entry.status}</Text> : null}
                </View>

                <View style={styles.snapshotMetricRow}>
                  <View style={styles.snapshotMetricChip}>
                    <Text style={styles.snapshotMetricLabel}>Parts</Text>
                    <Text style={styles.snapshotMetricValue}>{summary.partLines}</Text>
                  </View>
                  <View style={styles.snapshotMetricChip}>
                    <Text style={styles.snapshotMetricLabel}>Tasks</Text>
                    <Text style={styles.snapshotMetricValue}>{summary.completedTasks}/{summary.taskCount}</Text>
                  </View>
                  <View style={styles.snapshotMetricChip}>
                    <Text style={styles.snapshotMetricLabel}>Procedures</Text>
                    <Text style={styles.snapshotMetricValue}>{summary.submittedProcedures}/{summary.procedureCount}</Text>
                  </View>
                  <View style={styles.snapshotMetricChip}>
                    <Text style={styles.snapshotMetricLabel}>Labor</Text>
                    <Text style={styles.snapshotMetricValue}>{summary.laborHours}h</Text>
                  </View>
                </View>

                {summary.partLines > 0 ? (
                  <Text style={styles.snapshotHighlight}>
                    Planned qty {summary.plannedQuantity} • Actual qty {summary.actualQuantity}
                  </Text>
                ) : null}

                {details.length > 0 ? (
                  details.map((detail) => (
                    <Text key={`${entry.id || entry._id}-${detail}`} style={styles.snapshotDetail}>• {detail}</Text>
                  ))
                ) : (
                  <Text style={styles.snapshotDetail}>• Snapshot captured for this update.</Text>
                )}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingBottom: 32,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#742BDE",
    textTransform: "uppercase",
  },
  heroTitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#111827",
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  heroStatCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroStatLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  heroStatValue: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 10,
  },
  filterChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: "#F3E8FF",
    borderColor: "#C084FC",
  },
  filterChipText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#6D28D9",
    fontFamily: Fonts.medium,
  },
  emptyCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  timelineCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  timelineHeaderText: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
  timelineOrderBadge: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: "#475569",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timelineMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#475569",
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#1E293B",
    marginBottom: 6,
  },
  timelineDetail: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
    marginBottom: 3,
  },
  snapshotCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 10,
  },
  snapshotHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  snapshotTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#111827",
  },
  snapshotMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 2,
  },
  snapshotStatus: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: "#5B21B6",
    backgroundColor: "#F3E8FF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  snapshotMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  snapshotMetricChip: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  snapshotMetricLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  snapshotMetricValue: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  snapshotHighlight: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#334155",
    marginBottom: 6,
  },
  snapshotDetail: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
    marginBottom: 3,
  },
});

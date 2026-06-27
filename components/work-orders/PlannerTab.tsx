import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import Fonts from "@/constants/Typography";
import { getWorkOrders } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { buildPlannerBuckets, buildPlannerInsights, filterPlannerOrdersByInsight, PlannerInsightId } from "@/src/utils/workOrderPlanner";
import WorkOrderCard from "./WorkOrderCard";

const sortNewestFirst = (orders: WorkOrder[]) =>
  [...orders].sort((a, b) => {
    const timeA = new Date(a?.createdAt || 0).getTime();
    const timeB = new Date(b?.createdAt || 0).getTime();
    return timeB - timeA;
  });

export default function PlannerTab() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<PlannerInsightId>("all");

  const fetchPlannerOrders = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }

    try {
      const res = await getWorkOrders("todo");
      const incoming = Array.isArray(res?.data) ? (res.data as WorkOrder[]) : [];
      if (res?.status && incoming.length > 0) {
        setWorkOrders(sortNewestFirst(incoming));
        return;
      }
      setWorkOrders([]);
    } catch (error) {
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlannerOrders();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlannerOrders(true);
    setRefreshing(false);
  };

  const filteredOrders = useMemo(() => filterPlannerOrdersByInsight(workOrders, selectedInsight), [selectedInsight, workOrders]);
  const buckets = useMemo(() => buildPlannerBuckets(filteredOrders), [filteredOrders]);
  const insights = useMemo(() => buildPlannerInsights(workOrders), [workOrders]);
  const plannerData = loading && workOrders.length === 0 ? [] : buckets;

  return (
    <FlatList
      data={plannerData}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={[
        styles.contentContainer,
        plannerData.length === 0 ? styles.emptyContentContainer : null,
      ]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={(
        <View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Planner</Text>
            <Text style={styles.summaryText}>
              Dispatch open work by readiness, blockers, and follow-up state. Use the insight chips to narrow the queue.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightRow}>
            {insights.map((insight) => {
              const active = selectedInsight === insight.id;
              return (
                <Pressable
                  key={insight.id}
                  style={[styles.insightChip, active && styles.insightChipActive]}
                  onPress={() => setSelectedInsight(insight.id)}
                >
                  <Text style={[styles.insightCount, active && styles.insightCountActive]}>{insight.count}</Text>
                  <Text style={[styles.insightLabel, active && styles.insightLabelActive]}>{insight.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      renderItem={({ item }) => (
        <View style={styles.bucketSection}>
          <View style={styles.bucketHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bucketTitle}>{item.label}</Text>
              <Text style={styles.bucketDescription}>{item.description}</Text>
            </View>
            <View style={styles.bucketCountWrap}>
              <Text style={styles.bucketCount}>{item.orders.length}</Text>
            </View>
          </View>

          {item.orders.length > 0 ? (
            item.orders.map((card) => (
              <WorkOrderCard
                key={card.order?.id || card.order?._id || card.order?.order_no}
                item={card.order}
                variant="planner"
                readiness={card.readiness}
                plannerMeta={{
                  bucketLabel: item.label,
                  blockers: card.blockers,
                  overdueDays: card.overdueDays,
                  taskSummary: card.taskSummary,
                  assigneeCount: card.assigneeCount,
                  hierarchyBadge: card.hierarchyBadge,
                  hierarchySummary: card.hierarchySummary,
                }}
              />
            ))
          ) : (
            <View style={styles.emptyBucket}>
              <Text style={styles.emptyBucketText}>{item.emptyMessage}</Text>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={(
        <View style={styles.emptyState}>
          {loading ? (
            <>
              <ActivityIndicator size={28} color="#742BDE" />
              <Text style={styles.emptyText}>Loading planner work orders...</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>No open work orders found for planner view.</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    gap: 12,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  summaryCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "#B4C6FC",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#1E3A8A",
  },
  summaryText: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#334155",
    lineHeight: 16,
  },
  insightRow: {
    gap: 8,
    paddingRight: 8,
    marginBottom: 12,
  },
  insightChip: {
    minWidth: 92,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "#D7DEEA",
    backgroundColor: "#FFFFFF",
  },
  insightChipActive: {
    backgroundColor: "#742BDE",
    borderColor: "#742BDE",
  },
  insightCount: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: "#1E293B",
  },
  insightCountActive: {
    color: "#FFFFFF",
  },
  insightLabel: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  insightLabelActive: {
    color: "#EDE9FE",
  },
  bucketSection: {
    marginBottom: 16,
  },
  bucketHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  bucketTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  bucketDescription: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  bucketCountWrap: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bucketCount: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: "#5B21B6",
  },
  emptyBucket: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
  },
  emptyBucketText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#475569",
    textAlign: "center",
    marginTop: 10,
  },
});

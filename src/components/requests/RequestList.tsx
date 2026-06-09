import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

import Fonts from "@/constants/Typography";
import { WorkRequest } from "@/src/types/workRequest";
import {
  formatRequestUserLabel,
  getWorkRequestGovernanceLabel,
  getWorkRequestGovernanceState,
  getWorkRequestStage,
} from "@/src/utils/workRequestLifecycle";

interface RequestListProps {
  data: WorkRequest[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  errorMessage?: string | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyMessage: string;
}

const stageTone = (request: WorkRequest) => {
  const stage = getWorkRequestStage(request);
  switch (stage) {
    case "approved":
      return { bg: "#EDE9FE", text: "#6D28D9", border: "#C4B5FD", label: "Approved" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5", label: "Rejected" };
    case "converted":
      return { bg: "#DCFCE7", text: "#166534", border: "#86EFAC", label: "Converted" };
    default:
      return { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", label: "Open" };
  }
};

const governanceTone = (request: WorkRequest) => {
  switch (getWorkRequestGovernanceState(request)) {
    case "breached":
      return { text: "#C2410C" };
    case "due-soon":
      return { text: "#7C2D12" };
    case "rejected":
      return { text: "#B91C1C" };
    case "converted":
      return { text: "#166534" };
    default:
      return { text: "#475569" };
  }
};

export default function RequestList({
  data,
  loading,
  refreshing,
  onRefresh,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyMessage,
}: RequestListProps) {
  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#742BDE" />
      </View>
    );
  }

  return (
    <FlashList
      data={data}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.listContainer, data.length === 0 && styles.emptyContainer]}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{errorMessage ? "Unable to load requests" : emptyTitle}</Text>
          <Text style={styles.emptyMessage}>{errorMessage || emptyMessage}</Text>
          {errorMessage && onRetry ? (
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      }
      renderItem={({ item, index }) => {
        const tone = stageTone(item);
        const governance = governanceTone(item);
        const linkedOrderNo = item.converted_order_no || item.converted_work_order_id?.order_no;

        return (
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
              index === data.length - 1 && { marginBottom: 120 },
            ]}
            onPress={() =>
              router.push({
                pathname: "/requestDetail",
                params: { data: JSON.stringify(item) },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleWrap}>
                <Text style={styles.kicker}>{item.request_no || "Work Request"}</Text>
                <Text style={styles.title}>{item.title || "Untitled Request"}</Text>
              </View>

              <View style={[styles.stageChip, { backgroundColor: tone.bg, borderColor: tone.border }]}>
                <Text style={[styles.stageChipText, { color: tone.text }]}>{tone.label}</Text>
              </View>
            </View>

            <Text style={styles.metaText}>
              {item.location_id?.location_name || "No location"}{item.asset_id?.asset_name ? ` | ${item.asset_id.asset_name}` : ""}
            </Text>
            <Text style={styles.metaText}>
              Requested by {formatRequestUserLabel(item.createdBy)} | {moment(item.createdAt).format("DD MMM YYYY")}
            </Text>
            <Text style={[styles.governanceText, { color: governance.text }]}>
              {getWorkRequestGovernanceLabel(item)}
            </Text>

            {linkedOrderNo ? (
              <View style={styles.linkedRow}>
                <Ionicons name="git-branch-outline" size={14} color="#166534" />
                <Text style={styles.linkedText}>{linkedOrderNo}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#F5F7FA",
  },
  emptyContainer: {
    justifyContent: "center",
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },
  retryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: "#4F46E5",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  titleWrap: {
    flex: 1,
  },
  kicker: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    color: "#7C3AED",
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: "#111827",
    lineHeight: 21,
  },
  metaText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 4,
  },
  governanceText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stageChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stageChipText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  linkedRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkedText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: "#166534",
  },
});

import Header from "@/components/global/Header";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Part, PartHistoryRecord } from "@/src/types/part";
import { getPartById, getPartHistory, updatePartStock } from "@/src/services/part.service";
import moment from "moment";
import {
  getPartAlternativeLocationCount,
  getPartHistoryActionLabel,
  getPartLocationCount,
  getPartNetworkQuantity,
  getPartPreferredStockSource,
  getPartStockState,
  getPartStockStateLabel,
  matchesPartHistoryFilter,
  PART_HISTORY_FILTERS,
  PartHistoryFilterId,
} from "@/src/utils/partInventory";
import { parseJsonRouteParam } from "@/src/utils/routeParams";

const STOCK_STATE_TONES = {
  out: { backgroundColor: "#FFF1F2", borderColor: "#FDA4AF", textColor: "#BE123C" },
  low: { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", textColor: "#C2410C" },
  healthy: { backgroundColor: "#ECFDF5", borderColor: "#86EFAC", textColor: "#166534" },
};

export default function partDetail() {
  const router = useRouter();
  const params: any = useLocalSearchParams();
  const data: Part = parseJsonRouteParam<Part>(params?.data, {} as Part) as Part;

  const [part, setPart] = useState<Part>(data);
  const [history, setHistory] = useState<PartHistoryRecord[]>([]);
  const [stockMode, setStockMode] = useState<"add" | "remove" | "set" | "transfer">("add");
  const [stockQty, setStockQty] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [selectedDestinationPartId, setSelectedDestinationPartId] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<PartHistoryFilterId>("all");

  const createdByName = part?.user
    ? `${part.user.firstName} ${part.user.lastName}`.trim()
    : part?.createdBy || "-";
  const updatedByName = createdByName || "-";
  const createdOn = part?.createdAt ? moment(part.createdAt).format("DD-MM-YYYY hh:mm A") : "-";
  const updatedOn = part?.updatedAt ? moment(part.updatedAt).format("DD-MM-YYYY hh:mm A") : "-";
  const stockQtyNumber = Number(stockQty);
  const partIdentifier = part?.id || part?._id || "";
  const stockLocations = Array.isArray(part?.stock_locations) ? part.stock_locations : [];
  const alternativeLocations = Array.isArray(part?.alternative_locations) ? part.alternative_locations : [];

  const stockState = getPartStockState(part);
  const stockTone = STOCK_STATE_TONES[stockState];
  const networkOnHand = getPartNetworkQuantity(part);
  const networkLocationCount = getPartLocationCount(part);
  const alternativeLocationCount = getPartAlternativeLocationCount(part);
  const preferredStockSource = getPartPreferredStockSource(part);
  const transferReadySourceCount = alternativeLocations.filter((entry) => Number(entry?.available_for_transfer || 0) > 0).length;

  const sortedTransferDestinations = useMemo(() => {
    return [...alternativeLocations].sort((first, second) => {
      const transferDiff = Number(second.available_for_transfer || 0) - Number(first.available_for_transfer || 0);
      if (transferDiff !== 0) return transferDiff;
      return Number(second.quantity || 0) - Number(first.quantity || 0);
    });
  }, [alternativeLocations]);

  const currentLocationEntry = useMemo(() => {
    const currentId = String(part?.id || part?._id || "");
    return stockLocations.find((entry) => String(entry.id) === currentId) || stockLocations[0] || null;
  }, [part?._id, part?.id, stockLocations]);

  const projectedQuantity = useMemo(() => {
    const current = Number(part?.quantity) || 0;
    if (!Number.isFinite(stockQtyNumber)) {
      return current;
    }

    switch (stockMode) {
      case "remove":
      case "transfer":
        return Math.max(current - stockQtyNumber, 0);
      case "set":
        return Math.max(stockQtyNumber, 0);
      case "add":
      default:
        return current + stockQtyNumber;
    }
  }, [part?.quantity, stockMode, stockQtyNumber]);

  const historyCounts = useMemo(() => {
    return PART_HISTORY_FILTERS.reduce<Record<PartHistoryFilterId, number>>((acc, filter) => {
      acc[filter.id] = history.filter((entry) => matchesPartHistoryFilter(entry, filter.id)).length;
      return acc;
    }, { all: history.length, stock: 0, transfers: 0, cycleCount: 0, setup: 0 });
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => matchesPartHistoryFilter(entry, historyFilter));
  }, [history, historyFilter]);

  const getPartDetails = useCallback(async () => {
    const partId = part?.id || part?._id || data?.id || data?._id;
    if (!partId) return;

    const [partRes, historyRes] = await Promise.allSettled([
      getPartById(partId),
      getPartHistory(partId),
    ]);

    if (partRes.status === "fulfilled" && partRes.value?.status) {
      const fresh = Array.isArray(partRes.value?.data) ? partRes.value.data?.[0] : partRes.value?.data;
      if (fresh) {
        setPart(fresh);
      }
    }

    if (historyRes.status === "fulfilled" && historyRes.value?.status) {
      setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
    } else {
      setHistory(Array.isArray(part?.recent_history) ? part.recent_history : []);
    }
  }, [data?._id, data?.id, part?._id, part?.id, part?.recent_history]);

  useEffect(() => {
    getPartDetails();
  }, [getPartDetails]);

  const handleStockMovement = async () => {
    if (!stockQty || !Number.isFinite(stockQtyNumber) || stockQtyNumber < 0 || (stockMode !== "set" && stockQtyNumber <= 0)) {
      ToastAndroid.show("Please enter a valid quantity", ToastAndroid.SHORT);
      return;
    }

    if ((stockMode === "remove" || stockMode === "transfer") && stockQtyNumber > Number(part?.quantity || 0)) {
      ToastAndroid.show("Requested quantity is higher than current stock", ToastAndroid.SHORT);
      return;
    }

    if (!stockNote.trim()) {
      ToastAndroid.show("A note or reason is required for stock changes", ToastAndroid.SHORT);
      return;
    }

    if (stockMode === "transfer" && !selectedDestinationPartId) {
      ToastAndroid.show("Please select a destination location for the transfer", ToastAndroid.SHORT);
      return;
    }

    if (savingStock || !partIdentifier) return;
    setSavingStock(true);

    try {
      const res = await updatePartStock(partIdentifier, {
        mode: stockMode,
        quantity: stockQtyNumber,
        note: stockNote.trim(),
        ...(stockMode === "transfer" ? { destination_part_id: selectedDestinationPartId } : {}),
      });

      if (res?.status) {
        setStockQty("");
        setStockNote("");
        setSelectedDestinationPartId("");
        ToastAndroid.show("Stock updated successfully!", ToastAndroid.SHORT);
        await getPartDetails();
        return;
      }

      ToastAndroid.show("Failed to update stock", ToastAndroid.SHORT);
    } catch (e: any) {
      ToastAndroid.show(e?.message || "Failed to update stock", ToastAndroid.SHORT);
    } finally {
      setSavingStock(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getPartDetails();
    } catch (e: any) {
    } finally {
      setRefreshing(false);
    }
  }, [getPartDetails]);

  const historyTone = (actionType?: string) => {
    switch (actionType) {
      case "stock-added":
      case "transfer-in":
      case "cycle-count-approved":
        return { bg: "#F6FFED", border: "#B7EB8F", text: "#135200" };
      case "stock-removed":
      case "transfer-out":
        return { bg: "#FFF7E6", border: "#FFD591", text: "#873800" };
      case "cycle-count-rejected":
        return { bg: "#FFF1F0", border: "#FFA39E", text: "#A8071A" };
      default:
        return { bg: "#FFFFFF", border: "#E2E8F0", text: "#334155" };
    }
  };

  const getHistorySecondaryLine = (entry: PartHistoryRecord): string | null => {
    const metadata = entry?.metadata || {};
    const actionType = String(entry?.action_type || "").trim();

    if (actionType === "updated" && Array.isArray(metadata?.changed_fields) && metadata.changed_fields.length > 0) {
      return `Changed: ${metadata.changed_fields.slice(0, 3).join(", ")}`;
    }

    if (actionType === "transfer-out" && metadata?.destination_location_name) {
      return `Moved to ${metadata.destination_location_name}`;
    }

    if (actionType === "transfer-in" && metadata?.source_location_name) {
      return `Received from ${metadata.source_location_name}`;
    }

    if (String(actionType).startsWith("cycle-count") && Number.isFinite(Number(metadata?.counted_quantity))) {
      return `Counted quantity: ${Number(metadata.counted_quantity)}`;
    }

    return null;
  };

  const getLocationBadgeTone = (quantity: number, minQuantity: number) => {
    if (quantity <= 0) {
      return { backgroundColor: "#FFF1F2", borderColor: "#FDA4AF", textColor: "#BE123C", label: "Out" };
    }
    if (quantity <= minQuantity) {
      return { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", textColor: "#C2410C", label: "Low" };
    }
    return { backgroundColor: "#ECFDF5", borderColor: "#86EFAC", textColor: "#166534", label: "Healthy" };
  };

  return (
    <>
      <Header title={part?.part_name || "Part Detail"} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.tableCard}>
          <View style={styles.partHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Part Details</Text>
              <Text style={styles.partNumberText}>#{part?.part_number || "-"}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: stockTone.backgroundColor, borderColor: stockTone.borderColor }]}>
              <Text style={[styles.statusChipText, { color: stockTone.textColor }]}>
                {getPartStockStateLabel(part)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Part Name</Text>
              <Text style={styles.value}>{part?.part_name || "-"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Part Type</Text>
              <Text style={styles.value}>{part?.part_type || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Unit</Text>
              <Text style={styles.value}>{part?.unit || "-"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{part?.location?.location_name || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Current Quantity</Text>
              <Text style={styles.value}>{part?.quantity ?? "-"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Minimum Quantity</Text>
              <Text style={styles.value}>{part?.min_quantity ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Cost</Text>
              <Text style={styles.value}>{part?.cost ?? "-"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Location Type</Text>
              <Text style={styles.value}>{part?.location?.location_type || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{part?.description || "-"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Created By</Text>
              <Text style={styles.value}>{createdByName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Created On</Text>
              <Text style={styles.value}>{createdOn}</Text>
            </View>
          </View>

          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.col}>
              <Text style={styles.label}>Updated By</Text>
              <Text style={styles.value}>{updatedByName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Updated On</Text>
              <Text style={styles.value}>{updatedOn}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inventory Coverage</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Current Stock</Text>
              <Text style={styles.metricValue}>{Number(part?.quantity || 0)} {part?.unit || ""}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Network Stock</Text>
              <Text style={styles.metricValue}>{networkOnHand} {part?.unit || ""}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Locations</Text>
              <Text style={styles.metricValue}>{networkLocationCount}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Alternates</Text>
              <Text style={styles.metricValue}>{alternativeLocationCount}</Text>
            </View>
          </View>

          {preferredStockSource ? (
            <View style={styles.preferredSourceBanner}>
              <Text style={styles.preferredSourceLabel}>Preferred alternate source</Text>
              <Text style={styles.preferredSourceTitle}>{preferredStockSource.location_name}</Text>
              <Text style={styles.preferredSourceMeta}>
                {preferredStockSource.quantity} {part?.unit || ""} on hand
                {Number(preferredStockSource.available_for_transfer || 0) > 0
                  ? `  •  ${preferredStockSource.available_for_transfer} transfer-ready`
                  : ""}
              </Text>
            </View>
          ) : null}

          {currentLocationEntry ? (
            <View style={styles.currentLocationBanner}>
              <Text style={styles.currentLocationLabel}>Current location balance</Text>
              <Text style={styles.currentLocationValue}>
                {currentLocationEntry.location_name} • {currentLocationEntry.quantity} {part?.unit || ""}
              </Text>
              <Text style={styles.currentLocationMeta}>
                Min {currentLocationEntry.min_quantity} • Reorder {currentLocationEntry.reorder_point ?? currentLocationEntry.min_quantity}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderInline}>
            <Text style={styles.sectionTitle}>Stock Locations</Text>
            <Text style={styles.sectionSubtle}>
              {transferReadySourceCount > 0 ? `${transferReadySourceCount} transfer-ready` : "Network overview"}
            </Text>
          </View>
          {stockLocations.length > 0 ? (
            stockLocations.map((locationEntry) => {
              const badgeTone = getLocationBadgeTone(Number(locationEntry.quantity || 0), Number(locationEntry.min_quantity || 0));
              const isCurrent = String(locationEntry.id) === String(part?.id || part?._id || "");
              return (
                <View key={locationEntry.id} style={styles.locationCard}>
                  <View style={styles.locationCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationTitle}>{locationEntry.location_name}</Text>
                      <Text style={styles.locationMeta}>{locationEntry.location_type || "Location"}</Text>
                    </View>
                    <View style={styles.locationBadgeRow}>
                      <View style={[styles.inlineChip, { backgroundColor: badgeTone.backgroundColor, borderColor: badgeTone.borderColor }]}>
                        <Text style={[styles.inlineChipText, { color: badgeTone.textColor }]}>{badgeTone.label}</Text>
                      </View>
                      {isCurrent ? (
                        <View style={[styles.inlineChip, styles.currentChip]}>
                          <Text style={[styles.inlineChipText, styles.currentChipText]}>Current</Text>
                        </View>
                      ) : null}
                      {!isCurrent && Number(locationEntry.available_for_transfer || 0) > 0 ? (
                        <View style={[styles.inlineChip, styles.transferChip]}>
                          <Text style={[styles.inlineChipText, styles.transferChipText]}>Transfer ready</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.locationMetricRow}>
                    <View style={styles.locationMetricBox}>
                      <Text style={styles.locationMetricLabel}>On Hand</Text>
                      <Text style={styles.locationMetricValue}>{locationEntry.quantity} {part?.unit || ""}</Text>
                    </View>
                    <View style={styles.locationMetricBox}>
                      <Text style={styles.locationMetricLabel}>Minimum</Text>
                      <Text style={styles.locationMetricValue}>{locationEntry.min_quantity} {part?.unit || ""}</Text>
                    </View>
                    <View style={styles.locationMetricBox}>
                      <Text style={styles.locationMetricLabel}>Transferable</Text>
                      <Text style={styles.locationMetricValue}>{Number(locationEntry.available_for_transfer || 0)} {part?.unit || ""}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.value}>No per-location stock data available.</Text>
          )}
        </View>

        <View style={styles.addStockCard}>
          <Text style={styles.sectionTitle}>Stock Movement</Text>
          <Text style={styles.sectionHelper}>
            Use add/remove/set for adjustments. Use transfer to move stock between locations carrying the same part.
          </Text>

          <View style={styles.modeRow}>
            {(["add", "remove", "set", "transfer"] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[styles.modeChip, stockMode === mode && styles.modeChipActive]}
                onPress={() => setStockMode(mode)}
              >
                <Text style={[styles.modeChipText, stockMode === mode && styles.modeChipTextActive]}>
                  {mode === "add" ? "Add" : mode === "remove" ? "Remove" : mode === "set" ? "Set" : "Transfer"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.addStockRow}>
            <Text style={styles.label}>
              {stockMode === "set"
                ? "New Quantity"
                : stockMode === "transfer"
                  ? "Transfer Quantity"
                  : `${stockMode === "add" ? "Add" : "Remove"} Quantity`}
            </Text>
            <TextInput
              style={styles.input}
              value={stockQty}
              onChangeText={setStockQty}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Reason / Note</Text>
          <TextInput
            style={styles.noteInput}
            value={stockNote}
            onChangeText={setStockNote}
            placeholder="Enter the reason for this stock change"
            placeholderTextColor="#9CA3AF"
            multiline
          />

          {stockMode === "transfer" ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.label}>Destination Location</Text>
              <Text style={styles.sectionHelper}>Pick the location that should receive this stock movement.</Text>
              {sortedTransferDestinations.length > 0 ? (
                sortedTransferDestinations.map((locationEntry) => {
                  const isSelected = selectedDestinationPartId === locationEntry.id;
                  return (
                    <Pressable
                      key={locationEntry.id}
                      style={[styles.destinationRow, isSelected && styles.destinationRowActive]}
                      onPress={() => setSelectedDestinationPartId(locationEntry.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.locationTitle}>{locationEntry.location_name}</Text>
                        <Text style={styles.locationMeta}>
                          {locationEntry.location_type || "Location"} • Qty {locationEntry.quantity} • Min {locationEntry.min_quantity}
                        </Text>
                        {Number(locationEntry.available_for_transfer || 0) > 0 ? (
                          <Text style={styles.destinationHint}>
                            Already has {locationEntry.available_for_transfer} {part?.unit || ""} above minimum
                          </Text>
                        ) : (
                          <Text style={styles.destinationHint}>No extra transfer-ready stock there right now</Text>
                        )}
                      </View>
                      {isSelected ? <FontAwesome6 name="check" size={12} color="#742BDE" /> : null}
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.value}>No alternative locations available for transfer.</Text>
              )}
            </View>
          ) : null}

          <View style={styles.newQtyRow}>
            <Text style={styles.newQtyText}>Projected Quantity: {projectedQuantity} {part?.unit || ""}</Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.closeBtn} onPress={() => router.back()}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <Pressable style={[styles.saveBtn, savingStock && styles.saveBtnDisabled]} onPress={handleStockMovement}>
              <Text style={styles.saveText}>{savingStock ? "Saving..." : "Submit"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderInline}>
            <Text style={styles.sectionTitle}>Part History</Text>
            <Text style={styles.sectionSubtle}>{filteredHistory.length} records</Text>
          </View>

          <View style={styles.filterChipRow}>
            {PART_HISTORY_FILTERS.map((filter) => {
              const isActive = historyFilter === filter.id;
              return (
                <Pressable
                  key={filter.id}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setHistoryFilter(filter.id)}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter.label} ({historyCounts[filter.id] || 0})
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredHistory.length > 0 ? (
            filteredHistory.map((entry, index) => {
              const tone = historyTone(entry.action_type);
              const secondaryLine = getHistorySecondaryLine(entry);
              return (
                <View
                  key={entry.id || entry._id || `${entry.action_type}-${index}`}
                  style={[styles.historyCard, { backgroundColor: tone.bg, borderColor: tone.border }]}
                >
                  <Text style={[styles.historyTitle, { color: tone.text }]}>
                    {getPartHistoryActionLabel(entry.action_type)}
                  </Text>
                  <Text style={styles.historyMeta}>
                    {entry.actor_name || "System"} • {moment(entry.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </Text>
                  <Text style={styles.historyDetail}>
                    Qty {entry.quantity ?? 0}
                    {entry.stock_before !== undefined || entry.stock_after !== undefined
                      ? ` • ${entry.stock_before ?? "-"} -> ${entry.stock_after ?? "-"}`
                      : ""}
                  </Text>
                  {entry.location_name ? <Text style={styles.historyDetail}>Location: {entry.location_name}</Text> : null}
                  {secondaryLine ? <Text style={styles.historyDetail}>{secondaryLine}</Text> : null}
                  {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
                </View>
              );
            })
          ) : (
            <Text style={styles.value}>No part history recorded for this filter yet.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 0.8,
    borderColor: "rgba(225, 232, 238, 0.80)",
    marginTop: 16,
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 0.8,
    borderColor: "rgba(225, 232, 238, 0.80)",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#742BDE",
    marginBottom: 6,
  },
  sectionHelper: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginBottom: 2,
  },
  sectionSubtle: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: "#E1E8EE",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  col: {
    flex: 1,
    gap: 4,
    paddingRight: 10,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  value: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#111827",
  },
  partHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  partNumberText: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: "47%",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  metricValue: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  preferredSourceBanner: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#EEF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
  },
  preferredSourceLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#1D4ED8",
  },
  preferredSourceTitle: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  preferredSourceMeta: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
  },
  currentLocationBanner: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#FCFCFD",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  currentLocationLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  currentLocationValue: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  currentLocationMeta: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  cardHeaderInline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  locationCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginTop: 10,
    backgroundColor: "#FCFCFD",
  },
  locationCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  locationBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
  },
  locationTitle: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#111827",
  },
  locationMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 3,
  },
  inlineChip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inlineChipText: {
    fontSize: 9,
    fontFamily: Fonts.medium,
  },
  currentChip: {
    backgroundColor: "#F3E8FF",
    borderColor: "#D8B4FE",
  },
  currentChipText: {
    color: "#7E22CE",
  },
  transferChip: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  transferChipText: {
    color: "#047857",
  },
  locationMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  locationMetricBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  locationMetricLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  locationMetricValue: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  closeBtn: {
    backgroundColor: "#6B7280",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#fff",
  },
  addStockCard: {
    marginTop: 16,
    backgroundColor: "#FFF7F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "#F3D7C8",
  },
  modeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D7DCE2",
  },
  modeChipActive: {
    backgroundColor: "#EFE4FF",
    borderColor: "#742BDE",
  },
  modeChipText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  modeChipTextActive: {
    color: "#742BDE",
    fontFamily: Fonts.medium,
  },
  addStockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },
  input: {
    minWidth: 90,
    borderWidth: 1,
    borderColor: "#BFD1FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#111827",
    backgroundColor: "#fff",
  },
  noteInput: {
    marginTop: 8,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#BFD1FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#111827",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  destinationRow: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  destinationRowActive: {
    borderColor: "#742BDE",
    backgroundColor: "#F7F1FF",
  },
  destinationHint: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  newQtyRow: {
    marginTop: 10,
    backgroundColor: "#FFF2E6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  newQtyText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#201F23",
  },
  saveBtn: {
    backgroundColor: "#742BDE",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#fff",
  },
  filterChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
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
  historyCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
  },
  historyMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
    marginTop: 4,
  },
  historyDetail: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
    marginTop: 4,
  },
  historyNote: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#1F2937",
    marginTop: 6,
  },
});

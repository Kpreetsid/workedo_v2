import Header from "@/components/global/Header";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, Text, Pressable, FlatList, TouchableOpacity, Alert, ToastAndroid } from "react-native";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { deletePart, getParts } from "@/src/services/part.service";
import CreateFAB from "@/components/global/CreateFAB";
import Popover from "react-native-popover-view";
import { Part } from "@/src/types/part";
import { Location } from "@/src/types/location";
import LocationPickerModal from "@/components/create-work-order/LocationPickerModal";
import {
  getPartAlternativeLocationCount,
  getPartLocationCount,
  getPartNetworkQuantity,
  getPartPreferredStockSource,
  getPartStockState,
  getPartStockStateLabel,
} from "@/src/utils/partInventory";

const STOCK_STATE_TONES = {
  out: { backgroundColor: "#FFF1F2", borderColor: "#FDA4AF", textColor: "#BE123C" },
  low: { backgroundColor: "#FFF7ED", borderColor: "#FDBA74", textColor: "#C2410C" },
  healthy: { backgroundColor: "#ECFDF5", borderColor: "#86EFAC", textColor: "#166534" },
};

export default function PartsInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchParts = useCallback(async (locationId?: string | null) => {
    try {
      const resp = await getParts(locationId || undefined);
      if (resp?.status) {
        setParts(Array.isArray(resp?.data) ? resp.data : []);
      }
    } catch (error) {
      console.log("error = ", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchParts(selectedLocation?.id);
    }, [fetchParts, selectedLocation?.id])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchParts(selectedLocation?.id);
    setRefreshing(false);
  }, [fetchParts, selectedLocation?.id]);

  const filteredParts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return parts;

    return parts.filter((part) => {
      const networkLocationNames = (part.stock_locations || []).map((location) => location?.location_name || "").join(" ");
      const searchableValues = [
        part.part_name,
        part.part_number,
        part.part_type,
        part.location?.location_name,
        String(part.quantity),
        String(getPartNetworkQuantity(part)),
        networkLocationNames,
      ];

      return searchableValues.some((value) =>
        (value || "").toString().toLowerCase().includes(q)
      );
    });
  }, [parts, searchQuery]);

  const summary = useMemo(() => {
    return filteredParts.reduce(
      (acc, part) => {
        const stockState = getPartStockState(part);
        const locationCount = getPartLocationCount(part);
        acc.total += 1;
        if (stockState === "out") acc.outOfStock += 1;
        if (stockState === "low") acc.lowStock += 1;
        if (locationCount > 1) acc.multiLocation += 1;
        return acc;
      },
      { total: 0, lowStock: 0, outOfStock: 0, multiLocation: 0 }
    );
  }, [filteredParts]);

  const handleDeletePart = useCallback(async (item: Part) => {
    Alert.alert(
      "Delete Part",
      `Are you sure you want to delete ${item?.part_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const resp = await deletePart(item?.id);
              if (resp?.status) {
                ToastAndroid.show("Part Deleted", ToastAndroid.SHORT);
                fetchParts(selectedLocation?.id);
              }
            } catch (e) {
              console.log("error deleting = ", e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [fetchParts, selectedLocation?.id]);

  const renderPartCard = ({ item }: { item: Part }) => {
    const stockState = getPartStockState(item);
    const tone = STOCK_STATE_TONES[stockState];
    const networkQuantity = getPartNetworkQuantity(item);
    const locationCount = getPartLocationCount(item);
    const alternateCount = getPartAlternativeLocationCount(item);
    const preferredSource = getPartPreferredStockSource(item);
    const transferReadyQuantity = Number(preferredSource?.available_for_transfer || 0);
    const transferHint = preferredSource
      ? transferReadyQuantity > 0
        ? `${preferredSource.location_name} can transfer ${transferReadyQuantity} ${item?.unit || ""}`.trim()
        : `${preferredSource.location_name} is the best alternate stock point`
      : "No alternate source suggested";

    return (
      <Pressable
        style={({ pressed }) => [
          styles.partInfoCard,
          pressed && styles.partInfoCardPressed,
        ]}
        onPress={() => router.push({
          pathname: "partDetail",
          params: { data: JSON.stringify(item) },
        })}
      >
        <View style={styles.partInfoBox}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.partName}>{item.part_name}</Text>
            <View style={[styles.statusChip, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
              <Text style={[styles.statusChipText, { color: tone.textColor }]}>
                {getPartStockStateLabel(item)}
              </Text>
            </View>
          </View>

          <View style={styles.makeRow}>
            <FontAwesome name="gears" size={12} color="#0F172A" style={styles.icon} />
            <Text style={styles.partInfo}>Type: {item.part_type || "-"}</Text>
          </View>

          <View style={styles.makeRow}>
            <Entypo name="location-pin" size={12} color="#0F172A" style={styles.icon} />
            <Text style={styles.partInfo}>Location: {item?.location?.location_name || "Unassigned"}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Current</Text>
              <Text style={styles.metricValue}>{Number(item.quantity || 0)} {item.unit || ""}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Network</Text>
              <Text style={styles.metricValue}>{networkQuantity} {item.unit || ""}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Locations</Text>
              <Text style={styles.metricValue}>{locationCount}</Text>
            </View>
          </View>

          <View style={styles.infoChipRow}>
            {locationCount > 1 ? (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{locationCount} locations</Text>
              </View>
            ) : null}
            {alternateCount > 0 ? (
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>{alternateCount} alternates</Text>
              </View>
            ) : null}
            {transferReadyQuantity > 0 ? (
              <View style={[styles.infoChip, styles.transferReadyChip]}>
                <Text style={[styles.infoChipText, styles.transferReadyChipText]}>
                  {transferReadyQuantity} transfer-ready
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.transferHint}>{transferHint}</Text>
        </View>

        <Popover
          popoverStyle={{ borderRadius: 15 }}
          isVisible={openPopoverId === item.id}
          onRequestClose={() => setOpenPopoverId(null)}
          from={(
            <TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(item.id)}>
              <Ionicons name="ellipsis-vertical" size={18} color="#201F23CC" />
            </TouchableOpacity>
          )}
        >
          <View style={styles.popoverContent}>
            {[
              { text: "Select Option", type: "heading" },
              { text: "Edit", type: "option" },
              { text: "Delete", type: "option" },
            ].map((option, index) => (
              <Pressable
                style={styles.popoverItem}
                key={`${item.id}-${option.text}`}
                onPress={() => {
                  if (index === 1) {
                    router.push({
                      pathname: "/createPart",
                      params: { data: JSON.stringify(item) },
                    });
                  } else if (index === 2) {
                    handleDeletePart(item);
                  }
                  setOpenPopoverId(null);
                }}
              >
                <Text
                  style={[
                    styles.popoverText,
                    option.type === "heading" ? styles.popoverHeading : undefined,
                  ]}
                >
                  {option.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Popover>
      </Pressable>
    );
  };

  return (
    <>
      <Header title="Parts Inventory" />
      <View style={styles.container}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <Pressable style={styles.filterRow} onPress={() => setLocationModalVisible(true)}>
          <View style={styles.filterLeft}>
            <Ionicons name="location-outline" size={16} color="#201F23CC" />
            <Text style={styles.filterText}>
              {selectedLocation?.location_name || "All Locations"}
            </Text>
          </View>
          {selectedLocation ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedLocation(null);
                fetchParts();
              }}
            >
              <Ionicons name="close-circle" size={18} color="#742BDE" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={18} color="#742BDE" />
          )}
        </Pressable>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Parts</Text>
            <Text style={styles.summaryValue}>{summary.total}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Low</Text>
            <Text style={styles.summaryValue}>{summary.lowStock}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Out</Text>
            <Text style={styles.summaryValue}>{summary.outOfStock}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Network</Text>
            <Text style={styles.summaryValue}>{summary.multiLocation}</Text>
          </View>
        </View>

        <FlatList
          data={filteredParts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderPartCard}
          contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No parts found</Text>
              <Text style={styles.emptyText}>Try a different search or location filter.</Text>
            </View>
          )}
        />
      </View>

      <CreateFAB label="Create Part" onPress={() => router.push("/createPart")} />

      <LocationPickerModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        comingFrom="partsInventory"
        onSelectLocation={(item) => {
          setSelectedLocation(item);
          fetchParts(item?.id || item?._id);
          setLocationModalVisible(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: "#F5F7FA",
  },
  filterRow: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 0.6,
    borderColor: "rgba(225, 232, 238, 0.60)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#201F23CC",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  partInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    borderWidth: 0.8,
    borderColor: "rgba(225, 232, 238, 0.55)",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  partInfoCardPressed: {
    backgroundColor: "#FBF8FF",
    borderColor: "#D8B4FE",
  },
  partInfoBox: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  partName: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  makeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  icon: {
    width: 20,
  },
  partInfo: {
    flex: 1,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#334155",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metricPill: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  metricValue: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  infoChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  infoChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoChipText: {
    fontSize: 9,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  transferReadyChip: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  transferReadyChipText: {
    color: "#047857",
  },
  transferHint: {
    marginTop: 10,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  popoverContent: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 10,
  },
  popoverItem: {
    width: 150,
    padding: 10,
  },
  popoverText: {
    color: "#71717A",
    fontFamily: Fonts.regular,
  },
  popoverHeading: {
    color: "#742BDE",
    fontFamily: Fonts.semiBold,
  },
  emptyState: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
});

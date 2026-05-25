import Header from "@/components/global/Header";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Part, PartHistoryRecord } from "@/src/types/part";
import { getPartById, getPartHistory, updatePartStock } from "@/src/services/part.service";
import moment from "moment";

export default function partDetail() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const data: Part = JSON.parse(params?.data);

	const [part, setPart] = useState(data);
	const [history, setHistory] = useState<PartHistoryRecord[]>([]);
	const [stockMode, setStockMode] = useState<"add" | "remove" | "set" | "transfer">("add");
	const [stockQty, setStockQty] = useState("");
	const [stockNote, setStockNote] = useState("");
	const [selectedDestinationPartId, setSelectedDestinationPartId] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [savingStock, setSavingStock] = useState(false);

	const createdByName = part?.user
		? `${part.user.firstName} ${part.user.lastName}`.trim()
		: part?.createdBy || "-";
	const updatedByName = createdByName || "-";
	const createdOn = part?.createdAt ? moment(part.createdAt).format("DD-MM-YYYY hh:mm A") : "-";
	const updatedOn = part?.updatedAt ? moment(part.updatedAt).format("DD-MM-YYYY hh:mm A") : "-";
	const stockQtyNumber = Number(stockQty);
	const alternativeLocations = Array.isArray(part?.alternative_locations) ? part.alternative_locations : [];

	const projectedQuantity = useMemo(() => {
		const current = Number(part?.quantity) || 0;
		if (!Number.isFinite(stockQtyNumber)) {
			return current;
		}

		switch (stockMode) {
			case "remove":
			case "transfer":
				return current - stockQtyNumber;
			case "set":
				return stockQtyNumber;
			case "add":
			default:
				return current + stockQtyNumber;
		}
	}, [part?.quantity, stockMode, stockQtyNumber]);

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

		if (!stockNote.trim()) {
			ToastAndroid.show("A note or reason is required for stock changes", ToastAndroid.SHORT);
			return;
		}

		if (stockMode === "transfer" && !selectedDestinationPartId) {
			ToastAndroid.show("Please select a destination location for the transfer", ToastAndroid.SHORT);
			return;
		}

		if (savingStock || !part?.id) return;
		setSavingStock(true);

		try {
			const res = await updatePartStock(part.id, {
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
			console.log(e);
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
			console.log(e);
		} finally {
			setRefreshing(false);
		}
	}, [getPartDetails]);

	const partHistoryLabels: Record<string, string> = {
		created: "Part created",
		updated: "Part updated",
		"stock-added": "Stock added",
		"stock-removed": "Stock removed",
		"stock-set": "Stock set",
		"transfer-out": "Transferred out",
		"transfer-in": "Transferred in",
		"cycle-count-submitted": "Cycle count submitted",
		"cycle-count-approved": "Cycle count approved",
		"cycle-count-rejected": "Cycle count rejected",
	};

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

	return (
		<>
			<Header title={part?.part_name || "Part Detail"} />
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
			>
				<View style={styles.tableCard}>
					<Text style={styles.sectionTitle}>Part Details</Text>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Part Name</Text>
							<Text style={styles.value}>{part?.part_name || "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Part Number</Text>
							<Text style={styles.value}>{part?.part_number || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Part Type</Text>
							<Text style={styles.value}>{part?.part_type || "-"}</Text>
						</View>
						<View style={styles.col}>
							<Text style={styles.label}>Unit</Text>
							<Text style={styles.value}>{part?.unit || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Quantity</Text>
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
							<Text style={styles.label}>Location Name</Text>
							<Text style={styles.value}>{part?.location?.location_name || "-"}</Text>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.col}>
							<Text style={styles.label}>Location Type</Text>
							<Text style={styles.value}>{part?.location?.location_type || "-"}</Text>
						</View>
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
					<Text style={styles.sectionTitle}>Stock Locations</Text>
					{Array.isArray(part?.stock_locations) && part.stock_locations.length > 0 ? (
						part.stock_locations.map((locationEntry) => (
							<View key={locationEntry.id} style={styles.locationRow}>
								<View style={{ flex: 1 }}>
									<Text style={styles.locationTitle}>{locationEntry.location_name}</Text>
									<Text style={styles.locationMeta}>
										Qty {locationEntry.quantity} - Min {locationEntry.min_quantity}
									</Text>
								</View>
								<Text style={styles.locationType}>{locationEntry.location_type || "Location"}</Text>
							</View>
						))
					) : (
						<Text style={styles.value}>No per-location stock data available.</Text>
					)}
				</View>

				<View style={styles.addStockCard}>
					<Text style={styles.sectionTitle}>Stock Movement</Text>

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
							{stockMode === "set" ? "New Quantity" : stockMode === "transfer" ? "Transfer Quantity" : `${stockMode === "add" ? "Add" : "Remove"} Quantity`}
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
							{alternativeLocations.length > 0 ? (
								alternativeLocations.map((locationEntry) => (
									<Pressable
										key={locationEntry.id}
										style={[styles.destinationRow, selectedDestinationPartId === locationEntry.id && styles.destinationRowActive]}
										onPress={() => setSelectedDestinationPartId(locationEntry.id)}
									>
										<View style={{ flex: 1 }}>
											<Text style={styles.locationTitle}>{locationEntry.location_name}</Text>
											<Text style={styles.locationMeta}>Qty {locationEntry.quantity}</Text>
										</View>
										{selectedDestinationPartId === locationEntry.id ? <FontAwesome6 name="check" size={12} color="#742BDE" /> : null}
									</Pressable>
								))
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
					<Text style={styles.sectionTitle}>Part History</Text>
					{history.length > 0 ? (
						history.map((entry, index) => {
							const tone = historyTone(entry.action_type);
							return (
								<View
									key={entry.id || entry._id || `${entry.action_type}-${index}`}
									style={[styles.historyCard, { backgroundColor: tone.bg, borderColor: tone.border }]}
								>
									<Text style={[styles.historyTitle, { color: tone.text }]}>
										{partHistoryLabels[entry.action_type] || "Activity"}
									</Text>
									<Text style={styles.historyMeta}>
										{entry.actor_name || "System"} - {moment(entry.createdAt).format("DD MMM YYYY, hh:mm A")}
									</Text>
									<Text style={styles.historyDetail}>
										Qty {entry.quantity ?? 0}
										{entry.stock_before !== undefined || entry.stock_after !== undefined
											? ` - ${entry.stock_before ?? "-"} -> ${entry.stock_after ?? "-"}`
											: ""}
									</Text>
									{entry.location_name ? <Text style={styles.historyDetail}>Location: {entry.location_name}</Text> : null}
									{entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
								</View>
							);
						})
					) : (
						<Text style={styles.value}>No part history recorded yet.</Text>
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
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.80)",
		marginTop: 16,
	},
	tableCard: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.80)",
	},
	sectionTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#742BDE",
		marginBottom: 6,
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
	actionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 16,
	},
	closeBtn: {
		backgroundColor: "#6B7280",
		borderRadius: 6,
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
		borderRadius: 8,
		padding: 12,
		borderWidth: 0.6,
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
		borderRadius: 6,
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
		borderRadius: 6,
		paddingHorizontal: 10,
		paddingVertical: 10,
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#111827",
		backgroundColor: "#fff",
		textAlignVertical: "top",
	},
	newQtyRow: {
		marginTop: 8,
		backgroundColor: "#FFF2E6",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 6,
	},
	newQtyText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	saveBtn: {
		backgroundColor: "#742BDE",
		borderRadius: 6,
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
	locationRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		borderTopWidth: 0.5,
		borderTopColor: "#E1E8EE",
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
	locationType: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
	},
	destinationRow: {
		marginTop: 8,
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		backgroundColor: "#fff",
		flexDirection: "row",
		alignItems: "center",
	},
	destinationRowActive: {
		borderColor: "#742BDE",
		backgroundColor: "#F7F1FF",
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

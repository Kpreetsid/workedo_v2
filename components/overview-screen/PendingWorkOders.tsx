import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { useEffect, useState } from "react";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { woPending } from "@/src/services/cmms.service";
import { WorkOrder } from "@/src/types/workOrder";
import moment from "moment";
import { useRouter } from "expo-router";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import { collectSelectedAssetIdsWithChildren, type SelectableTreeNode } from "@/src/utils/assetSelection";

export default function PendingWorkOrders() {
	const childAssets = useCMMSStore((state) => state.childAssets);
	const selectedAssets = useCMMSStore((state) => state.selectedAssets);

	const [pendingWO, setPendingWO] = useState<any[]>([]);
	const startDate = useDateRangeStore((state)=>state.startDate);
	const endDate = useDateRangeStore((state)=>state.endDate);
	const rangeVersion = useDateRangeStore((state)=>state.rangeVersion);

	useEffect(() => {
		if (selectedAssets.length > 0 && childAssets.length > 0) {
			fetchPendingWO();
			return;
		}
		setPendingWO([]);
	}, [selectedAssets, childAssets, startDate, endDate, rangeVersion])

	async function fetchPendingWO() {
		const startTimePart = "T19:00:00.000Z";
		const timePart = "T14:01:18.788Z";
		try {
			const selectedAssetsWithChildren = collectSelectedAssetIdsWithChildren(
				childAssets as SelectableTreeNode[],
				selectedAssets
			);
			const selectedAssetsFormatted = selectedAssetsWithChildren.join(",")
			if (!selectedAssetsFormatted) {
				setPendingWO([]);
				return;
			}


			let finalPayload: any = {};
			// prepare for payload
			if (startDate) {
				finalPayload.startDate = moment(startDate, "YYYY-MM-DD")
					.subtract(1, "day")
					.format("YYYY-MM-DD") + startTimePart;
			} else {
				finalPayload.startDate = moment().subtract(1, "week").format("YYYY-MM-DD") + startTimePart;
			}

			if (endDate) {
				finalPayload.endDate = endDate + timePart;
			} else {
				finalPayload.endDate = moment().format("YYYY-MM-DD") + timePart;
			}

			finalPayload.assetIds = selectedAssetsFormatted

			// console.log('final payload pending work orders = ', finalPayload);

			const res = await woPending(
				finalPayload.startDate,
				finalPayload.endDate,
				selectedAssetsFormatted
			);
			if (res?.status && Array.isArray(res?.data)) {
				// console.log('res = ', res?.data);
				setPendingWO(res?.data.reverse())
				return;
			}

			setPendingWO([]);
		} catch (e) {
			// console.log('e in status = ', e);
			setPendingWO([]);
		}
	}

	return (
		<>
			{
				pendingWO.length > 0 &&
				<FlatList
					ListHeaderComponent={<Text style={styles.cardTitle}>Pending Work Orders</Text>}
					data={pendingWO}
					keyExtractor={({ item, index }) => index}
					contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					renderItem={({ item }) => <WorkOrderCard item={item} />}
					showsVerticalScrollIndicator={false}
					scrollEnabled={false}
					ListEmptyComponent={<Text style={[styles.detailValue, { fontSize: 16, alignSelf: 'center', marginVertical: 10 }]}>No Pending Work Orders</Text>}
				/>
			}
		</>
	);
}

function WorkOrderCard({ item }: { item: WorkOrder }) {
	const router = useRouter();

	return (
		<View style={styles.card}>

			<View style={styles.headerRow}>
				<Text style={styles.title}>{item.title}</Text>

				<View style={styles.priorityBadge}>
					<Text style={styles.priorityText}>{item?.priority}</Text>
				</View>
			</View>

			<View style={styles.detailRow}>
				<Ionicons name="location-sharp" size={16} color="#000" />
				<Text style={styles.detailLabel}> Location:</Text>
				<Text style={styles.detailValue}> {item?.location?.location_name}</Text>
			</View>

			<View style={styles.detailRow}>
				<MaterialIcons name="settings" size={16} color="#000" />
				<Text style={styles.detailLabel}> Asset:</Text>
				<Text style={styles.detailValue}> {item?.asset?.asset_name}</Text>
			</View>

			<View style={styles.detailRow}>
				<FontAwesome5 name="users" size={14} color="#000" />
				<Text style={styles.detailLabel}> Assigned: </Text>
				<Text style={styles.detailValue}>
					{item?.assignedUsers?.map((user) => user.user.firstName).join(", ") || "N/A"}
				</Text>

			</View>

			<View style={styles.divider} />

			<View style={styles.footerRow}>
				<View style={styles.footerLeft}>
					<Feather name="calendar" size={16} color="#000" />
					<Text style={styles.footerDate}>{moment(item?.createdAt).format('DD/MM/YYYY hh:mm:ss')}</Text>
				</View>

				<TouchableOpacity style={styles.openButton} onPress={() => {
					router.push({
						pathname: "/workOrderDetail",
						params: { data: JSON.stringify(item) }
					});
				}}>
					<Text style={styles.openButtonText}>Open</Text>
					<Feather name="arrow-up-right" size={15} color="#7B2BFF" />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	cardTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 10
	},
	card: {
		backgroundColor: "#FFFFFF",
		padding: 16,
		borderRadius: 15,
		shadowColor: "#742BDE",
		shadowOpacity: 0.05,
		shadowRadius: 6,
		elevation: 1,
		borderWidth: 0.1,
		borderColor: "#742BDE",
	},

	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	title: {
		fontSize: 13,
		fontFamily: Fonts.semiBold,
		color: "#000",
	},
	priorityBadge: {
		backgroundColor: "#742BDE",
		paddingHorizontal: 20,
		paddingVertical: 5,
		borderRadius: 50,
		elevation: 1,
		borderWidth: 0.1,
		borderColor: "#742BDE",
	},
	priorityText: {
		color: "#FFF",
		fontFamily: Fonts.regular,
		fontSize: 11
	},

	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	detailLabel: {
		fontFamily: Fonts.semiBold,
		fontSize: 11,
		marginLeft: 5
	},
	detailValue: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#333",
		flexShrink: 1,
	},

	divider: {
		height: 1,
		borderBottomWidth: 2,
		borderBottomColor: "#EADCFD",
		borderStyle: "dashed",
		marginVertical: 10
	},

	footerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	footerLeft: {
		flexDirection: "row",
		alignItems: "center",
	},
	footerDate: {
		marginLeft: 6,
		fontSize: 10,
		fontFamily: Fonts.regular
	},

	openButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#D3B4FF50",
		paddingHorizontal: 20,
		paddingVertical: 8,
		borderRadius: 20,
	},
	openButtonText: {
		color: "#742BDE",
		fontFamily: Fonts.regular,
		fontSize: 10,
		marginRight: 5
	},
});

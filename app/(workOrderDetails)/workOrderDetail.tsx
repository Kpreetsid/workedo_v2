import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/global/Header";
import Detail from "@/components/work-order-detail/Detail";
import Comments from "@/components/work-order-detail/Comments";
import { Alert, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { WorkOrderCompleteIcon, WorkOrderInProgressIcon, WorkOrderOnHoldIcon, WorkOrderOpenIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { deleteWorkOrder, getWorkOrderDetails, updateWorkOrderStatus } from "@/src/services/work-order.service";
import { useCallback, useState } from "react";
import Popover from "react-native-popover-view";
import { Ionicons } from "@expo/vector-icons";
import { WorkOrder } from "@/src/types/workOrder";
import Tasks from "@/components/work-order-detail/Tasks";
import Forms from "@/components/work-order-detail/Forms";
import SegmentedPager from "@/components/global/SegmentPager";
import History from "@/components/work-order-detail/History";

const safeJsonParse = (value?: string) => {
	if (!value || typeof value !== "string") return null;

	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

export default function WorkOrderDetail() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const work_order_data = (() => {
		const parsed = safeJsonParse(params?.data);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
			return parsed;
		}

		if (params?.id) {
			return {
				id: params.id,
				composite_id: params?.composite_id,
			};
		}

		return {};
	})();

	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
	const [workOrderData, setWorkOrderData] = useState<any>(work_order_data);

	const normalizeStatus = (value?: string | null) => (value ?? "").toLowerCase().replace(/[-\s]/g, "");
	const isDoneStatus = ["completed", "done"].includes(normalizeStatus(workOrderData?.status));
	const hasTasks = Array.isArray(workOrderData?.tasks) && workOrderData.tasks.length > 0;
	const hasForms = Boolean(workOrderData?.sop_form_id);
	const isExecutionOwnedByChildren = Boolean(workOrderData?.hierarchy?.executionOwnedByChildren);
	const childSummary = workOrderData?.hierarchy?.childStatusSummary;

	const detailTabs = [
		{ label: "Details", component: <Detail params={workOrderData} /> },
		...(hasTasks ? [{ label: "Tasks", component: <Tasks params={workOrderData} /> }] : []),
		...(hasForms ? [{ label: "Forms", component: <Forms params={workOrderData} /> }] : []),
		{ label: "History", component: <History params={workOrderData} /> },
		{ label: "Comments", component: <Comments params={workOrderData} /> },
	];

	const popoverOptions = [
		{ icon: "", text: "Select Option", type: "heading" },
		...(!isDoneStatus ? [{ icon: "", text: "Edit", type: "option" }] : []),
		{ icon: "", text: "Create Follow-Up", type: "option" },
		{ icon: "", text: "Delete", type: "option" },
	];

	const fetchWorkOrderDetails = async () => {
		if (!workOrderData?.id) return;

		try {
			const res = await getWorkOrderDetails(workOrderData.id);
			const resolvedData = Array.isArray(res?.data) ? res.data[0] : res?.data;
			if (res?.status && resolvedData) {
				setWorkOrderData(resolvedData);
			}
		} catch (e) {
			console.log("fetch work order detail error =", e);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchWorkOrderDetails();
		}, [workOrderData?.id])
	);

	const handleDeleteWo = async (item: WorkOrder) => {
		Alert.alert(
			"Delete Work Order",
			`Are you sure you want to delete ${item.title}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const resp = await deleteWorkOrder(item?.id);
							if (resp?.status) {
								ToastAndroid.show("Work Order Deleted", ToastAndroid.SHORT);
								router.back();
							}
						} catch (e) {
							console.log("error deleting =", e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

	return (
		<View style={styles.container}>
			<Header title="Work Order Details" />
			<View style={styles.headerContainer}>
				<View style={styles.header}>
					<View>
						<Text style={styles.woId}># {workOrderData?.order_no}</Text>
						{workOrderData?.type ? <Text style={styles.woType}>{workOrderData?.type}</Text> : null}
						<Text style={styles.woTitle}>{workOrderData?.title}</Text>
					</View>

					<View>
						<Popover
							popoverStyle={{ borderRadius: 15 }}
							isVisible={openPopoverId === workOrderData.id}
							onRequestClose={() => setOpenPopoverId(null)}
							from={(
								<TouchableOpacity
									style={{ padding: 6 }}
									onPress={() => setOpenPopoverId(workOrderData.id)}
								>
									<Ionicons name="ellipsis-vertical" size={20} color="#fff" />
								</TouchableOpacity>
							)}
						>
							<View style={styles.popoverContent}>
								{popoverOptions.map((option, optionIndex) => (
									<Pressable
										style={styles.popoverItem}
										key={optionIndex}
										onPress={async () => {
											if (option.text === "Edit") {
												router.push({
													pathname: "/editWorkOrder",
													params: {
														data: JSON.stringify(workOrderData),
													},
												});
											} else if (option.text === "Create Follow-Up") {
												router.push({
													pathname: "/createWorkOrder",
													params: {
														data: JSON.stringify({
															...workOrderData,
															isFollowUp: true,
														}),
														mode: "follow-up",
													},
												});
											} else if (option.text === "Delete") {
												handleDeleteWo?.(workOrderData);
											}
											setOpenPopoverId(null);
										}}
									>
										<View style={{ flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "flex-start" }}>
											{option.icon !== "" ? <Ionicons name={option.icon as any} size={16} color="#71717A" /> : null}

											<Text
												style={[
													{ color: "#71717A", fontFamily: Fonts.regular },
													option.type === "heading" ? { color: "#742BDE", fontFamily: Fonts.semiBold } : {},
												]}
											>
												{option.text}
											</Text>
										</View>
									</Pressable>
								))}
							</View>
						</Popover>
					</View>
				</View>

				<View style={styles.statusTabs}>
					{["Open", "On Hold", "In Progress", "Completed"].map((status, index) => {
						const normalize = (str: string) => str?.toLowerCase().replace(/[-\s]/g, "");
						const isActive = normalize(workOrderData?.status) === normalize(status);

						const handleStatusChange = async () => {
							if (isActive || !workOrderData?.id) return;

							if (status === "In Progress" && isExecutionOwnedByChildren) {
								ToastAndroid.show("This parent work order uses child execution. Start progress on the child work orders instead.", ToastAndroid.LONG);
								return;
							}

							if (
								status === "Completed" &&
								isExecutionOwnedByChildren &&
								childSummary &&
								Number(childSummary.completed || 0) < Number(childSummary.total || 0)
							) {
								ToastAndroid.show("Complete all child work orders before completing the parent work order.", ToastAndroid.LONG);
								return;
							}

							try {
								const payload = { status: status === "Done" ? "Completed" : status.replace(/\s/g, "-") };
								const res = await updateWorkOrderStatus(workOrderData.id, payload);

								if (res?.status) {
									ToastAndroid.show("Status updated successfully!", ToastAndroid.SHORT);
									setWorkOrderData((prev: any) => ({ ...prev, status: payload.status }));
									fetchWorkOrderDetails();
								} else {
									ToastAndroid.show("Failed to update status.", ToastAndroid.SHORT);
								}
							} catch (err: any) {
								console.error("Error updating status:", err);
								ToastAndroid.show(err?.message || "Failed to update status", ToastAndroid.SHORT);
							}
						};

						return (
							<Pressable
								key={index}
								style={[styles.tab, isActive && styles.tabActive]}
								onPress={handleStatusChange}
							>
								<View style={styles.tabIcon}>
									{status === "Open" ? (
										<WorkOrderOpenIcon />
									) : status === "On Hold" ? (
										<WorkOrderOnHoldIcon />
									) : status === "In Progress" ? (
										<WorkOrderInProgressIcon />
									) : (
										<WorkOrderCompleteIcon />
									)}
								</View>

								<Text style={[styles.tabText, isActive && styles.tabTextActive]}>
									{status}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			<SegmentedPager tabs={detailTabs} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},
	headerContainer: {
		paddingTop: 12,
		paddingHorizontal: 15,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#742BDE",
		borderRadius: 8,
		padding: 16,
	},
	woId: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		backgroundColor: "#fff",
		alignSelf: "flex-start",
		paddingHorizontal: 5,
	},
	woType: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#EAEAEA",
		marginTop: 4,
	},
	woTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#fff",
		marginTop: 4,
		maxWidth: 260,
	},
	statusTabs: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginTop: 8,
	},
	tab: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		height: 60,
		borderRadius: 8,
		backgroundColor: "#F9FAF9",
		marginHorizontal: 4,
		borderColor: "#00000033",
		borderWidth: 0.6,
	},
	tabIcon: {
		height: 25,
		width: 25,
		alignItems: "center",
		justifyContent: "center",
	},
	tabActive: {
		backgroundColor: "#EFE4FF",
		borderWidth: 0,
	},
	tabText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		marginTop: 2,
		textAlign: "center",
	},
	tabTextActive: {
		color: "#742BDE",
		fontFamily: Fonts.medium,
	},
	popoverContent: {
		borderRadius: 20,
		backgroundColor: "#fff",
		padding: 10,
	},
	popoverItem: {
		width: 160,
		padding: 10,
	},
});

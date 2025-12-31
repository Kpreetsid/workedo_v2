import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/global/Header";
import Detail from "@/components/work-order-detail/Detail";
import Comments from "@/components/work-order-detail/Comments";
import SegmentedPager from "@/components/global/SegmentPager";
import { Alert, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { WorkOrderCompleteIcon, WorkOrderInProgressIcon, WorkOrderOnHoldIcon, WorkOrderOpenIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { deleteWorkOrder, getWorkOrderDetails, updateWorkOrderStatus } from "@/src/services/work-order.service";
import { useCallback, useEffect, useState } from "react";
import Popover from "react-native-popover-view";
import { Ionicons } from "@expo/vector-icons";
import { WorkOrder } from "@/src/types/workOrder";
import Tasks from "@/components/work-order-detail/Tasks";
import Forms from "@/components/work-order-detail/Forms";

export default function WorkOrderDetail() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const work_order_data = JSON.parse(params?.data);
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

	const [workOrderData, setWorkOrderData] = useState<any>(work_order_data);

	useFocusEffect(
		useCallback(() => {
			console.log('in focus order detail')
			fetchWorkOrderDetails();
		}, [])
	);

	const fetchWorkOrderDetails = async () => {
		try {
			console.log('work order id = ', work_order_data.id);
			const res = await getWorkOrderDetails(work_order_data.id);
			console.log('work order details = ', res);
			if (res?.status) {
				setWorkOrderData(res?.data[0]);
			}
		} catch (e) {
			console.log('e = ', e);
		}
	}

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
						console.log('deleting WO = ', item);
						// setDeleteLoading(true)
						try {
							const resp = await deleteWorkOrder(item?.id);
							console.log('resp = ', resp);
							if (resp?.status) {
								ToastAndroid.show("Work Order Deleted", ToastAndroid.SHORT);
								router.back();
								// setDeleteLoading(false)
							}
						} catch (e) {
							// setDeleteLoading(false)
							console.log('error deleting = ', e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	}

	return (
		<View style={styles.container}>
			<Header title="Work Order Details" />
			<View style={styles.headerContainer}>
				<View style={styles.header}>
					<View>
						<Text style={styles.woId}># {workOrderData?.order_no}</Text>
						{
							workOrderData?.type && <Text style={styles.woType}>{workOrderData?.type}</Text>
						}
						<Text style={styles.woTitle}>{workOrderData?.title}</Text>
					</View>

					<View>
						<Popover
							popoverStyle={{ borderRadius: 15 }}
							isVisible={openPopoverId === workOrderData.id}
							onRequestClose={() => setOpenPopoverId(null)}
							from={(
								<TouchableOpacity style={{ padding: 6 }} onPress={() => {
									console.log('in it = ', workOrderData);
									setOpenPopoverId(workOrderData.id)
								}}>
									<Ionicons name="ellipsis-vertical" size={20} color="#fff" />
								</TouchableOpacity>
							)}>
							<View style={styles.popoverContent}>
								{
									[
										{ icon: '', text: 'Select Option', type: 'heading' },
										{ icon: '', text: 'Edit', type: 'option' },
										{ icon: '', text: 'Delete', type: 'option' }
									].map((option, index) => {
										return (
											<Pressable
												style={styles.popoverItem}
												key={index}
												onPress={async () => {
													if (index === 1) {
														router.push({
															pathname: "/editWorkOrder",
															params: {
																data: JSON.stringify(workOrderData),
															},
														});
													} else if (index === 2) {
														console.log('in it delete = ', workOrderData);
														handleDeleteWo?.(workOrderData);
													}
													setOpenPopoverId(null)
												}}
											>
												<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
													{option.icon != '' && <Ionicons name={option.icon as any} size={16} color="#71717A" />}

													<Text style={
														[
															{ color: "#71717A", fontFamily: Fonts.regular },
															option.type == 'heading' ? { color: "#742BDE", fontFamily: Fonts.semiBold } : {}
														]
													}>
														{option.text}
													</Text>

													{/* {
														(deleteLoading && index === 3) && <ActivityIndicator size={"small"} color={"#71717A"} />
													} */}
												</View>
											</Pressable>
										);
									})
								}
							</View>
						</Popover>
					</View>
				</View>


				<View style={styles.statusTabs}>
					{["Open", "On Hold", "In Progress", "Completed"].map((status, index) => {
						const normalize = (str: string) => str?.toLowerCase().replace(/[-\s]/g, "");
						const isActive = normalize(workOrderData?.status) === normalize(status);

						const handleStatusChange = async () => {
							if (isActive) return;

							try {
								const payload = { status: status === "Done" ? "Completed" : status.replace(/\s/g, "-") }; // e.g. "On Hold" → "On-Hold"
								console.log("Updating status:", payload);

								const res = await updateWorkOrderStatus(workOrderData.id, payload);

								if (res?.status) {
									ToastAndroid.show("Status updated successfully!", ToastAndroid.SHORT);
									// optional: refresh locally
									setWorkOrderData((prev: any) => ({ ...prev, status: payload.status }));
								} else {
									ToastAndroid.show("Failed to update status.", ToastAndroid.SHORT);
								}
							} catch (err) {
								console.error("Error updating status:", err);
								ToastAndroid.show("Error updating status.", ToastAndroid.SHORT);
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

			<SegmentedPager tabs={[
				{ label: "Details", component: <Detail params={workOrderData} /> },
				{ label: "Tasks", component: <Tasks params={workOrderData} /> },
				{ label: "Forms", component: <Forms params={workOrderData} /> },
				{ label: "Comments", component: <Comments params={workOrderData} /> }
			]} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA"
	},
	headerContainer: {
		paddingTop: 12,
		paddingHorizontal: 15,
		// backgroundColor: "#fff"
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
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
		paddingHorizontal: 5
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
		justifyContent: "center"
	},
	tabActive: {
		backgroundColor: "#EFE4FF",
		borderWidth: 0
	},
	tabText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		marginTop: 2,
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
		width: 150,
		padding: 10,
	},
})

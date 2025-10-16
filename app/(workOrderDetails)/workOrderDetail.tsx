import { useLocalSearchParams } from "expo-router";
import Header from "@/components/global/Header";
import Detail from "@/components/work-order-detail/Detail";
import Comments from "@/components/work-order-detail/Comments";
import SegmentedPager from "@/components/global/SegmentPager";
import { Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { WorkOrderCompleteIcon, WorkOrderInProgressIcon, WorkOrderOnHoldIcon, WorkOrderOpenIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { updateWorkOrderStatus } from "@/src/services/work-order.service";
import { useState } from "react";

export default function WorkOrderDetail() {
	const params: any = useLocalSearchParams();
	const work_order_data = JSON.parse(params?.data);

	const [workOrderData, setWorkOrderData] = useState(work_order_data);

	return (
		<>
			<Header title="Work Order Details" />
			<View style={styles.headerContainer}>
				<View style={styles.header}>
					<Text style={styles.woId}># {workOrderData?.order_no}</Text>
					<Text style={styles.woType}>{workOrderData?.type}</Text>
					<Text style={styles.woTitle}>{workOrderData?.title}</Text>
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
				{ label: "Comments", component: <Comments comments={workOrderData?.comments} /> }
			]} />
		</>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		paddingTop: 12,
		paddingHorizontal: 15,
		// backgroundColor: "#fff"
	},
	header: {
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
	}
})

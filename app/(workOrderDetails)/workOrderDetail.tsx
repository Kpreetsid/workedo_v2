import { useLocalSearchParams } from "expo-router";
import Header from "@/components/global/Header";
import Detail from "@/components/work-order-detail/Detail";
import Comments from "@/components/work-order-detail/Comments";
import SegmentedPager from "@/components/global/SegmentPager";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { WorkOrderCompleteIcon, WorkOrderInProgressIcon, WorkOrderOnHoldIcon, WorkOrderOpenIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

export default function WorkOrderDetail() {
	const params = useLocalSearchParams();

	return (
		<>
			<Header title="Work Order Details" />
			<View style={styles.headerContainer}>
				<View style={styles.header}>
					<Text style={styles.woId}>{params.id}</Text>
					<Text style={styles.woType}>{params.type}</Text>
					<Text style={styles.woTitle}>{params.title}</Text>
				</View>


				<View style={styles.statusTabs}>
					{["Open", "On Hold", "In Progress", "Done"].map((status, index) => {
						const isActive = (params.priority === "Low" && status === "Open") || (params.priority === "Medium" && status === "In Progress") || (params.priority === "High" && status === "Done");

						return (
							<Pressable key={index} style={[styles.tab, isActive && styles.tabActive]}>
								<View style={styles.tabIcon}>
									{status === "Open" ? <WorkOrderOpenIcon /> : status === "On Hold" ? <WorkOrderOnHoldIcon /> : status === "In Progress" ? <WorkOrderInProgressIcon /> : <WorkOrderCompleteIcon />}
								</View>

								<Text style={[styles.tabText, isActive && styles.tabTextActive]}>{status}</Text>
							</Pressable>
						);
					})}
				</View>
			</View>

			<SegmentedPager tabs={[{ label: "Details", component: <Detail params={params} /> }, { label: "Comments", component: <Comments /> }]} />
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
		marginTop: 12,
		// marginBottom: 5,
		width: "100%"
	},
	tab: {
		alignItems: "center",
		justifyContent: "center",
		width: 86,
		height: 58,
		borderRadius: 8,
		backgroundColor: "#F9FAF9",
		marginHorizontal: 4,
		borderColor: "#00000033",
		borderWidth: 0.6
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

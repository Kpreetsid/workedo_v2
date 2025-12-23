import { Pressable, Text, View, StyleSheet } from "react-native";
import Fonts from "@/constants/Typography";
import { WorkOrderCardLogo } from "@/constants/IconProvider";
import { WorkOrder } from "@/src/types/workOrder";
import moment from "moment";
import { router } from "expo-router";
import { Image } from "expo-image";

const getPriorityColor = (priority: WorkOrder["priority"]) => {
	switch (priority) {
		case "Low":
			return { bg: "#3F009A40", text: "#742BDE" };
		case "Medium":
			return { bg: "#FF4D0040", text: "#D67B00" };
		case "High":
			return { bg: "#FF040042", text: "#D63928" };
		default:
			return { bg: "#eee", text: "#000" };
	}
};

const WorkOrderCard = ({
	item,
	isSelected,
	// onPress
}: { item: WorkOrder; isSelected?: boolean; }) => {
	// onPress: () => void;

	const priorityStyle = getPriorityColor(item.priority);

	const onCardPress = () => {
		// onPress();
		// isSelected && 
		router.push({
			pathname: "/workOrderDetail",
			params: { data: JSON.stringify(item) }
		});
	}

	return (
		<Pressable style={[styles.card, isSelected && styles.selectedCard]} onPress={onCardPress}>

			<View style={styles.leftSection}>
				<Text style={styles.id}>#{item?.order_no}</Text>
				<Text style={styles.title} numberOfLines={2}>{item?.title}</Text>
				<Text style={styles.subText}>Created On : {moment(item?.createdAt).format("DD MMM, YYYY")}</Text>
			</View>

			<View style={styles.rightSection}>
				{/* <WorkOrderCardLogo /> */}
				<Image source={require("../../assets/images/work_order.svg")} style={{ width: 40, height: 40 }} />

				<View style={styles.badgesRow}>
					<View style={[styles.statusBadge, { backgroundColor: item?.status === "Completed" ? "#00B227" : "#FFFFFF" }]}>
						<Text style={[styles.statusText, { color: item?.status === "Completed" ? "#fff" : "#343C6A" }]}>{item?.status}</Text>
					</View>

					<View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
						<Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item?.priority}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
};

export default WorkOrderCard;

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		shadowColor: "#0000000A",
		shadowOpacity: 0.04,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		borderWidth: 0.2,
		borderColor: "#0000004D",
		justifyContent: "space-between"
	},
	selectedCard: {
		borderColor: "#742BDE4D",
		borderWidth: 0.6,
		backgroundColor: "#742BDE14",
		shadowColor: "#0000000A",
		shadowOpacity: 0.15,
		shadowRadius: 10,
		elevation: 4,
	},
	id: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		marginBottom: 5,
		color: "#000000",
	},
	title: {
		fontFamily: Fonts.bold,
		fontSize: 12,
		height: 35,
		marginBottom: 2,
		color: "#000000",
	},
	subText: {
		fontSize: 9,
		color: "#555",
		marginBottom: 2,
		fontFamily: Fonts.light
	},
	leftSection: {
		flex: 6
	},
	rightSection: {
		flex: 4,
		alignItems: "flex-end",
		justifyContent: "space-between",
	},
	badgesRow: {
		flexDirection: "row",
		gap: 6,
	},
	statusBadge: {
		paddingVertical: 2,
		paddingHorizontal: 10,
		borderRadius: 2,
		borderWidth: 0.2,
		borderColor: "#3F009A99",
	},
	statusText: {
		fontSize: 9,
		fontFamily: Fonts.light,
	},
	priorityBadge: {
		paddingVertical: 2,
		paddingHorizontal: 10,
		borderRadius: 2,
	},
	priorityText: {
		fontSize: 9,
		color: "#000000",
		fontFamily: Fonts.light
	},
})
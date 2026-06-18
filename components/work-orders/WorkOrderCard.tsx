import { Pressable, StyleSheet, Text, View } from "react-native";
import moment from "moment";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Fonts from "@/constants/Typography";
import { WorkOrder } from "@/src/types/workOrder";
import { WorkOrderReadinessModel } from "@/src/utils/workOrderReadiness";
import { formatWorkOrderStatusLabel, getWorkOrderStatusTone } from "@/src/utils/workOrderStatus";
import { isAssignedToUser, isDueTodayWorkOrder, isOverdueWorkOrder } from "@/src/utils/workerWorkOrders";

const getPriorityColor = (priority: WorkOrder["priority"]) => {
	switch (priority) {
		case "Low":
			return "#742BDE";
		case "Medium":
			return "#D67B00";
		case "High":
		case "Urgent":
			return "#D63928";
		default:
			return "#334155";
	}
};

export default function WorkOrderCard({
	item,
	isSelected,
	variant = "default",
	readiness,
	plannerMeta,
	currentUser,
}: {
	item: WorkOrder;
	isSelected?: boolean;
	variant?: "default" | "planner" | "worker";
	readiness?: WorkOrderReadinessModel;
	plannerMeta?: {
		bucketLabel?: string;
		blockers?: string[];
		overdueDays?: number;
		taskSummary?: string;
		assigneeCount?: number;
		hierarchyBadge?: { label: string; tone: "parent" | "child" } | null;
		hierarchySummary?: string;
	};
	currentUser?: any;
}) {
	const statusTone = getWorkOrderStatusTone(item?.status);
	const priorityColor = getPriorityColor(item.priority);
	const assetName = item?.asset?.asset_name || "No asset";
	const locationName = item?.location?.location_name || "No location";
	const assignedToCurrentUser = isAssignedToUser(item, currentUser);
	const dueToday = isDueTodayWorkOrder(item);
	const overdue = isOverdueWorkOrder(item);
	const createdBy = item?.createdBy as
		| {
				firstName?: string;
				lastName?: string;
				username?: string;
		  }
		| undefined;
	const creatorLabel =
		`${createdBy?.firstName || ""} ${createdBy?.lastName || ""}`.trim() ||
		createdBy?.username ||
		"Unknown user";
	const dateLabel =
		item?.start_date && item?.end_date
			? `${moment(item.start_date).format("DD-MM-YYYY")} - ${moment(item.end_date).format("DD-MM-YYYY")}`
			: item?.end_date
				? moment(item.end_date).format("DD-MM-YYYY")
				: "-";

	const onCardPress = () => {
		router.push({
			pathname: "/workOrderDetail",
			params: { data: JSON.stringify(item) },
		});
	};

	return (
		<Pressable
			style={({ pressed }) => [styles.card, isSelected && styles.selectedCard, pressed && styles.pressedCard]}
			onPress={onCardPress}
		>
			<View style={styles.topRow}>
				<Text style={styles.id}>#{item?.order_no}</Text>

				<View style={styles.topRowRight}>
					<Text style={[styles.priorityText, { color: priorityColor }]}>{item?.priority}</Text>
					{/* <View style={[styles.statusDot, { borderColor: statusDotColor }]} /> */}
				</View>
			</View>

			<View style={styles.divider} />

			<Text style={styles.title} numberOfLines={2}>
				{item?.title}
			</Text>

			<View style={styles.metaLine}>
				<Ionicons name="location-outline" size={14} color="#667085" />
				<Text style={styles.metaText} numberOfLines={1}>
					{locationName}
				</Text>
				<Text style={styles.metaSeparator}>|</Text>
				<Ionicons name="briefcase-outline" size={14} color="#667085" />
				<Text style={styles.metaText} numberOfLines={1}>
					{assetName}
				</Text>
			</View>

			<View style={styles.metaLine}>
				<Ionicons name="person-outline" size={14} color="#667085" />
				<Text style={styles.metaText} numberOfLines={1}>
					{creatorLabel}
				</Text>
			</View>

			{(assignedToCurrentUser || dueToday || overdue || plannerMeta?.hierarchyBadge) ? (
				<View style={styles.metaRow}>
					{assignedToCurrentUser ? (
						<View style={[styles.metaChip, styles.infoChip]}>
							<Text style={[styles.metaChipText, styles.infoChipText]}>Assigned</Text>
						</View>
					) : null}

					{dueToday ? (
						<View style={[styles.metaChip, styles.warningChip]}>
							<Text style={[styles.metaChipText, styles.warningChipText]}>Due today</Text>
						</View>
					) : null}

					{overdue ? (
						<View style={[styles.metaChip, styles.dangerChip]}>
							<Text style={[styles.metaChipText, styles.dangerChipText]}>Overdue</Text>
						</View>
					) : null}

					{plannerMeta?.hierarchyBadge ? (
						<View
							style={[
								styles.metaChip,
								plannerMeta.hierarchyBadge.tone === "parent" ? styles.parentChip : styles.childChip,
							]}
						>
							<Text
								style={[
									styles.metaChipText,
									plannerMeta.hierarchyBadge.tone === "parent" ? styles.parentChipText : styles.childChipText,
								]}
							>
								{plannerMeta.hierarchyBadge.label}
							</Text>
						</View>
					) : null}
				</View>
			) : null}

			<View style={styles.divider} />

			<View style={styles.bottomRow}>
				<View style={[styles.statusBadge, { backgroundColor: statusTone.bg, borderColor: statusTone.border }]}>
					<Text style={[styles.statusText, { color: statusTone.text }]}>{formatWorkOrderStatusLabel(item?.status)}</Text>
				</View>

				<View style={styles.dateChip}>
					<Ionicons name="calendar-outline" size={14} color="#667085" />
					<Text style={styles.dateText} numberOfLines={1}>
						{dateLabel}
					</Text>
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#E4E7EC",
		shadowColor: "#0F172A",
		shadowOpacity: 0.03,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		gap: 10,
	},
	selectedCard: {
		borderColor: "#C084FC",
		backgroundColor: "#FCFAFF",
	},
	pressedCard: {
		backgroundColor: "#FAFBFF",
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	topRowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	id: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		color: "#667085",
	},
	priorityText: {
		fontFamily: Fonts.semiBold,
		fontSize: 11,
	},
	statusDot: {
		width: 18,
		height: 18,
		borderRadius: 999,
		borderWidth: 2,
	},
	divider: {
		height: 1,
		backgroundColor: "#EAECF0",
	},
	title: {
		fontFamily: Fonts.bold,
		fontSize: 16,
		lineHeight: 22,
		color: "#253858",
	},
	metaLine: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	metaText: {
		flexShrink: 1,
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: "#667085",
	},
	metaSeparator: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#98A2B3",
	},
	metaRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
	},
	metaChip: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 999,
	},
	metaChipText: {
		fontFamily: Fonts.medium,
		fontSize: 10,
	},
	infoChip: {
		backgroundColor: "#E0F2FE",
	},
	infoChipText: {
		color: "#075985",
	},
	warningChip: {
		backgroundColor: "#FEF3C7",
	},
	warningChipText: {
		color: "#92400E",
	},
	dangerChip: {
		backgroundColor: "#FEE2E2",
	},
	dangerChipText: {
		color: "#B91C1C",
	},
	parentChip: {
		backgroundColor: "#EEF2FF",
	},
	parentChipText: {
		color: "#4338CA",
	},
	childChip: {
		backgroundColor: "#FFF7ED",
	},
	childChipText: {
		color: "#C2410C",
	},
	bottomRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
	},
	statusBadge: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 999,
		borderWidth: 1,
	},
	statusText: {
		fontFamily: Fonts.medium,
		fontSize: 11,
	},
	dateChip: {
		maxWidth: "74%",
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 999,
		backgroundColor: "#F9F5FF",
		borderWidth: 1,
		borderColor: "#E9D7FE",
	},
	dateText: {
		flexShrink: 1,
		fontFamily: Fonts.semiBold,
		fontSize: 11,
		color: "#667085",
	},
});

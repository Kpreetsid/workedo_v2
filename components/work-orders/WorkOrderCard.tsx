import { Pressable, StyleSheet, Text, View } from "react-native";
import moment from "moment";
import { router } from "expo-router";
import { Image } from "expo-image";

import Fonts from "@/constants/Typography";
import { WorkOrder } from "@/src/types/workOrder";
import { WorkOrderReadinessModel, evaluateWorkOrderReadiness } from "@/src/utils/workOrderReadiness";
import { formatWorkOrderStatusLabel, getWorkOrderStatusTone } from "@/src/utils/workOrderStatus";
import { isAssignedToUser, isDueTodayWorkOrder, isOverdueWorkOrder } from "@/src/utils/workerWorkOrders";

const getPriorityColor = (priority: WorkOrder["priority"]) => {
	switch (priority) {
		case "Low":
			return { bg: "#3F009A40", text: "#742BDE" };
		case "Medium":
			return { bg: "#FF4D0040", text: "#D67B00" };
		case "High":
		case "Urgent":
			return { bg: "#FF040042", text: "#D63928" };
		default:
			return { bg: "#E2E8F0", text: "#334155" };
	}
};

const getReadinessTone = (state: WorkOrderReadinessModel["state"]) => {
	switch (state) {
		case "ready":
			return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
		case "attention":
			return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
		default:
			return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" };
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
	const priorityStyle = getPriorityColor(item.priority);
	const readinessModel = readiness || evaluateWorkOrderReadiness(item);
	const readinessTone = getReadinessTone(readinessModel.state);
	const blockerPreview = (plannerMeta?.blockers || readinessModel.blockers || []).slice(0, 2);
	const statusTone = getWorkOrderStatusTone(item?.status);
	const dueLabel = item?.end_date ? moment(item.end_date).format("DD MMM, YYYY") : "No due date";
	const assetName = item?.asset?.asset_name || "No asset";
	const locationName = item?.location?.location_name || "No location";
	const assignedToCurrentUser = isAssignedToUser(item, currentUser);
	const dueToday = isDueTodayWorkOrder(item);
	const overdue = isOverdueWorkOrder(item);

	const onCardPress = () => {
		router.push({
			pathname: "/workOrderDetail",
			params: { data: JSON.stringify(item) },
		});
	};

	return (
		<Pressable
			style={({ pressed }) => [
				styles.card,
				isSelected && styles.selectedCard,
				pressed && styles.pressedCard,
			]}
			onPress={onCardPress}
		>
			<View style={styles.leftSection}>
				<Text style={styles.id}>#{item?.order_no}</Text>
				<Text style={styles.title} numberOfLines={2}>
					{item?.title}
				</Text>
				<Text style={styles.subText}>Created on: {moment(item?.createdAt).format("DD MMM, YYYY")}</Text>
				<Text style={styles.executionMeta} numberOfLines={1}>
					{assetName} • {locationName}
				</Text>
				<Text style={styles.executionMeta}>Due: {dueLabel}</Text>

				<View style={styles.metaRow}>
					<View style={[styles.readinessPill, { backgroundColor: readinessTone.bg, borderColor: readinessTone.border }]}>
						<Text style={[styles.readinessText, { color: readinessTone.text }]}>
							{readinessModel.state === "ready" ? "Ready" : readinessModel.state === "attention" ? "Needs Review" : "Blocked"}
						</Text>
					</View>

					{variant === "worker" && assignedToCurrentUser ? (
						<View style={[styles.metaChip, styles.workerMetaChip]}>
							<Text style={[styles.metaChipText, styles.workerMetaChipText]}>Assigned to you</Text>
						</View>
					) : null}

					{variant === "worker" && dueToday ? (
						<View style={[styles.metaChip, styles.workerDueChip]}>
							<Text style={[styles.metaChipText, styles.workerDueChipText]}>Due today</Text>
						</View>
					) : null}

					{variant === "worker" && overdue ? (
						<View style={[styles.metaChip, styles.workerOverdueChip]}>
							<Text style={[styles.metaChipText, styles.workerOverdueChipText]}>Overdue</Text>
						</View>
					) : null}

					{plannerMeta?.bucketLabel ? (
						<View style={styles.metaChip}>
							<Text style={styles.metaChipText}>{plannerMeta.bucketLabel}</Text>
						</View>
					) : null}

					{plannerMeta?.hierarchyBadge ? (
						<View
							style={[
								styles.metaChip,
								plannerMeta.hierarchyBadge.tone === "parent" ? styles.metaChipParent : styles.metaChipChild,
							]}
						>
							<Text
								style={[
									styles.metaChipText,
									plannerMeta.hierarchyBadge.tone === "parent" ? styles.metaChipParentText : styles.metaChipChildText,
								]}
							>
								{plannerMeta.hierarchyBadge.label}
							</Text>
						</View>
					) : null}
				</View>

				<Text style={styles.readinessSummary} numberOfLines={2}>
					{readinessModel.summary}
				</Text>

				{variant === "planner" && plannerMeta?.hierarchySummary ? (
					<Text style={styles.plannerMetaText}>{plannerMeta.hierarchySummary}</Text>
				) : null}

				{variant === "planner" ? (
					<Text style={styles.plannerMetaText}>
						{plannerMeta?.assigneeCount || 0} assignee{(plannerMeta?.assigneeCount || 0) === 1 ? "" : "s"} •{" "}
						{plannerMeta?.taskSummary || "No checklist"}
						{plannerMeta?.overdueDays ? ` • ${plannerMeta.overdueDays}d overdue` : ""}
					</Text>
				) : null}

				{variant === "worker" ? (
					<Text style={styles.plannerMetaText} numberOfLines={2}>
						{readinessModel.executionReady
							? "Ready for field execution. Open the work order to log progress and completion details."
							: "Review blockers, schedule, parts, or procedure details before starting work."}
					</Text>
				) : null}

				{blockerPreview.length > 0 ? (
					<View style={styles.blockerWrap}>
						{blockerPreview.map((blocker) => (
							<View key={blocker} style={styles.blockerChip}>
								<Text style={styles.blockerChipText} numberOfLines={1}>
									{blocker}
								</Text>
							</View>
						))}
					</View>
				) : null}
			</View>

			<View style={styles.rightSection}>
				<Image source={require("../../assets/images/work_order.svg")} style={styles.icon} />

				<View style={styles.badgesRow}>
					<View style={[styles.statusBadge, { backgroundColor: statusTone.bg, borderColor: statusTone.border }]}>
						<Text style={[styles.statusText, { color: statusTone.text }]}>{formatWorkOrderStatusLabel(item?.status)}</Text>
					</View>

					<View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
						<Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item?.priority}</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		shadowColor: "#0000000A",
		shadowOpacity: 0.05,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		borderWidth: 0.5,
		borderColor: "#CBD5E1",
		justifyContent: "space-between",
	},
	selectedCard: {
		borderColor: "#742BDE4D",
		borderWidth: 1,
		backgroundColor: "#742BDE14",
		shadowOpacity: 0.15,
		shadowRadius: 10,
		elevation: 4,
	},
	pressedCard: {
		backgroundColor: "#F8FAFC",
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
		minHeight: 34,
		marginBottom: 2,
		color: "#000000",
	},
	subText: {
		fontSize: 9,
		color: "#555",
		marginBottom: 2,
		fontFamily: Fonts.light,
	},
	executionMeta: {
		fontSize: 9,
		color: "#475569",
		marginTop: 2,
		fontFamily: Fonts.medium,
	},
	metaRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 6,
	},
	readinessPill: {
		paddingVertical: 3,
		paddingHorizontal: 8,
		borderRadius: 999,
		borderWidth: 0.8,
	},
	readinessText: {
		fontSize: 9,
		fontFamily: Fonts.semiBold,
	},
	metaChip: {
		paddingVertical: 3,
		paddingHorizontal: 8,
		borderRadius: 999,
		backgroundColor: "#F1F5F9",
	},
	metaChipText: {
		fontSize: 9,
		fontFamily: Fonts.medium,
		color: "#475569",
	},
	metaChipParent: {
		backgroundColor: "#EEF2FF",
	},
	metaChipChild: {
		backgroundColor: "#FFF7ED",
	},
	metaChipParentText: {
		color: "#4338CA",
	},
	metaChipChildText: {
		color: "#C2410C",
	},
	workerMetaChip: {
		backgroundColor: "#E0F2FE",
	},
	workerMetaChipText: {
		color: "#075985",
	},
	workerDueChip: {
		backgroundColor: "#FEF3C7",
	},
	workerDueChipText: {
		color: "#92400E",
	},
	workerOverdueChip: {
		backgroundColor: "#FEE2E2",
	},
	workerOverdueChipText: {
		color: "#B91C1C",
	},
	readinessSummary: {
		fontSize: 9,
		color: "#475569",
		marginTop: 6,
		fontFamily: Fonts.regular,
		lineHeight: 13,
	},
	plannerMetaText: {
		fontSize: 9,
		color: "#64748B",
		marginTop: 4,
		fontFamily: Fonts.medium,
		lineHeight: 13,
	},
	blockerWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 6,
	},
	blockerChip: {
		maxWidth: "100%",
		paddingVertical: 3,
		paddingHorizontal: 8,
		borderRadius: 999,
		backgroundColor: "#FFF1F2",
	},
	blockerChipText: {
		fontSize: 9,
		fontFamily: Fonts.medium,
		color: "#BE123C",
	},
	leftSection: {
		flex: 6,
	},
	rightSection: {
		flex: 4,
		alignItems: "flex-end",
		justifyContent: "space-between",
		paddingLeft: 10,
	},
	icon: {
		width: 40,
		height: 40,
	},
	badgesRow: {
		flexDirection: "row",
		gap: 6,
		flexWrap: "wrap",
		justifyContent: "flex-end",
	},
	statusBadge: {
		paddingVertical: 2,
		paddingHorizontal: 10,
		borderRadius: 6,
		borderWidth: 0.8,
	},
	statusText: {
		fontSize: 9,
		fontFamily: Fonts.light,
	},
	priorityBadge: {
		paddingVertical: 2,
		paddingHorizontal: 10,
		borderRadius: 6,
	},
	priorityText: {
		fontSize: 9,
		fontFamily: Fonts.light,
	},
});

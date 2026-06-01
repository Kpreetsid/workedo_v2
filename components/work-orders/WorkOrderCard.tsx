import { Pressable, Text, View, StyleSheet } from "react-native";
import Fonts from "@/constants/Typography";
import { WorkOrderCardLogo } from "@/constants/IconProvider";
import { WorkOrder } from "@/src/types/workOrder";
import moment from "moment";
import { router } from "expo-router";
import { Image } from "expo-image";
import { WorkOrderReadinessModel } from "@/src/utils/workOrderReadiness";
import { evaluateWorkOrderReadiness } from "@/src/utils/workOrderReadiness";
import { formatWorkOrderStatusLabel, getWorkOrderStatusTone } from "@/src/utils/workOrderStatus";

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

const WorkOrderCard = ({
	item,
	isSelected,
	variant = "default",
	readiness,
	plannerMeta,
	// onPress
}: {
	item: WorkOrder;
	isSelected?: boolean;
	variant?: "default" | "planner";
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
}) => {
	// onPress: () => void;

	const priorityStyle = getPriorityColor(item.priority);
	const readinessModel = readiness || evaluateWorkOrderReadiness(item);
	const readinessTone = getReadinessTone(readinessModel.state);
	const blockerPreview = (plannerMeta?.blockers || readinessModel.blockers || []).slice(0, 2);
	const statusTone = getWorkOrderStatusTone(item?.status);

	const onCardPress = () => {
		// onPress();
		// isSelected && 
		router.push({
			pathname: "/workOrderDetail",
			params: { data: JSON.stringify(item) }
		});
	}

	return (
		<Pressable style={({ pressed }) => [
			styles.card,
			isSelected && styles.selectedCard,
			pressed && {backgroundColor: '#fadb7d'},
		]} onPress={onCardPress}>

			<View style={styles.leftSection}>
				<Text style={styles.id}>#{item?.order_no}</Text>
				<Text style={styles.title} numberOfLines={2}>{item?.title}</Text>
				<Text style={styles.subText}>Created On : {moment(item?.createdAt).format("DD MMM, YYYY")}</Text>
				<View style={styles.metaRow}>
					<View style={[styles.readinessPill, { backgroundColor: readinessTone.bg, borderColor: readinessTone.border }]}>
						<Text style={[styles.readinessText, { color: readinessTone.text }]}>
							{readinessModel.state === "ready" ? "Ready" : readinessModel.state === "attention" ? "Needs Review" : "Blocked"}
						</Text>
					</View>
					{plannerMeta?.bucketLabel ? (
						<View style={styles.metaChip}>
							<Text style={styles.metaChipText}>{plannerMeta.bucketLabel}</Text>
						</View>
					) : null}
					{plannerMeta?.hierarchyBadge ? (
						<View style={[styles.metaChip, plannerMeta.hierarchyBadge.tone === "parent" ? styles.metaChipParent : styles.metaChipChild]}>
							<Text style={[styles.metaChipText, plannerMeta.hierarchyBadge.tone === "parent" ? styles.metaChipParentText : styles.metaChipChildText]}>
								{plannerMeta.hierarchyBadge.label}
							</Text>
						</View>
					) : null}
				</View>
				<Text style={styles.readinessSummary} numberOfLines={2}>{readinessModel.summary}</Text>
				{variant === "planner" && plannerMeta?.hierarchySummary ? (
					<Text style={styles.plannerMetaText}>{plannerMeta.hierarchySummary}</Text>
				) : null}
				{variant === "planner" ? (
					<Text style={styles.plannerMetaText}>
						{plannerMeta?.assigneeCount || 0} assignee{(plannerMeta?.assigneeCount || 0) === 1 ? "" : "s"} • {plannerMeta?.taskSummary || "No checklist"}
						{plannerMeta?.overdueDays ? ` • ${plannerMeta.overdueDays}d overdue` : ""}
					</Text>
				) : null}
				{blockerPreview.length > 0 ? (
					<View style={styles.blockerWrap}>
						{blockerPreview.map((blocker) => (
							<View key={blocker} style={styles.blockerChip}>
								<Text style={styles.blockerChipText} numberOfLines={1}>{blocker}</Text>
							</View>
						))}
					</View>
				) : null}
			</View>

			<View style={styles.rightSection}>
				{/* <WorkOrderCardLogo /> */}
					<Image source={require("../../assets/images/work_order.svg")} style={{ width: 40, height: 40 }} />

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
	metaRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 4,
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
	readinessSummary: {
		fontSize: 9,
		color: "#475569",
		marginTop: 5,
		fontFamily: Fonts.regular,
		lineHeight: 13,
	},
	plannerMetaText: {
		fontSize: 9,
		color: "#64748B",
		marginTop: 4,
		fontFamily: Fonts.medium,
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

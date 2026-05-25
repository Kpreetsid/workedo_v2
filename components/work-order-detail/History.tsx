import Fonts from "@/constants/Typography";
import { getWorkOrderActivity, getWorkOrderHistory } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { WorkOrderActivityRecord } from "@/src/types/workOrderActivity";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
	params: WorkOrder;
}

const activityLabels: Record<string, string> = {
	created: "Work Order Created",
	updated: "Details Updated",
	"status-changed": "Status Changed",
	"assignees-updated": "Assignees Updated",
	"parts-updated": "Parts Updated",
	"procedures-updated": "Procedures Updated",
	"execution-updated": "Execution Updated",
	"tasks-updated": "Tasks Updated",
	"attachments-added": "Attachments Added",
	"sop-submitted": "SOP / Checklist Updated",
	"comment-added": "Comment Added",
	"comment-updated": "Comment Updated",
	"comment-deleted": "Comment Deleted",
	"child-created": "Child Work Order Created",
	deleted: "Work Order Deleted",
};

const activityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
	created: "add-circle-outline",
	updated: "create-outline",
	"status-changed": "sync-outline",
	"assignees-updated": "people-outline",
	"parts-updated": "cube-outline",
	"procedures-updated": "checkmark-done-outline",
	"execution-updated": "time-outline",
	"tasks-updated": "list-outline",
	"attachments-added": "attach-outline",
	"sop-submitted": "document-text-outline",
	"comment-added": "chatbubble-outline",
	"comment-updated": "chatbox-ellipses-outline",
	"comment-deleted": "trash-outline",
	"child-created": "git-branch-outline",
	deleted: "close-circle-outline",
};

const getActivityDetails = (entry: WorkOrderActivityRecord): string[] => {
	const metadata = entry?.metadata || {};
	const details: string[] = [];
	const actionType = String(entry?.action_type || "").trim();

	if (Array.isArray(metadata?.changed_fields) && metadata.changed_fields.length) {
		details.push(`Changed: ${metadata.changed_fields.join(", ")}`);
	}

	if (metadata?.from_status || metadata?.to_status) {
		details.push(`Status: ${metadata.from_status || "-"} -> ${metadata.to_status || "-"}`);
	}

	if (Array.isArray(metadata?.added_ids) && metadata.added_ids.length) {
		details.push(`${metadata.added_ids.length} assignee(s) added`);
	}

	if (Array.isArray(metadata?.removed_ids) && metadata.removed_ids.length) {
		details.push(`${metadata.removed_ids.length} assignee(s) removed`);
	}

	if (metadata?.before?.lineCount !== undefined || metadata?.after?.lineCount !== undefined) {
		details.push(`Part lines: ${metadata?.before?.lineCount ?? 0} -> ${metadata?.after?.lineCount ?? 0}`);
	}

	if (metadata?.before?.plannedQuantity !== undefined || metadata?.after?.plannedQuantity !== undefined) {
		details.push(`Planned qty: ${metadata?.before?.plannedQuantity ?? 0} -> ${metadata?.after?.plannedQuantity ?? 0}`);
	}

	if (metadata?.before?.submitted !== undefined || metadata?.after?.submitted !== undefined) {
		details.push(`Procedures submitted: ${metadata?.after?.submitted ?? 0}/${metadata?.after?.total ?? 0}`);
	}

	if (metadata?.before?.laborCount !== undefined || metadata?.after?.laborCount !== undefined) {
		details.push(`Labor entries: ${metadata?.before?.laborCount ?? 0} -> ${metadata?.after?.laborCount ?? 0}`);
	}

	if (metadata?.before?.actualTime !== undefined || metadata?.after?.actualTime !== undefined) {
		details.push(`Actual time: ${metadata?.before?.actualTime ?? 0}h -> ${metadata?.after?.actualTime ?? 0}h`);
	}

	if (metadata?.before?.completed !== undefined || metadata?.after?.completed !== undefined) {
		details.push(`Tasks completed: ${metadata?.after?.completed ?? 0}/${metadata?.after?.total ?? 0}`);
	}

	if (metadata?.count) {
		details.push(`Count: ${metadata.count}`);
	}

	if (Array.isArray(metadata?.file_names) && metadata.file_names.length) {
		details.push(`Files: ${metadata.file_names.join(", ")}`);
	}

	if (metadata?.preview && ["comment-added", "comment-updated", "comment-deleted"].includes(actionType)) {
		details.push(`Comment: ${metadata.preview}`);
	}

	if (metadata?.child_order_no) {
		details.push(`Child WO: ${metadata.child_order_no}`);
	}

	return details.filter(Boolean);
};

const getHistorySnapshotDetails = (entry: Record<string, any>) => {
	const details: string[] = [];
	const interestingFields: Array<[string, string]> = [
		["status", "Status"],
		["priority", "Priority"],
		["type", "Type"],
		["nature_of_work", "Nature"],
		["estimated_time", "Est. hours"],
		["end_date", "Due date"],
	];

	interestingFields.forEach(([field, label]) => {
		const value = entry?.[field];
		if (value === undefined || value === null || value === "") {
			return;
		}

		if (field === "end_date") {
			details.push(`${label}: ${moment(value).isValid() ? moment(value).format("DD MMM YYYY") : value}`);
			return;
		}

		details.push(`${label}: ${value}`);
	});

	return details;
};

const getTone = (actionType?: string) => {
	switch (actionType) {
		case "created":
		case "child-created":
			return { bg: "#F6FFED", border: "#B7EB8F", text: "#135200", icon: "#389E0D" };
		case "status-changed":
		case "execution-updated":
		case "sop-submitted":
			return { bg: "#E6F4FF", border: "#91CAFF", text: "#003A8C", icon: "#1677FF" };
		case "parts-updated":
			return { bg: "#FFF7E6", border: "#FFD591", text: "#873800", icon: "#FA8C16" };
		case "comment-deleted":
		case "deleted":
			return { bg: "#FFF1F0", border: "#FFA39E", text: "#A8071A", icon: "#F5222D" };
		default:
			return { bg: "#F5F7FA", border: "#D9E2EC", text: "#3D4A5C", icon: "#64748B" };
	}
};

export default function History({ params }: Props) {
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [activity, setActivity] = useState<WorkOrderActivityRecord[]>([]);
	const [history, setHistory] = useState<any[]>([]);

	const fetchAuditData = useCallback(async (showLoader = true) => {
		if (!params?.id) {
			setLoading(false);
			setRefreshing(false);
			return;
		}

		if (showLoader) {
			setLoading(true);
		}

		try {
			const [activityRes, historyRes] = await Promise.allSettled([
				getWorkOrderActivity(params.id),
				getWorkOrderHistory(params.id),
			]);

			if (activityRes.status === "fulfilled" && activityRes.value?.status) {
				setActivity(Array.isArray(activityRes.value.data) ? activityRes.value.data : []);
			} else {
				setActivity([]);
			}

			if (historyRes.status === "fulfilled" && historyRes.value?.status) {
				setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
			} else {
				setHistory([]);
			}
		} catch (error) {
			setActivity([]);
			setHistory([]);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [params?.id]);

	useEffect(() => {
		fetchAuditData();
	}, [fetchAuditData]);

	if (loading) {
		return (
			<View style={styles.loaderWrap}>
				<ActivityIndicator size="small" color="#742BDE" />
				<Text style={styles.loaderText}>Loading activity...</Text>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.content}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={() => {
						setRefreshing(true);
						fetchAuditData(false);
					}}
				/>
			}
		>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Activity Trail</Text>
				<Text style={styles.sectionSubtitle}>Tracked work order actions from the current workflow.</Text>

				{activity.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyText}>No work order activity recorded yet.</Text>
					</View>
				) : (
					activity.map((entry, index) => {
						const tone = getTone(entry.action_type);
						const details = getActivityDetails(entry);
						return (
							<View key={entry.id || entry._id || `${entry.action_type}-${index}`} style={[styles.timelineCard, { backgroundColor: tone.bg, borderColor: tone.border }]}>
								<View style={styles.timelineHeader}>
									<View style={styles.iconWrap}>
										<Ionicons name={activityIcons[entry.action_type] || "time-outline"} size={16} color={tone.icon} />
									</View>
									<View style={styles.timelineHeaderText}>
										<Text style={[styles.timelineTitle, { color: tone.text }]}>{activityLabels[entry.action_type] || "Activity"}</Text>
										<Text style={styles.timelineMeta}>
											{entry.actor_name || "System"} - {moment(entry.createdAt).format("DD MMM YYYY, hh:mm A")}
										</Text>
									</View>
								</View>

								<Text style={styles.timelineNote}>{entry.note || "No note provided."}</Text>
								{details.map((detail) => (
									<Text key={detail} style={styles.timelineDetail}>- {detail}</Text>
								))}
							</View>
						);
					})
				)}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Version History</Text>
				<Text style={styles.sectionSubtitle}>Saved snapshots of work order record changes.</Text>

				{history.length === 0 ? (
					<View style={styles.emptyCard}>
						<Text style={styles.emptyText}>No saved history snapshots found for this work order.</Text>
					</View>
				) : (
					history.map((entry, index) => {
						const details = getHistorySnapshotDetails(entry);
						const actorName = entry?.updatedBy
							? `${entry.updatedBy?.firstName || ""} ${entry.updatedBy?.lastName || ""}`.trim()
							: entry?.history_created_by
								? `${entry.history_created_by?.firstName || ""} ${entry.history_created_by?.lastName || ""}`.trim()
								: "System";

						return (
							<View key={entry.id || entry._id || `snapshot-${index}`} style={styles.snapshotCard}>
								<Text style={styles.snapshotTitle}>
									{moment(entry?.history_created_at || entry?.updatedAt || entry?.createdAt).format("DD MMM YYYY, hh:mm A")}
								</Text>
								<Text style={styles.snapshotMeta}>{actorName || "System"}</Text>
								{details.length > 0 ? (
									details.map((detail) => (
										<Text key={detail} style={styles.snapshotDetail}>- {detail}</Text>
									))
								) : (
									<Text style={styles.snapshotDetail}>- Snapshot captured for this update.</Text>
								)}
							</View>
						);
					})
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},
	content: {
		paddingHorizontal: 18,
		paddingVertical: 14,
		paddingBottom: 32,
	},
	loaderWrap: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
	},
	loaderText: {
		marginTop: 8,
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#475569",
	},
	section: {
		marginBottom: 18,
	},
	sectionTitle: {
		fontSize: 13,
		fontFamily: Fonts.semiBold,
		color: "#111827",
	},
	sectionSubtitle: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
		marginBottom: 10,
	},
	emptyCard: {
		padding: 14,
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	emptyText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#64748B",
	},
	timelineCard: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		marginBottom: 10,
	},
	timelineHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	iconWrap: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	timelineHeaderText: {
		flex: 1,
	},
	timelineTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
	},
	timelineMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#475569",
		marginTop: 2,
	},
	timelineNote: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#1E293B",
		marginBottom: 6,
	},
	timelineDetail: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#334155",
		marginBottom: 3,
	},
	snapshotCard: {
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
		padding: 12,
		marginBottom: 10,
	},
	snapshotTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#111827",
	},
	snapshotMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
		marginBottom: 6,
	},
	snapshotDetail: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#334155",
		marginBottom: 3,
	},
});

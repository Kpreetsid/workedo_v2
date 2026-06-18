import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import Fonts from "@/constants/Typography";
import { useState } from "react";
import AssignedUsersModal from "./AssignUserModal";
import PartsInfoModal from "./PartsInfoModal";
import MoreInfoModal from "./MoreInfoModal";
import { WorkOrder } from "@/src/types/workOrder";
import { endpoints } from "@/src/api/endpoints";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { evaluateWorkOrderReadiness } from "@/src/utils/workOrderReadiness";
import { formatWorkOrderStatusLabel, getWorkOrderStatusTone } from "@/src/utils/workOrderStatus";
import { useAuthStore } from "@/src/store/useAuthStore";
import { isAssignedToUser, isDueTodayWorkOrder, isOverdueWorkOrder } from "@/src/utils/workerWorkOrders";

interface Props {
	params: WorkOrder;
	onSaved?: () => void;
}

export default function Detail({ params, onSaved }: Props) {
	const router = useRouter();
	const { user } = useAuthStore();
	const [userModalVisible, setUserModalVisible] = useState(false);
	const [partsModalVisible, setPartsModalVisible] = useState(false);
	const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);

	const assignedUsers = Array.isArray(params?.assignedUsers) ? params.assignedUsers : [];
	const childOrders = Array.isArray(params?.childOrders) ? params.childOrders : [];
	const procedures = Array.isArray(params?.procedure_entries)
		? params.procedure_entries
		: Array.isArray(params?.procedures)
			? params.procedures
			: [];

	const assignedUserNames = assignedUsers
		.map((entry) => [entry?.user?.firstName, entry?.user?.lastName].filter(Boolean).join(" "))
		.filter(Boolean)
		.join(", ") || "N/A";

	const requestedBy = params?.createdBy && typeof params.createdBy === "object"
		? [params.createdBy.firstName, params.createdBy.lastName].filter(Boolean).join(" ")
		: "--";

	const createdOn = params?.createdAt ? moment(params.createdAt).format("DD/MM/YYYY hh:mm A") : "--";
	const estimatedTime = params?.estimated_time?.toString() || "--";
	const childSummary = params?.hierarchy?.childStatusSummary;
	const remainingChildren = Math.max(Number(childSummary?.total || 0) - Number(childSummary?.completed || 0), 0);
	const childProgressPercent = childSummary?.total ? Math.round((Number(childSummary?.completed || 0) / Number(childSummary.total || 1)) * 100) : 0;
	const parentReference = params?.parentOrder || params?.hierarchy?.parentReference;
	const readiness = evaluateWorkOrderReadiness(params);
	const statusTone = getWorkOrderStatusTone(params?.status);
	const assignedToCurrentUser = isAssignedToUser(params, user);
	const dueToday = isDueTodayWorkOrder(params);
	const overdue = isOverdueWorkOrder(params);
	const dueLabel = params?.end_date ? moment(params.end_date).format("DD MMM YYYY") : "No due date";
	const assetLabel = params?.asset?.asset_name || "No asset linked";
	const locationLabel = params?.location?.location_name || "No location linked";
	const partSummary = (Array.isArray(params?.parts) ? params.parts : []).reduce(
		(summary, part) => {
			summary.planned += Number(part?.plannedQuantity ?? part?.estimatedQuantity ?? 0) || 0;
			summary.actual += Number(part?.actualQuantity ?? 0) || 0;
			return summary;
		},
		{ planned: 0, actual: 0 }
	);

	const workerAction = (() => {
		if (params?.hierarchy?.executionOwnedByChildren) {
			return {
				title: "Use child work orders for execution",
				message: "This parent work order rolls up child execution. Open a child work order to log parts, procedures, labor, and completion updates.",
			};
		}

		if (String(params?.status || "").trim() === "Completed") {
			return {
				title: "Work is already completed",
				message: "Use history, comments, and attachments to review what happened on the floor. Execution fields are now locked for closeout accuracy.",
			};
		}

		if (["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"].includes(String(params?.status || "").trim())) {
			return {
				title: "This work order is waiting on an unblock",
				message: params?.block_reason || "Review the blocker note, update status when the issue is cleared, and continue execution once the job is ready again.",
			};
		}

		if (String(params?.status || "").trim() === "In-Progress") {
			return {
				title: "Keep execution updates current",
				message: "Use procedures, parts, tasks, comments, and attachments to record work as it happens before marking the job complete.",
			};
		}

		if (readiness.executionReady) {
			return {
				title: "Ready to start work",
				message: "This work order has enough context to begin execution from the floor. Move it to In Progress when work starts.",
			};
		}

		return {
			title: "Review blockers before starting",
			message: readiness.summary,
		};
	})();

	const openFollowUpCreate = () => {
		router.push({
			pathname: "/createWorkOrder",
			params: {
				data: JSON.stringify({
					...params,
					isFollowUp: true,
				}),
				mode: "follow-up",
			},
		});
	};

	const getStatusChipStyle = (status?: string) => {
		return getWorkOrderStatusTone(status);
	};

	return (
		<ScrollView style={styles.container}>
			{params?.hierarchy?.executionOwnedByChildren ? (
				<View style={styles.infoBanner}>
					<Text style={styles.infoBannerTitle}>Execution owned by child work orders</Text>
					<Text style={styles.infoBannerText}>
						Parts, procedures, labor, and actual execution updates should be recorded on the child work orders for this parent.
					</Text>
				</View>
			) : null}

			<View style={styles.workerFocusCard}>
				<View style={styles.rowBetween}>
					<Text style={styles.workerFocusEyebrow}>Worker Focus</Text>
					<View style={[styles.statusChip, { backgroundColor: statusTone.bg, borderColor: statusTone.border }]}>
						<Text style={[styles.statusChipText, { color: statusTone.text }]}>{formatWorkOrderStatusLabel(params?.status)}</Text>
					</View>
				</View>
				<Text style={styles.workerFocusTitle}>{workerAction.title}</Text>
				<Text style={styles.workerFocusText}>{workerAction.message}</Text>

				<View style={styles.workerMetaWrap}>
					<View style={styles.workerMetaChip}>
						<Ionicons name="cube-outline" size={14} color="#1D4ED8" />
						<Text style={styles.workerMetaChipText} numberOfLines={1}>{assetLabel}</Text>
					</View>
					<View style={styles.workerMetaChip}>
						<Ionicons name="location-outline" size={14} color="#1D4ED8" />
						<Text style={styles.workerMetaChipText} numberOfLines={1}>{locationLabel}</Text>
					</View>
					<View style={[styles.workerMetaChip, overdue ? styles.workerMetaChipDanger : dueToday ? styles.workerMetaChipWarning : null]}>
						<Ionicons name="calendar-outline" size={14} color={overdue ? "#B91C1C" : dueToday ? "#92400E" : "#1D4ED8"} />
						<Text style={[styles.workerMetaChipText, overdue ? styles.workerMetaChipDangerText : dueToday ? styles.workerMetaChipWarningText : null]}>
							{overdue ? `Overdue • ${dueLabel}` : dueToday ? `Due today • ${dueLabel}` : `Due • ${dueLabel}`}
						</Text>
					</View>
					<View style={[styles.workerMetaChip, assignedToCurrentUser ? styles.workerMetaChipSuccess : null]}>
						<Ionicons name="person-outline" size={14} color={assignedToCurrentUser ? "#047857" : "#1D4ED8"} />
						<Text style={[styles.workerMetaChipText, assignedToCurrentUser ? styles.workerMetaChipSuccessText : null]}>
							{assignedToCurrentUser ? "Assigned to you" : assignedUsers.length ? "Assigned team work" : "No assignee"}
						</Text>
					</View>
				</View>
			</View>

			{parentReference ? (
				<Pressable
					style={styles.linkCard}
					onPress={() => {
						const parent = parentReference;
						router.push({
							pathname: "/workOrderDetail",
							params: {
								id: parent?.id || parent?._id,
								composite_id: parent?.order_no,
							},
						});
					}}
				>
					<View style={{ flex: 1 }}>
						<Text style={styles.cardTitle}>Parent Work Order</Text>
						<Text style={styles.cardValue}>
							{params?.parentOrder?.order_no || params?.hierarchy?.parentReference?.order_no} - {params?.parentOrder?.title || params?.hierarchy?.parentReference?.title}
						</Text>
					</View>
					<Ionicons name="chevron-forward" size={18} color="#742BDE" />
				</Pressable>
			) : null}

			{params?.hierarchy?.isChildWorkOrder ? (
				<View style={styles.childInfoCard}>
					<Text style={styles.childInfoTitle}>Child Work Order</Text>
					<Text style={styles.childInfoText}>
						Complete work, procedures, parts, and execution capture here. The parent work order rolls up this progress automatically.
					</Text>
					<Text style={styles.childInfoMeta}>
						Parent: {parentReference?.order_no || "--"} {parentReference?.title ? `• ${parentReference.title}` : ""}
					</Text>
				</View>
			) : null}

			{params?.hierarchy?.isParentWorkOrder ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Child Work Order Progress</Text>
					<Text style={styles.cardSubtitle}>
						{params?.hierarchy?.childProgressLabel || `${childSummary?.completed || 0}/${childSummary?.total || 0} completed`}
					</Text>
					<View style={styles.progressTrack}>
						<View style={[styles.progressFill, { width: `${childProgressPercent}%` }]} />
					</View>
					<Text style={styles.progressCaption}>
						{remainingChildren > 0
							? `${remainingChildren} child work order${remainingChildren === 1 ? "" : "s"} still needs completion before the parent can close.`
							: "All child work orders are complete. The parent can now be closed when you are ready."}
					</Text>
					<View style={[styles.rowBetween, { marginTop: 8 }]}>
						<Text style={styles.cardValue}>Open: {childSummary?.open || 0}</Text>
						<Text style={styles.cardValue}>In Progress: {childSummary?.in_progress || 0}</Text>
					</View>
					<View style={[styles.rowBetween, { marginTop: 4 }]}>
						<Text style={styles.cardValue}>On Hold: {childSummary?.on_hold || 0}</Text>
						<Text style={styles.cardValue}>Completed: {childSummary?.completed || 0}</Text>
					</View>
				</View>
			) : null}

			<Pressable style={styles.followUpCard} onPress={openFollowUpCreate}>
				<View style={{ flex: 1 }}>
					<Text style={styles.followUpCardTitle}>Create Follow-Up Work Order</Text>
					<Text style={styles.followUpCardText}>
						Use a child work order when execution should be captured separately while keeping this work linked.
					</Text>
				</View>
				<Ionicons name="add-circle-outline" size={20} color="#5B21B6" />
			</Pressable>

			{childOrders.length > 0 ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Child Work Orders</Text>
					{childOrders.map((child) => {
						const childStatusTone = getStatusChipStyle(child.status);
						return (
							<Pressable
								key={child.id || child._id || child.order_no}
								style={styles.childRow}
								onPress={() => {
									router.push({
										pathname: "/workOrderDetail",
										params: {
											id: child.id || child._id,
											composite_id: child.order_no,
										},
									});
								}}
							>
								<View style={{ flex: 1 }}>
									<Text style={styles.childTitle}>{child.order_no} - {child.title}</Text>
									<View style={styles.childMetaRow}>
										<View style={[styles.statusChip, { backgroundColor: childStatusTone.bg, borderColor: childStatusTone.border }]}>
											<Text style={[styles.statusChipText, { color: childStatusTone.text }]}>{formatWorkOrderStatusLabel(child.status)}</Text>
										</View>
										<Text style={styles.childMeta}>
											{Number(child?.actual_time || 0) > 0 ? `${child.actual_time}h actual` : `${child?.estimated_time || 0}h est.`}
										</Text>
									</View>
								</View>
								<Ionicons name="chevron-forward" size={18} color="#742BDE" />
							</Pressable>
						);
					})}
				</View>
			) : null}

			{Array.isArray(params?.inventoryWarnings) && params.inventoryWarnings.length > 0 ? (
				<View style={styles.warningCard}>
					<Text style={styles.warningTitle}>Inventory warnings</Text>
					{params.inventoryWarnings.map((warning, index) => (
						<Text key={`${warning.part_id || warning.part_name}-${index}`} style={styles.warningText}>
							{warning.part_name || "Part"}: {warning.message || `Need ${warning.quantity || 0}`}
						</Text>
					))}
				</View>
			) : null}

			<View style={styles.readinessCard}>
				<View style={styles.rowBetween}>
					<View style={{ flex: 1, paddingRight: 12 }}>
						<Text style={styles.readinessTitle}>Readiness</Text>
						<Text style={styles.readinessSummary}>Review these four checks to see what is attached, what is missing, and how complete the setup is.</Text>
					</View>
					<View style={styles.readinessScoreCard}>
						<Text style={styles.readinessScoreValue}>{readiness.score}</Text>
						<Text style={styles.readinessScoreLabel}>/100</Text>
					</View>
				</View>
				<View style={styles.readinessSectionsWrap}>
					{readiness.sections.map((section) => (
						<View key={section.id} style={styles.readinessSectionRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.readinessSectionLabel}>{section.label}</Text>
								<Text style={styles.readinessSectionSummary}>{section.summary}</Text>
							</View>
						</View>
					))}
				</View>
			</View>

			<View style={styles.card}>
				<View style={[styles.makeRow, styles.sectionHeader]}>
					<Text style={styles.cardTitle}>Assigned to</Text>
					<Pressable style={styles.avatarRow} onPress={() => setUserModalVisible(true)}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ alignItems: "center" }}
							style={{ maxWidth: 150 }}
						>
							{assignedUsers.map((user, i) => {
								const profileImg = user?.user?.user_profile_img;
								const first = user?.user?.firstName?.[0] || "";
								const last = user?.user?.lastName?.[0] || "";
								const initials = (first + last).toUpperCase();

								return (
									<View
										key={user.id}
										style={[
											{ marginLeft: i === 0 ? 0 : -8 },
											styles.avatarContainer,
										]}
									>
										{profileImg ? (
											<Image
												source={{ uri: `${endpoints.baseURL}user_profile_img/${profileImg}` }}
												style={styles.avatar}
											/>
										) : (
											<View style={styles.avatarFallback}>
												<Text style={styles.avatarInitials}>{initials}</Text>
											</View>
										)}
									</View>
								);
							})}
						</ScrollView>

						<Ionicons name="chevron-forward" size={18} color="#742BDE" />
					</Pressable>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardSubtitle}>{assignedUserNames}</Text>
				</View>
			</View>

			<View style={styles.card}>
				<View style={[styles.rowBetween, styles.sectionHeader]}>
					<Text style={styles.cardTitle}>Priority</Text>
					<Text style={[
						styles.badge,
						params?.priority === "Low" && styles.badgeLow,
						params?.priority === "Medium" && styles.badgeMedium,
						params?.priority === "High" && styles.badgeHigh,
						params?.priority === "Urgent" && styles.badgeHigh,
					]}>
						#{params?.priority || "None"}
					</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardSubtitle}>Start Date</Text>
					<Text style={styles.cardSubtitle}>End Date</Text>
				</View>
				<View style={styles.rowBetween}>
					<Text style={styles.cardValue}>{params?.start_date ? moment(params.start_date).format("MMM DD, YYYY") : "N/A"}</Text>
					<Text style={styles.cardValue}>{params?.end_date ? moment(params.end_date).format("MMM DD, YYYY") : "N/A"}</Text>
				</View>
			</View>

			<Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
				<View style={styles.rowBetween}>
					<Text style={styles.cardTitle}>More Info</Text>
					<Ionicons name="chevron-forward" size={18} color="#742BDE" />
				</View>
			</Pressable>

			<Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
				<View style={styles.rowBetween}>
					<View>
						<Text style={styles.cardTitle}>Parts</Text>
						<Text style={styles.cardSubtitle}>Planned {partSummary.planned} | Actual {partSummary.actual}</Text>
					</View>
					<View style={styles.avatarRow}>
						<Text style={styles.linkText}>{params?.parts?.length || 0} Parts</Text>
						<Ionicons name="chevron-forward" size={18} color="#742BDE" />
					</View>
				</View>
			</Pressable>

			{procedures.length > 0 ? (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Linked Procedures</Text>
					{procedures.map((procedure) => (
						<View key={procedure.id} style={styles.procedureRow}>
							<Text style={styles.procedureName}>{procedure.name}</Text>
							<Text style={styles.procedureMeta}>
								{procedure.submitted ? "Submitted" : "Pending"}
								{procedure.score_summary?.percentage !== undefined && procedure.score_summary?.percentage !== null
									? ` - ${procedure.score_summary.percentage}%`
									: ""}
							</Text>
						</View>
					))}
				</View>
			) : null}

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Description</Text>
				<Text style={styles.description}>
					{params?.description || "No description available."}
				</Text>
			</View>

			<AssignedUsersModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} users={params?.assignedUsers} />

			<PartsInfoModal
				visible={partsModalVisible}
				onClose={() => setPartsModalVisible(false)}
				parts={Array.isArray(params?.parts) ? params.parts : []}
				workOrderId={params?.id}
				inventoryWarnings={Array.isArray(params?.inventoryWarnings) ? params.inventoryWarnings : []}
				readOnly={Boolean(params?.hierarchy?.executionOwnedByChildren) || String(params?.status || "").trim() === "Completed"}
				onSaved={onSaved}
			/>

			<MoreInfoModal
				visible={moreInfoModalVisible}
				onClose={() => setMoreInfoModalVisible(false)}
				estimatedTime={estimatedTime}
				requestedBy={requestedBy}
				createdOn={createdOn}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		paddingVertical: 12,
		paddingHorizontal: 20,
	},
	workerFocusCard: {
		backgroundColor: "#F8FAFF",
		borderRadius: 12,
		padding: 14,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#BFDBFE",
	},
	workerFocusEyebrow: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#1D4ED8",
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	workerFocusTitle: {
		fontSize: 15,
		fontFamily: Fonts.bold,
		color: "#0F172A",
		marginTop: 10,
	},
	workerFocusText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#334155",
		marginTop: 6,
		lineHeight: 17,
	},
	workerMetaWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 12,
	},
	workerMetaChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 7,
		paddingHorizontal: 10,
		borderRadius: 999,
		backgroundColor: "#EFF6FF",
		borderWidth: 1,
		borderColor: "#BFDBFE",
		maxWidth: "100%",
	},
	workerMetaChipText: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#1E3A8A",
		flexShrink: 1,
	},
	workerMetaChipSuccess: {
		backgroundColor: "#ECFDF5",
		borderColor: "#A7F3D0",
	},
	workerMetaChipSuccessText: {
		color: "#047857",
	},
	workerMetaChipWarning: {
		backgroundColor: "#FFFBEB",
		borderColor: "#FDE68A",
	},
	workerMetaChipWarningText: {
		color: "#92400E",
	},
	workerMetaChipDanger: {
		backgroundColor: "#FEF2F2",
		borderColor: "#FECACA",
	},
	workerMetaChipDangerText: {
		color: "#B91C1C",
	},
	card: {
		backgroundColor: "#F1F3F8",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		borderWidth: 0.3,
		borderColor: "rgba(0, 0, 0, 0.60)",
		gap: 5,
	},
	linkCard: {
		backgroundColor: "#F0F5FF",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#ADC6FF",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	childInfoCard: {
		backgroundColor: "#EEF4FF",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#B4C6FC",
	},
	childInfoTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#1E3A8A",
		marginBottom: 4,
	},
	childInfoText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#334155",
		lineHeight: 15,
	},
	childInfoMeta: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#475569",
		marginTop: 6,
	},
	infoBanner: {
		backgroundColor: "#FFF7E6",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#FFD591",
	},
	infoBannerTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#7A4A00",
		marginBottom: 4,
	},
	infoBannerText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#7A4A00",
	},
	warningCard: {
		backgroundColor: "#FFF1F0",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#FFA39E",
	},
	warningTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#A8071A",
		marginBottom: 4,
	},
	warningText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#7F1D1D",
		marginBottom: 3,
	},
	readinessCard: {
		backgroundColor: "#F8FAFC",
		borderRadius: 8,
		padding: 12,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#D7DEEA",
	},
	readinessTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	readinessSummary: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#475569",
		marginTop: 8,
		lineHeight: 15,
	},
	readinessScoreCard: {
		minWidth: 68,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#EEF4FF",
		borderWidth: 0.8,
		borderColor: "#BFD3FF",
		alignItems: "center",
		justifyContent: "center",
	},
	readinessScoreValue: {
		fontSize: 18,
		fontFamily: Fonts.bold,
		color: "#1D4ED8",
	},
	readinessScoreLabel: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#475569",
		marginTop: 2,
	},
	readinessSectionsWrap: {
		marginTop: 12,
		gap: 8,
	},
	readinessSectionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	readinessSectionLabel: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#111827",
	},
	readinessSectionSummary: {
		fontSize: 9,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
		lineHeight: 13,
	},
	cardTitle: {
		width: "50%",
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000000",
	},
	sectionHeader: {
		backgroundColor: "#FAFAFB",
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	makeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	avatarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		flexShrink: 1,
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#fff",
	},
	cardSubtitle: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#000",
	},
	cardValue: {
		fontSize: 10,
		fontFamily: Fonts.light,
		color: "#333",
	},
	progressTrack: {
		height: 8,
		backgroundColor: "#E2E8F0",
		borderRadius: 999,
		marginTop: 10,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#22C55E",
		borderRadius: 999,
	},
	progressCaption: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#475569",
		marginTop: 8,
		lineHeight: 14,
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	badge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#742BDE",
		borderColor: "#742BDE",
		borderWidth: 1,
	},
	badgeLow: { backgroundColor: "rgba(116, 43, 222, 0.14)" },
	badgeMedium: { backgroundColor: "rgba(255, 213, 128, 0.24)" },
	badgeHigh: { backgroundColor: "rgba(255, 155, 155, 0.24)" },
	linkText: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#742BDE",
	},
	description: {
		fontSize: 10,
		fontFamily: Fonts.light,
		color: "#444",
	},
	followUpCard: {
		backgroundColor: "#F4EDFF",
		borderRadius: 8,
		padding: 14,
		marginBottom: 10,
		borderWidth: 0.8,
		borderColor: "#C4B5FD",
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	followUpCardTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#5B21B6",
	},
	followUpCardText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#4C1D95",
		marginTop: 4,
		lineHeight: 14,
	},
	childRow: {
		paddingVertical: 8,
		borderTopWidth: 0.5,
		borderTopColor: "#D6DEE6",
		flexDirection: "row",
		alignItems: "center",
	},
	childTitle: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#111827",
	},
	childMetaRow: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 4,
	},
	childMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
	},
	statusChip: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 999,
		borderWidth: 1,
	},
	statusChipText: {
		fontSize: 9,
		fontFamily: Fonts.semiBold,
	},
	procedureRow: {
		paddingTop: 8,
		borderTopWidth: 0.5,
		borderTopColor: "#D6DEE6",
	},
	procedureName: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#111827",
	},
	procedureMeta: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 2,
	},
	avatarContainer: {
		width: 28,
		height: 28,
		borderRadius: 14,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#f0f0f0",
	},
	avatarFallback: {
		width: "100%",
		height: "100%",
		borderRadius: 14,
		backgroundColor: "#9999FF",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
});



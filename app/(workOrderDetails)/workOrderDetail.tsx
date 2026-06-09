import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/src/components/global/Header";
import Detail from "@/src/components/work-order-detail/Detail";
import Comments from "@/src/components/work-order-detail/Comments";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import Fonts from "@/constants/Typography";
import { deleteWorkOrder, getWorkOrderDetails, updateWorkOrderStatus } from "@/src/services/work-order.service";
import { useCallback, useState } from "react";
import Popover from "react-native-popover-view";
import { Ionicons } from "@expo/vector-icons";
import { WorkOrder } from "@/src/types/workOrder";
import Tasks from "@/src/components/work-order-detail/Tasks";
import Forms from "@/src/components/work-order-detail/Forms";
import SegmentedPager from "@/src/components/global/SegmentPager";
import History from "@/src/components/work-order-detail/History";
import ProceduresTab from "@/src/components/work-order-detail/ProceduresTab";
import ExecutionTab from "@/src/components/work-order-detail/ExecutionTab";
import { formatWorkOrderStatusLabel, getWorkOrderStatusTone, isClosedWorkOrderStatus, normalizeWorkOrderStatus, requiresWorkOrderBlockReason } from "@/src/utils/workOrderStatus";

const safeJsonParse = (value?: string) => {
	if (!value || typeof value !== "string") return null;

	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

const WORKER_ACTIONABLE_STATUSES = [
	"Open",
	"In-Progress",
	"On-Hold",
	"Blocked",
	"Waiting-on-Parts",
	"Waiting-on-Permit",
	"Completed",
] as const;

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
	const [reasonModalVisible, setReasonModalVisible] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<string | null>(null);
	const [blockReasonDraft, setBlockReasonDraft] = useState("");

	const isDoneStatus = isClosedWorkOrderStatus(workOrderData?.status);
	const hasTasks = Array.isArray(workOrderData?.tasks) && workOrderData.tasks.length > 0;
	const hasForms = Boolean(workOrderData?.sop_form_id);
	const hasProcedures =
		(Array.isArray(workOrderData?.procedure_entries) && workOrderData.procedure_entries.length > 0) ||
		(Array.isArray(workOrderData?.procedures) && workOrderData.procedures.length > 0) ||
		(Array.isArray(workOrderData?.procedure_ids) && workOrderData.procedure_ids.length > 0);
	const isExecutionOwnedByChildren = Boolean(workOrderData?.hierarchy?.executionOwnedByChildren);
	const childSummary = workOrderData?.hierarchy?.childStatusSummary;
	const hasExecutionData =
		Boolean(workOrderData?.actual_start_date) ||
		Boolean(workOrderData?.actual_end_date) ||
		Number(workOrderData?.actual_time || 0) > 0 ||
		(Array.isArray(workOrderData?.labor_entries) && workOrderData.labor_entries.length > 0);

	const openFollowUpCreate = () => {
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
	};

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

	const detailTabs = [
		{ label: "Details", component: <Detail params={workOrderData} onSaved={fetchWorkOrderDetails} /> },
		{ label: "Execution", component: <ExecutionTab params={workOrderData} onSaved={fetchWorkOrderDetails} /> },
		...(hasTasks ? [{ label: "Tasks", component: <Tasks params={workOrderData} onSaved={fetchWorkOrderDetails} /> }] : []),
		...(hasProcedures ? [{ label: "Procedures", component: <ProceduresTab params={workOrderData} onSaved={fetchWorkOrderDetails} /> }] : []),
		...(hasForms ? [{ label: "Forms", component: <Forms params={workOrderData} /> }] : []),
		{ label: "History", component: <History params={workOrderData} /> },
		{ label: "Comments", component: <Comments params={workOrderData} /> },
	];

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

	const getRemainingChildCount = () => {
		const total = Number(childSummary?.total || 0);
		const completed = Number(childSummary?.completed || 0);
		return Math.max(total - completed, 0);
	};

	const closeReasonModal = () => {
		setReasonModalVisible(false);
		setPendingStatus(null);
		setBlockReasonDraft("");
	};

	const handleStatusUpdate = async (targetStatus: string, blockReason?: string) => {
		if (!workOrderData?.id) return;
		if (normalizeWorkOrderStatus(workOrderData?.status) === normalizeWorkOrderStatus(targetStatus)) return;

		if (targetStatus === "In-Progress" && isExecutionOwnedByChildren) {
			Alert.alert(
				"Start Child Work Orders",
				"This parent work order rolls up child execution. Start work on a child work order instead, or create a follow-up if you still need to split execution.",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Create Follow-Up", onPress: openFollowUpCreate },
				]
			);
			return;
		}

		if (
			targetStatus === "Completed" &&
			isExecutionOwnedByChildren &&
			childSummary &&
			Number(childSummary.completed || 0) < Number(childSummary.total || 0)
		) {
			const remainingChildren = getRemainingChildCount();
			Alert.alert(
				"Parent Not Ready To Close",
				`${remainingChildren} child work order${remainingChildren === 1 ? "" : "s"} still needs completion before this parent can be marked Completed.`,
				[{ text: "OK", style: "default" }]
			);
			return;
		}

		if (targetStatus === "Completed" && !hasExecutionData) {
			Alert.alert(
				"Complete Without Execution Log?",
				"No actual time or labor has been captured yet. You can still complete the work order, but field execution details will be thin in history and reports.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Complete Anyway",
						style: "destructive",
						onPress: async () => {
							await handleStatusUpdateConfirmed(targetStatus, blockReason);
						},
					},
				]
			);
			return;
		}

		await handleStatusUpdateConfirmed(targetStatus, blockReason);
	};

	const handleStatusUpdateConfirmed = async (targetStatus: string, blockReason?: string) => {
		if (!workOrderData?.id) return;

		try {
			const payload: Record<string, string> = { status: targetStatus };
			if (typeof blockReason === "string" && blockReason.trim()) {
				payload.block_reason = blockReason.trim();
			}

			const res = await updateWorkOrderStatus(workOrderData.id, payload);

			if (res?.status) {
				const isChildCompletion = targetStatus === "Completed" && Boolean(workOrderData?.hierarchy?.isChildWorkOrder);
				ToastAndroid.show(
					isChildCompletion
						? "Child work order completed. Parent progress will roll up automatically."
						: "Status updated successfully!",
					ToastAndroid.SHORT
				);
				setWorkOrderData((prev: any) => ({
					...prev,
					status: targetStatus,
					block_reason:
						targetStatus === "Blocked" || targetStatus === "Waiting-on-Parts" || targetStatus === "Waiting-on-Permit"
							? payload.block_reason || null
							: targetStatus === "On-Hold"
								? prev?.block_reason || null
								: null,
				}));
				fetchWorkOrderDetails();
			} else {
				ToastAndroid.show("Failed to update status.", ToastAndroid.SHORT);
			}
		} catch (err: any) {
			console.error("Error updating status:", err);
			ToastAndroid.show(err?.message || "Failed to update status", ToastAndroid.SHORT);
		}
	};

	const openReasonModalForStatus = (status: string) => {
		setPendingStatus(status);
		setBlockReasonDraft(workOrderData?.block_reason || "");
		setReasonModalVisible(true);
	};

	const submitBlockedReason = async () => {
		if (!pendingStatus) return;
		const trimmedReason = blockReasonDraft.trim();
		if (!trimmedReason) {
			ToastAndroid.show("A reason is required for this status.", ToastAndroid.SHORT);
			return;
		}

		const targetStatus = pendingStatus;
		closeReasonModal();
		await handleStatusUpdate(targetStatus, trimmedReason);
	};

	const getReasonModalCopy = (status?: string | null) => {
		switch (status) {
			case "Waiting-on-Parts":
				return {
					title: "Waiting on Parts Reason",
					label: "What parts are missing or delayed?",
					placeholder: "Example: Bearing kit not available in store, vendor ETA tomorrow.",
				};
			case "Waiting-on-Permit":
				return {
					title: "Waiting on Permit Reason",
					label: "What permit or approval is pending?",
					placeholder: "Example: Shutdown permit pending approval from EHS team.",
				};
			default:
				return {
					title: "Blocked Reason",
					label: "What is blocking this work order?",
					placeholder: "Example: Asset access blocked, work area not released, safety issue found.",
				};
		}
	};

	const reasonModalCopy = getReasonModalCopy(pendingStatus);

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
												openFollowUpCreate();
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

				<Text style={styles.statusSectionLabel}>Update Work Status</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabs}>
					{WORKER_ACTIONABLE_STATUSES.map((status) => {
						const isActive = normalizeWorkOrderStatus(workOrderData?.status) === normalizeWorkOrderStatus(status);
						const tone = getWorkOrderStatusTone(status);

						return (
							<Pressable
								key={status}
								style={[
									styles.statusChip,
									{ backgroundColor: tone.bg, borderColor: tone.border },
									isActive && styles.statusChipActive,
								]}
								onPress={() => {
									if (isActive) return;
									if (requiresWorkOrderBlockReason(status)) {
										openReasonModalForStatus(status);
										return;
									}
									handleStatusUpdate(status);
								}}
							>
								<Text style={[styles.statusChipText, { color: tone.text }, isActive && styles.statusChipTextActive]}>
									{formatWorkOrderStatusLabel(status)}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
				{workOrderData?.block_reason ? (
					<View style={styles.blockReasonCard}>
						<Text style={styles.blockReasonLabel}>Current status note</Text>
						<Text style={styles.blockReasonText}>{workOrderData.block_reason}</Text>
					</View>
				) : null}
			</View>

			<SegmentedPager tabs={detailTabs} />
			<Modal visible={reasonModalVisible} transparent animationType="fade" onRequestClose={closeReasonModal}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>{reasonModalCopy.title}</Text>
						<Text style={styles.modalLabel}>{reasonModalCopy.label}</Text>
						<TextInput
							value={blockReasonDraft}
							onChangeText={setBlockReasonDraft}
							placeholder={reasonModalCopy.placeholder}
							placeholderTextColor="#94A3B8"
							multiline
							textAlignVertical="top"
							style={styles.modalInput}
						/>
						<View style={styles.modalActions}>
							<Pressable style={styles.modalSecondaryButton} onPress={closeReasonModal}>
								<Text style={styles.modalSecondaryButtonText}>Cancel</Text>
							</Pressable>
							<Pressable style={styles.modalPrimaryButton} onPress={submitBlockedReason}>
								<Text style={styles.modalPrimaryButtonText}>Save Reason</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
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
	statusSectionLabel: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#475569",
		marginTop: 12,
		marginBottom: 6,
	},
	statusTabs: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingRight: 16,
	},
	statusChip: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 999,
		borderWidth: 1,
	},
	statusChipActive: {
		borderColor: "#742BDE",
		shadowColor: "#742BDE",
		shadowOpacity: 0.14,
		shadowRadius: 6,
		elevation: 2,
	},
	statusChipText: {
		fontSize: 11,
		fontFamily: Fonts.medium,
	},
	statusChipTextActive: {
		fontFamily: Fonts.semiBold,
	},
	blockReasonCard: {
		marginTop: 10,
		backgroundColor: "#FFF7ED",
		borderColor: "#FDBA74",
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
	},
	blockReasonLabel: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#9A3412",
		marginBottom: 4,
	},
	blockReasonText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#7C2D12",
		lineHeight: 17,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "#00000066",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	modalCard: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 18,
	},
	modalTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	modalLabel: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#475569",
		marginTop: 8,
		marginBottom: 10,
	},
	modalInput: {
		minHeight: 120,
		borderWidth: 1,
		borderColor: "#CBD5E1",
		borderRadius: 12,
		padding: 12,
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#0F172A",
		backgroundColor: "#F8FAFC",
	},
	modalActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 10,
		marginTop: 14,
	},
	modalSecondaryButton: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		backgroundColor: "#F1F5F9",
	},
	modalSecondaryButtonText: {
		fontSize: 12,
		fontFamily: Fonts.medium,
		color: "#334155",
	},
	modalPrimaryButton: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		backgroundColor: "#742BDE",
	},
	modalPrimaryButtonText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#FFFFFF",
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

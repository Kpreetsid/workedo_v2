import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Popover from "react-native-popover-view";

import Header from "@/components/global/Header";
import RejectModal from "@/components/request-detail/RejectModal.tsx";
import Fonts from "@/constants/Typography";
import { useAuthStore } from "@/src/store/useAuthStore";
import {
	approveWorkRequest,
	deleteWorkRequest,
	getWorkRequestDetails,
	rejectWorkRequest,
} from "@/src/services/work-request.service";
import { WorkRequest } from "@/src/types/workRequest";
import {
	canApproveRequest,
	canCreateWorkOrderFromRequest,
	canDeleteRequest,
	canEditRequest,
	canRejectRequest,
	formatRequestDateTime,
	formatRequestUserLabel,
	getWorkRequestGovernanceLabel,
	getWorkRequestGovernanceState,
	getWorkRequestStage,
} from "@/src/utils/workRequestLifecycle";

const safeJsonParse = (value?: string) => {
	if (!value || typeof value !== "string") return {};

	try {
		return JSON.parse(value);
	} catch {
		return {};
	}
};

export default function WorkRequestDetail() {
	const params: any = useLocalSearchParams();
	const initialRequest = safeJsonParse(params?.data) as WorkRequest;
	const router = useRouter();
	const { user } = useAuthStore();

	const [rejectVisible, setRejectVisible] = useState(false);
	const [openPopover, setOpenPopover] = useState(false);
	const ellipsesRef = useRef<any>(null);
	const [workRequestData, setWorkRequestData] = useState<WorkRequest>(initialRequest);
	const [loadingError, setLoadingError] = useState<string | null>(null);

	const stage = getWorkRequestStage(workRequestData);
	const governanceState = getWorkRequestGovernanceState(workRequestData);
	const linkedWorkOrder = workRequestData?.converted_work_order_id;
	const canApprove = canApproveRequest(workRequestData, user?.user_role);
	const canReject = canRejectRequest(workRequestData, user?.user_role);
	const canConvert = canCreateWorkOrderFromRequest(workRequestData, user?.user_role);
	const canEdit = canEditRequest(workRequestData);
	const canDelete = canDeleteRequest(workRequestData);

	const governanceTone = useMemo(() => {
		switch (governanceState) {
			case "breached":
				return { bg: "#FFF7ED", border: "#FDBA74", text: "#C2410C" };
			case "due-soon":
				return { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E" };
			case "rejected":
				return { bg: "#FEE2E2", border: "#FCA5A5", text: "#B91C1C" };
			case "converted":
				return { bg: "#DCFCE7", border: "#86EFAC", text: "#166534" };
			default:
				return { bg: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" };
		}
	}, [governanceState]);

	const stageTone = useMemo(() => {
		switch (stage) {
			case "approved":
				return { bg: "#EDE9FE", text: "#6D28D9" };
			case "rejected":
				return { bg: "#FEE2E2", text: "#B91C1C" };
			case "converted":
				return { bg: "#DCFCE7", text: "#166534" };
			default:
				return { bg: "#DBEAFE", text: "#1D4ED8" };
		}
	}, [stage]);

	const fetchWorkRequestDetails = async () => {
		if (!workRequestData?.id) return;

		try {
			setLoadingError(null);
			const res = await getWorkRequestDetails(workRequestData.id);
			if (res?.status && res?.data) {
				setWorkRequestData(res.data);
			}
		} catch (e) {
			console.log("request detail error =", e);
			setLoadingError("Unable to refresh this request right now. Check your connection and try again.");
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchWorkRequestDetails();
		}, [workRequestData?.id])
	);

	const handleDeleteRequest = async (item: WorkRequest) => {
		Alert.alert(
			"Delete Work Request",
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
							const resp = await deleteWorkRequest(item?.id);
							if (resp?.status) {
								ToastAndroid.show("Work request deleted", ToastAndroid.SHORT);
								router.back();
							}
						} catch (e) {
							console.log("error deleting request =", e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

	const handleApproveRequest = async () => {
		Alert.alert(
			"Approve Request",
			"Approve this request and move it to the work-order conversion stage?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Approve",
					onPress: async () => {
						try {
							const response = await approveWorkRequest(workRequestData?.id);
							if (response?.status) {
								ToastAndroid.show(response?.message || "Request approved successfully", ToastAndroid.SHORT);
								fetchWorkRequestDetails();
							}
						} catch (error: any) {
							ToastAndroid.show(error?.message || "Unable to approve request", ToastAndroid.LONG);
						}
					},
				},
			]
		);
	};

	const handleCreateWorkOrder = () => {
		const payload = {
			...workRequestData,
			sourceType: "work-request",
			work_request_id: workRequestData?.id,
			createdFrom: "Work Request",
		};

		router.push({
			pathname: "/createWorkOrder",
			params: { data: JSON.stringify(payload) },
		});
	};

	const handleOpenLinkedWorkOrder = () => {
		if (!linkedWorkOrder?.id) return;
		router.push({
			pathname: "/workOrderDetail",
			params: {
				data: JSON.stringify({
					id: linkedWorkOrder.id,
					composite_id: linkedWorkOrder.order_no,
				}),
			},
		});
	};

	const menuOptions = [
		...(canEdit
			? [
					{
						text: "Edit Request",
						action: () =>
							router.push({
								pathname: "/newWorkRequest",
								params: { passedData: JSON.stringify(workRequestData), isEdit: "true" },
							}),
					},
				]
			: []),
		...(canDelete
			? [
					{
						text: "Delete Request",
						action: () => handleDeleteRequest(workRequestData),
					},
				]
			: []),
	];

	return (
		<>
			<Header
				title="Work Request"
				showEllipses={menuOptions.length > 0}
				openEllipses={() => setOpenPopover(true)}
				ellipsesRef={ellipsesRef}
			/>

			<Popover
				isVisible={openPopover}
				onRequestClose={() => setOpenPopover(false)}
				popoverStyle={{ borderRadius: 16 }}
				from={ellipsesRef}
			>
				<View style={styles.popoverContent}>
					<Pressable style={styles.popoverItem}>
						<Text style={styles.popoverHeading}>Actions</Text>
					</Pressable>
					{menuOptions.map((option) => (
						<Pressable
							style={styles.popoverItem}
							key={option.text}
							onPress={() => {
								option.action();
								setOpenPopover(false);
							}}
						>
							<Text style={styles.popoverOption}>{option.text}</Text>
						</Pressable>
					))}
				</View>
			</Popover>

			<ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
				{loadingError ? (
					<View style={styles.retryBanner}>
						<View style={{ flex: 1 }}>
							<Text style={styles.retryBannerTitle}>Request details may be outdated</Text>
							<Text style={styles.retryBannerText}>{loadingError}</Text>
						</View>
						<Pressable onPress={fetchWorkRequestDetails} style={styles.retryBannerAction}>
							<Text style={styles.retryBannerActionText}>Retry</Text>
						</Pressable>
					</View>
				) : null}

				<View style={styles.heroCard}>
					<View style={styles.heroHeader}>
						<View style={styles.heroTextWrap}>
							<Text style={styles.kicker}>{workRequestData?.request_no || "Work Request"}</Text>
							<Text style={styles.heroTitle}>{workRequestData?.title || "Untitled Request"}</Text>
						</View>

						<View style={[styles.statusChip, { backgroundColor: stageTone.bg }]}>
							<Text style={[styles.statusChipText, { color: stageTone.text }]}>
								{stage === "converted" ? "Converted" : workRequestData?.status || "Open"}
							</Text>
						</View>
					</View>

					<Text style={styles.heroMeta}>
						Requested by {formatRequestUserLabel(workRequestData?.createdBy)} | {formatRequestDateTime(workRequestData?.createdAt)}
					</Text>

					<View style={[styles.governanceCard, { backgroundColor: governanceTone.bg, borderColor: governanceTone.border }]}>
						<Text style={[styles.governanceTitle, { color: governanceTone.text }]}>Lifecycle</Text>
						<Text style={[styles.governanceText, { color: governanceTone.text }]}>
							{getWorkRequestGovernanceLabel(workRequestData)}
						</Text>
					</View>
				</View>

				<View style={styles.sectionCard}>
					<Text style={styles.sectionTitle}>Request Details</Text>
					<InfoRow label="Priority" value={workRequestData?.priority || "N/A"} />
					<InfoRow label="Problem Type" value={workRequestData?.problemType || "N/A"} />
					<InfoRow label="Location" value={workRequestData?.location_id?.location_name || "N/A"} />
					<InfoRow label="Asset" value={workRequestData?.asset_id?.asset_name || "N/A"} />
					<InfoRow label="Review Due" value={formatRequestDateTime(workRequestData?.review_due_at)} />
					<InfoRow label="Order Due" value={formatRequestDateTime(workRequestData?.order_due_at)} />
					<InfoRow label="Attachments" value={`${workRequestData?.files?.length || 0}`} />
				</View>

				<View style={styles.sectionCard}>
					<Text style={styles.sectionTitle}>Governance</Text>
					<InfoRow label="Approved By" value={formatRequestUserLabel(workRequestData?.approvedBy)} />
					<InfoRow label="Approved On" value={formatRequestDateTime(workRequestData?.approvedAt)} />
					<InfoRow label="Rejected By" value={formatRequestUserLabel(workRequestData?.rejectedBy)} />
					<InfoRow label="Rejected On" value={formatRequestDateTime(workRequestData?.rejectedAt)} />
					<InfoRow label="Converted By" value={formatRequestUserLabel(workRequestData?.convertedBy)} />
					<InfoRow label="Converted On" value={formatRequestDateTime(workRequestData?.convertedAt)} />
					<InfoRow
						label="Linked WO"
						value={workRequestData?.converted_order_no || workRequestData?.converted_work_order_id?.order_no || "N/A"}
					/>
					{workRequestData?.remarks ? <InfoRow label="Remarks" value={workRequestData.remarks} multiline /> : null}
				</View>

				<View style={styles.sectionCard}>
					<Text style={styles.sectionTitle}>Description</Text>
					<Text style={styles.descriptionText}>{workRequestData?.description || "No description available."}</Text>
				</View>

				{linkedWorkOrder?.id ? (
					<Pressable style={styles.linkedButton} onPress={handleOpenLinkedWorkOrder}>
						<Ionicons name="open-outline" size={16} color="#166534" />
						<Text style={styles.linkedButtonText}>
							Open linked work order {linkedWorkOrder.order_no ? `(${linkedWorkOrder.order_no})` : ""}
						</Text>
					</Pressable>
				) : null}

				{canApprove || canReject || canConvert ? (
					<View style={styles.actionButtons}>
						{canReject ? (
							<Pressable style={[styles.actionBtn, styles.rejectBtn]} onPress={() => setRejectVisible(true)}>
								<MaterialIcons name="cancel" size={16} color="#fff" />
								<Text style={styles.actionBtnTxt}>Reject</Text>
							</Pressable>
						) : null}

						{canApprove ? (
							<Pressable style={[styles.actionBtn, styles.approveBtn]} onPress={handleApproveRequest}>
								<Ionicons name="checkmark-circle" size={16} color="#fff" />
								<Text style={styles.actionBtnTxt}>Approve</Text>
							</Pressable>
						) : null}

						{canConvert ? (
							<Pressable style={[styles.actionBtn, styles.convertBtn]} onPress={handleCreateWorkOrder}>
								<Ionicons name="construct-outline" size={16} color="#fff" />
								<Text style={styles.actionBtnTxt}>Create WO</Text>
							</Pressable>
						) : null}
					</View>
				) : null}
			</ScrollView>

			<RejectModal
				visible={rejectVisible}
				item={workRequestData}
				onCancel={() => setRejectVisible(false)}
				onSubmit={async (reason) => {
					setRejectVisible(false);
					try {
						const response = await rejectWorkRequest(workRequestData?.id, reason);
						if (response?.status) {
							ToastAndroid.show("Request rejected successfully", ToastAndroid.SHORT);
							fetchWorkRequestDetails();
						}
					} catch (error: any) {
						ToastAndroid.show(error?.message || "Unable to reject request", ToastAndroid.SHORT);
					}
				}}
			/>
		</>
	);
}

function InfoRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
	return (
		<View style={[styles.infoRow, multiline && styles.infoRowMultiline]}>
			<Text style={styles.infoLabel}>{label}</Text>
			<Text style={[styles.infoValue, multiline && styles.infoValueMultiline]}>{value || "N/A"}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#F5F7FA",
		padding: 20,
		paddingBottom: 120,
	},
	retryBanner: {
		backgroundColor: "#FFF7ED",
		borderRadius: 18,
		padding: 14,
		borderWidth: 1,
		borderColor: "#FDBA74",
		marginBottom: 8,
		flexDirection: "row",
		gap: 12,
		alignItems: "flex-start",
	},
	retryBannerTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		color: "#9A3412",
	},
	retryBannerText: {
		marginTop: 4,
		fontFamily: Fonts.regular,
		fontSize: 11,
		lineHeight: 16,
		color: "#9A3412",
	},
	retryBannerAction: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 999,
		backgroundColor: "#FED7AA",
	},
	retryBannerActionText: {
		fontFamily: Fonts.semiBold,
		fontSize: 10,
		color: "#9A3412",
	},
	heroCard: {
		backgroundColor: "#FFFFFF",
		padding: 18,
		borderRadius: 22,
		marginVertical: 6,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		shadowColor: "#0F172A",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 12,
		elevation: 2,
	},
	heroHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: 10,
	},
	heroTextWrap: {
		flex: 1,
	},
	kicker: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#7C3AED",
		marginBottom: 6,
	},
	heroTitle: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#111827",
		lineHeight: 24,
	},
	heroMeta: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#64748B",
		marginTop: 10,
		lineHeight: 18,
	},
	statusChip: {
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	statusChipText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
	},
	governanceCard: {
		marginTop: 14,
		borderWidth: 1,
		borderRadius: 16,
		padding: 14,
	},
	governanceTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		marginBottom: 6,
	},
	governanceText: {
		fontFamily: Fonts.medium,
		fontSize: 13,
		lineHeight: 18,
	},
	sectionCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		padding: 16,
		marginVertical: 6,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		shadowColor: "#0F172A",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 12,
		elevation: 2,
	},
	sectionTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 14,
		color: "#111827",
		marginBottom: 10,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 8,
		gap: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F1F5F9",
	},
	infoRowMultiline: {
		alignItems: "flex-start",
	},
	infoLabel: {
		fontFamily: Fonts.medium,
		fontSize: 12,
		color: "#64748B",
		flex: 0.8,
	},
	infoValue: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#0F172A",
		flex: 1.2,
		textAlign: "right",
	},
	infoValueMultiline: {
		textAlign: "left",
	},
	descriptionText: {
		fontFamily: Fonts.regular,
		fontSize: 13,
		color: "#334155",
		lineHeight: 20,
	},
	linkedButton: {
		marginTop: 8,
		backgroundColor: "#ECFDF5",
		borderRadius: 18,
		borderWidth: 1,
		borderColor: "#A7F3D0",
		paddingHorizontal: 16,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	linkedButtonText: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		color: "#166534",
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "center",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 18,
	},
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderRadius: 14,
		minWidth: 140,
	},
	rejectBtn: {
		backgroundColor: "#DC2626",
	},
	approveBtn: {
		backgroundColor: "#7C3AED",
	},
	convertBtn: {
		backgroundColor: "#2563EB",
	},
	actionBtnTxt: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		color: "#fff",
		lineHeight: 16,
	},
	popoverContent: {
		backgroundColor: "#fff",
		paddingVertical: 10,
	},
	popoverItem: {
		width: 170,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	popoverHeading: {
		color: "#7C3AED",
		fontFamily: Fonts.semiBold,
		fontSize: 12,
	},
	popoverOption: {
		color: "#334155",
		fontFamily: Fonts.regular,
		fontSize: 12,
	},
});

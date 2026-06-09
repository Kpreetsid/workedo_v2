import Header from "@/components/global/Header";
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import Fonts from "@/constants/Typography";
import { endpoints } from "@/src/api/endpoints";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { mapUserToLocation } from "@/src/services/location.service";
import { getSOPs } from "@/src/services/preventive.service";
import { createWorkOrder, updateWorkOrder, workOrderImageUpload } from "@/src/services/work-order.service";
import { getParts } from "@/src/services/part.service";
import { WorkOrder } from "@/src/types/workOrder";
import { ProcedureTemplate } from "@/src/types/procedure";
import { PartShortage, buildResolvedWorkOrderParts, findPartShortages } from "@/src/utils/workOrderParts";

import ActionButton from "@/components/create-screens/ActionButton";
import AttachmentUpload from "./AttachmentUpload";
import AssignSectionNew from "@/components/create-work-order/AssignSectionNew";
import ModalCalendar from "../global/ModalCalendar";
import SelectParts from "./SelectParts";
import { FormField } from "@/components/global/FormField";

interface WorkOrderProps {
	passedData?: Record<string, any> | null;
}

const resolveEntityId = (value: any): string => {
	if (!value) return "";
	if (typeof value === "string" || typeof value === "number") return String(value);
	const resolvedId = value?.id ?? value?._id ?? value?.location_id ?? value?.asset_id;
	return resolvedId !== undefined && resolvedId !== null ? String(resolvedId) : "";
};

const mapEditableParts = (parts: any[] = []) =>
	(parts || []).map((part: any) => ({
		part_id: resolveEntityId(part?.part_id || part),
		part_name: part?.part_name || "",
		part_number: part?.part_number || "",
		part_type: part?.part_type || "",
		unit: part?.unit || "",
		cost: Number(part?.cost || 0),
		currency: part?.currency || "INR",
		estimatedQuantity: Number(part?.estimatedQuantity ?? part?.plannedQuantity ?? 0),
		actualQuantity: part?.actualQuantity ?? null,
		procedureLinked: Boolean(part?.procedureLinked),
		procedureNames: Array.isArray(part?.procedureNames) ? part.procedureNames : [],
	}));

const resolveWorkOrderAttachmentUri = (attachment: any): string => {
	if (!attachment) return "";
	if (attachment?.uri) return String(attachment.uri);
	if (attachment?.fileUrl) return String(attachment.fileUrl);
	if (attachment?.folderName && attachment?.fileName) {
		return `${endpoints.baseURL}${attachment.folderName}/${attachment.fileName}`;
	}
	if (attachment?.image_path) {
		return `${endpoints.baseURL}${attachment.image_path}`;
	}
	if (attachment?.fileName) {
		return `${endpoints.baseURL}${attachment.fileName}`;
	}
	return "";
};

export default function NewWorkOrder({ passedData }: WorkOrderProps) {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;
	const isFollowUpMode = params?.mode === "follow-up" || passedData?.isFollowUp;
	const isParentExecutionOwnedEdit = Boolean(passedData?.id && passedData?.hierarchy?.executionOwnedByChildren);
	const followUpParentLabel = passedData?.order_no || passedData?.parentOrder?.order_no || passedData?.hierarchy?.parentReference?.order_no || "";
	const followUpParentTitle = passedData?.title || passedData?.parentOrder?.title || passedData?.hierarchy?.parentReference?.title || "";

	const { user } = useAuthStore();
	const { setWorkForm, resetForm } = useWorkOrderStore();

	const [id, setId] = useState<string>("");
	const [forms, setForms] = useState<any[]>([]);
	const [imageError, setImageError] = useState(false);
	const [showCalendar, setShowCalendar] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);
	const [partStockValidationIssues, setPartStockValidationIssues] = useState<PartShortage[]>([]);

	const attachments = useWorkOrderStore((state) => state.attachments);
	const manualParts = useWorkOrderStore((state) => state.parts);
	const selectedProcedures = useWorkOrderStore((state) => state.selected_procedures);
	const procedureIds = useWorkOrderStore((state) => state.procedure_ids);
	const workOrderLocation = useWorkOrderStore((state) => state.location);
	const selectedAsset = useWorkOrderStore((state) => state.selected_asset);
	const titleDraft = useWorkOrderStore((state) => state.title);
	const messageDraft = useWorkOrderStore((state) => state.message);
	const assignedUsersDraft = useWorkOrderStore((state) => state.assigned_users);
	const hasDraft = useMemo(
		() =>
			Boolean(
				titleDraft ||
				messageDraft ||
				workOrderLocation ||
				selectedAsset ||
				assignedUsersDraft.length ||
				manualParts.length ||
				selectedProcedures.length ||
				attachments.length
			),
		[assignedUsersDraft.length, attachments.length, manualParts.length, messageDraft, selectedAsset, selectedProcedures.length, titleDraft, workOrderLocation]
	);

	const locationId = resolveEntityId(workOrderLocation);
	const resolvedParts = useMemo(
		() => buildResolvedWorkOrderParts(manualParts, selectedProcedures),
		[manualParts, selectedProcedures]
	);

	useEffect(() => {
		if (passedData) {
			const data = passedData as WorkOrder & { procedures?: ProcedureTemplate[] };
			const isWorkRequestSource =
				(data as any)?.sourceType === "work-request" ||
				Boolean((data as any)?.request_no && (data as any)?.location_id);
			const preselectedProcedures = Array.isArray(data?.procedures)
				? data.procedures
				: Array.isArray(data?.procedure_entries)
					? data.procedure_entries
					: [];
			const preselectedProcedureIds = Array.isArray(data?.procedure_ids) && data.procedure_ids.length
				? data.procedure_ids
				: preselectedProcedures.map((procedure: any) => resolveEntityId(procedure?.procedure_id || procedure?.id || procedure)).filter(Boolean);

			setId(isWorkRequestSource ? "" : resolveEntityId(data?.id || data?._id));
			setWorkForm("title", data?.title || "");
			setWorkForm("message", data?.description || "");
			setWorkForm(
				"location",
				(isWorkRequestSource ? (data as any)?.location_id : null) || data?.location || data?.wo_location_id || null
			);
			setWorkForm(
				"selected_asset",
				(isWorkRequestSource ? (data as any)?.asset_id : null) || data?.asset || data?.wo_asset_id || null
			);
			setWorkForm(
				"nature_of_work",
				(isWorkRequestSource ? (data as any)?.problemType : null) || data?.nature_of_work || data?.type || "Preventive"
			);
			setWorkForm("completion_days", String(data?.estimated_time ?? ""));
			setWorkForm("priority", data?.priority || "None");
			setWorkForm("attachments", Array.isArray(data?.files) ? data.files : []);
			setWorkForm("sop_form_data", data?.sop_form_data ?? {});
			setWorkForm("start_date", data?.start_date ? moment(data.start_date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"));
			setWorkForm("end_date", data?.end_date ? moment(data.end_date).format("YYYY-MM-DD") : moment().add(2, "days").format("YYYY-MM-DD"));
			setWorkForm("parts", mapEditableParts(data?.parts || []));
			setWorkForm("tasks", data?.tasks ?? []);
			setWorkForm("procedure_ids", preselectedProcedureIds);
			setWorkForm("selected_procedures", preselectedProcedures as ProcedureTemplate[]);
			setWorkForm("work_request_id", isWorkRequestSource ? resolveEntityId((data as any)?.work_request_id || data?.id) : "");
			setWorkForm(
				"parent_id",
				isFollowUpMode
					? resolveEntityId(data?.id || data?._id || data?.parentId)
					: resolveEntityId(data?.parentId)
			);

			if (data?.sop_form_id) {
				setWorkForm("sop_form_id", resolveEntityId(data?.sop_form_id));
			}

			const locationValue =
				(isWorkRequestSource ? (data as any)?.location_id : null) || data?.location || data?.wo_location_id;
			const assignedUsers = Array.isArray(data?.assignedUsers) ? data.assignedUsers : [];
			const mappedLocationId = resolveEntityId(locationValue);
			if (mappedLocationId) {
				mapUserToLocationFunc(mappedLocationId, assignedUsers);
			}

			setWorkForm("isLoaded", true);
		}
	}, [isFollowUpMode, passedData, setWorkForm]);

	const mapUserToLocationFunc = async (targetLocationId: string, selectedUsers: any[] = []) => {
		try {
			const res = await mapUserToLocation(targetLocationId);
			if (res?.status) {
				const assignedUserIds = Array.isArray(selectedUsers)
					? selectedUsers.map((entry: any) => entry?.user?.id ?? entry?.id).filter(Boolean)
					: [];
				const mappedUsers = Array.isArray(res?.data)
					? res.data.filter((entry: any) => assignedUserIds.includes(entry?.user?.id ?? entry?.id))
					: [];
				setWorkForm("assigned_users", mappedUsers);
			}
		} catch (error) {
			console.log("mapUserToLocation error =", error);
			setWorkForm("assigned_users", []);
		}
	};

	useEffect(() => {
		const fetchForms = async () => {
			try {
				const res = await getSOPs();
				if (res?.status) {
					setForms(Array.isArray(res?.data) ? res.data : []);
					if (passedData?.sop_form_id) {
						const selectedForm = res.data?.find((form: any) => resolveEntityId(form?.id || form?._id) === resolveEntityId(passedData?.sop_form_id));
						if (selectedForm) {
							setWorkForm("sop_form_id", selectedForm.name);
						}
					}
				}
			} catch (error) {
				console.error("Error fetching forms:", error);
			}
		};

		fetchForms();
	}, [passedData?.sop_form_id, setWorkForm]);

	useEffect(() => {
		let ignore = false;

		const refreshShortages = async () => {
			if (!locationId || resolvedParts.length === 0) {
				if (!ignore) {
					setPartStockValidationIssues([]);
				}
				return;
			}

			try {
				const res = await getParts(locationId);
				if (!ignore) {
					const shortages = findPartShortages(resolvedParts, Array.isArray(res?.data) ? res.data : []);
					setPartStockValidationIssues(shortages);
				}
			} catch (error) {
				if (!ignore) {
					setPartStockValidationIssues([]);
				}
			}
		};

		refreshShortages();

		return () => {
			ignore = true;
		};
	}, [locationId, resolvedParts]);

	const handleRemoveManualPart = (partId: string) => {
		const updatedParts = manualParts.filter((part: any) => resolveEntityId(part?.part_id || part) !== partId);
		setWorkForm("parts", updatedParts);
	};

	const validateResolvedPartsStock = async () => {
		if (!resolvedParts.length) {
			setPartStockValidationIssues([]);
			return true;
		}

		if (!locationId) {
			ToastAndroid.show("Please select a location before saving the work order", ToastAndroid.SHORT);
			return false;
		}

		try {
			const res = await getParts(locationId);
			const shortages = findPartShortages(resolvedParts, Array.isArray(res?.data) ? res.data : []);
			setPartStockValidationIssues(shortages);

			if (shortages.length > 0) {
				const primaryIssue = shortages[0]!;
				ToastAndroid.show(
					shortages.length === 1
						? `Insufficient stock for ${primaryIssue.part_name}. Required ${primaryIssue.requiredQuantity}, available ${primaryIssue.availableQuantity}.`
						: `${shortages.length} parts do not have enough stock for this work order.`,
					ToastAndroid.LONG
				);
				return false;
			}

			return true;
		} catch (error) {
			ToastAndroid.show("Unable to validate parts availability right now. Please try again.", ToastAndroid.LONG);
			return false;
		}
	};

	const handleSubmit = async () => {
		const data: any = useWorkOrderStore.getState();

		const requiredFields: Array<{ key: keyof typeof data; label: string }> = [
			{ key: "title", label: "Title" },
			{ key: "location", label: "Location" },
			{ key: "selected_asset", label: "Asset" },
			{ key: "assigned_users", label: "Assigned Users" },
			{ key: "start_date", label: "Start Date" },
			{ key: "end_date", label: "End Date" },
		];

		for (const field of requiredFields) {
			const value = data[field.key];
			if (Array.isArray(value)) {
				if (!value.length) {
					ToastAndroid.show(`${field.label} is required`, ToastAndroid.SHORT);
					return;
				}
				continue;
			}

			if (!value) {
				ToastAndroid.show(`${field.label} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		if (data.start_date > data.end_date) {
			ToastAndroid.show("End date should be greater than start date", ToastAndroid.SHORT);
			return;
		}

		const missingTaskType = data?.tasks?.some((task: any) => !task?.type);
		if (missingTaskType) {
			ToastAndroid.show("Please select a task type", ToastAndroid.SHORT);
			return;
		}

		const stockValidationPassed = await validateResolvedPartsStock();
		if (!stockValidationPassed) {
			return;
		}

		const payload: any = {
			title: data.title,
			description: data.message,
			end_date: data.end_date,
			estimated_time: data.completion_days ? Number(data.completion_days) : undefined,
			files: data.attachments || [],
			priority: data.priority || "None",
			sop_form_id: forms.find((form: any) => form.name === data.sop_form_id)?.id || resolveEntityId(data.sop_form_id) || null,
			start_date: data.start_date,
			type: data.nature_of_work,
			nature_of_work: data.nature_of_work,
			userIdList: (data.assigned_users || []).map((entry: any) => entry?.user?.id ?? entry?.id).filter(Boolean),
			wo_asset_id: resolveEntityId(data.selected_asset),
			wo_location_id: resolveEntityId(data.location),
			tasks: data.tasks || [],
		};

		if (!id) {
			payload.status = "Open";
			payload.createdFrom = data.work_request_id ? "Work Request" : "Work Order";
		}

		if (data.work_request_id) {
			payload.work_request_id = data.work_request_id;
		}

		if (data.parent_id) {
			payload.parentId = data.parent_id;
		}

		if (data.sop_form_data && Object.keys(data.sop_form_data).length > 0) {
			payload.sop_form_data = data.sop_form_data;
		}

		if (!(passedData?.hierarchy?.executionOwnedByChildren && id)) {
			payload.parts = resolvedParts.map((part: any) => ({
				part_id: part.part_id,
				part_name: part.part_name,
				part_type: part.part_type || "Procedure",
				part_number: part.part_number,
				estimatedQuantity: Number(part.estimatedQuantity || 0),
				actualQuantity: part.actualQuantity ?? null,
				unit: part.unit || "",
				cost: Number(part.cost || 0),
				currency: part.currency || "INR",
			}));
			payload.oldParts = Array.isArray(passedData?.parts) ? passedData.parts : [];
			payload.procedure_ids = data.procedure_ids || procedureIds || [];
		}

		try {
			const response = id
				? await updateWorkOrder(id, payload)
				: await createWorkOrder(payload);

			if (response?.status) {
				useWorkOrderStore.getState().resetForm();
				useWorkRequestStore.getState().resetWorkRequestForm();
				ToastAndroid.show(id ? "Work order updated successfully!" : "Work order created successfully!", ToastAndroid.SHORT);
				if (comingFrom === "overview") {
					router.replace("/workOrders");
				} else if (data.work_request_id) {
					router.replace("/requests");
				} else {
					router.replace("/workOrders");
				}
			}
		} catch (error: any) {
			console.error("Work order save error =", error);
			ToastAndroid.show(error?.message || "Failed to save work order", ToastAndroid.LONG);
		}
	};

	const pickImage = (fromCamera = false) => {
		const options: any = {
			mediaType: "photo" as const,
			quality: 0.8,
		};

		if (fromCamera) {
			launchCamera(options, handleImageResponse);
			return;
		}

		launchImageLibrary(options, handleImageResponse);
	};

	const handleImageResponse = async (response: any) => {
		if (response.didCancel) return;
		if (response.errorCode) {
			Alert.alert("Error", response.errorMessage || "Image selection failed");
			return;
		}

		const asset = response.assets?.[0];
		if (!asset) return;

		try {
			const uploaded = await workOrderImageUpload(asset, user);
			if (uploaded) {
				setWorkForm("attachments", [uploaded]);
			}
		} catch (error) {
			console.log("work order image upload error =", error);
		}
	};

	return (
		<KeyboardAwareScrollView bottomOffset={30}>
			<ScrollView style={styles.container}>
				{!passedData && hasDraft ? (
					<View style={styles.draftBanner}>
						<View style={{ flex: 1 }}>
							<Text style={styles.draftBannerTitle}>Draft restored</Text>
							<Text style={styles.draftBannerText}>
								Your unsaved work order is still here. Continue editing or clear it and start a fresh job.
							</Text>
						</View>
						<TouchableOpacity onPress={resetForm} style={styles.draftBannerAction}>
							<Text style={styles.draftBannerActionText}>Clear</Text>
						</TouchableOpacity>
					</View>
				) : null}

				{isFollowUpMode ? (
					<View style={styles.followUpBanner}>
						<View style={styles.followUpBannerIconWrap}>
							<Ionicons name="git-branch-outline" size={18} color="#5B21B6" />
						</View>
						<View style={{ flex: 1 }}>
							<Text style={styles.followUpEyebrow}>Follow-up Work Order</Text>
							<Text style={styles.followUpTitle}>
								This work order will stay linked to {followUpParentLabel || "the parent work order"}.
							</Text>
							{followUpParentTitle ? <Text style={styles.followUpMeta}>{followUpParentTitle}</Text> : null}
						</View>
					</View>
				) : null}

				<View style={styles.subContainer}>
					<FormField
						label="Title"
						placeholder="Enter Title"
						field="title"
						store={useWorkOrderStore}
						setterName="setWorkForm"
						styles={{ paddingHorizontal: 25 }}
					/>

					<FormField
						label="Description"
						placeholder="Enter a description"
						field="message"
						store={useWorkOrderStore}
						setterName="setWorkForm"
						required={false}
						styles={{ paddingHorizontal: 25 }}
					/>
				</View>

				<AssignSectionNew type="workOrders" lockLocation={Boolean(isFollowUpMode)} />

				{isFollowUpMode ? (
					<View style={styles.lockedNote}>
						<Text style={styles.lockedNoteText}>
							Follow-up work orders inherit the parent location. You can still change the asset and assignees within that location.
						</Text>
					</View>
				) : null}

				{isParentExecutionOwnedEdit ? (
					<View style={styles.executionOwnedNote}>
						<Text style={styles.executionOwnedNoteTitle}>Execution is tracked on child work orders</Text>
						<Text style={styles.executionOwnedNoteText}>
							This parent work order rolls up child progress. Parts, procedures, labor, and actual execution capture should be maintained on the child work orders instead of the parent.
						</Text>
					</View>
				) : null}

				<FormField
					label="Nature of Work"
					type="dropdown"
					field="nature_of_work"
					options={["Preventive", "Electrical", "Break Down", "Inspection", "Corrective", "Safety", "Upgrade", "Meter Reading", "Mechanical", "Other"]}
					store={useWorkOrderStore}
					setterName="setWorkForm"
					styles={{ paddingHorizontal: 25 }}
					required={false}
				/>

				<FormField
					label="Priority"
					type="dropdown"
					field="priority"
					options={["None", "Low", "Medium", "High", "Urgent"]}
					store={useWorkOrderStore}
					setterName="setWorkForm"
					styles={{ paddingHorizontal: 25 }}
					required={false}
				/>

				<View style={styles.labelContainer}>
					<View style={styles.inlineLabelRow}>
						<Text style={styles.labelText}>Start Date</Text>
						<Text style={styles.asterisk}>*</Text>
					</View>

					<Pressable
						style={styles.dateField}
						onPress={() => {
							setActiveDateField("start_date");
							setShowCalendar(true);
						}}
					>
						<TextInput
							placeholder="yyyy-mm-dd"
							placeholderTextColor="#999"
							readOnly
							style={styles.dateInput}
							value={useWorkOrderStore.getState().start_date || ""}
						/>
					</Pressable>
				</View>

				<View style={styles.labelContainer}>
					<View style={styles.inlineLabelRow}>
						<Text style={styles.labelText}>End Date</Text>
						<Text style={styles.asterisk}>*</Text>
					</View>

					<Pressable
						style={styles.dateField}
						onPress={() => {
							setActiveDateField("end_date");
							setShowCalendar(true);
						}}
					>
						<TextInput
							placeholder="yyyy-mm-dd"
							placeholderTextColor="#999"
							readOnly
							style={styles.dateInput}
							value={useWorkOrderStore.getState().end_date || ""}
						/>
					</Pressable>
				</View>

				<ModalCalendar
					showCalendar={showCalendar}
					setShowCalendar={setShowCalendar}
					activeDateField={activeDateField || "start_date"}
					startDate={useWorkOrderStore.getState().start_date}
					currentDate={activeDateField === "end_date" ? useWorkOrderStore.getState().end_date : useWorkOrderStore.getState().start_date}
					onSelectDate={(date) => {
						const formatted = moment(date).format("YYYY-MM-DD");
						if (activeDateField) {
							useWorkOrderStore.getState().setWorkForm(activeDateField, formatted);
							setActiveDateField(null);
						}
					}}
				/>

				<FormField
					label="Estimation Duration (Hours)"
					placeholder="Enter estimation duration"
					field="completion_days"
					store={useWorkOrderStore}
					setterName="setWorkForm"
					styles={{ paddingHorizontal: 25 }}
					required={false}
					showKeyboardType="numeric"
				/>

				<AttachmentUpload onPress={() => pickImage()} />

				{attachments.length > 0 && !imageError ? (
					<View style={styles.attachmentPreview}>
						<View style={{ position: "relative" }}>
							<Image
								source={{ uri: resolveWorkOrderAttachmentUri(attachments[0]) }}
								style={{ width: 200, height: 200, borderRadius: 8 }}
								onError={() => setImageError(true)}
							/>

							<TouchableOpacity
								onPress={() => setWorkForm("attachments", [])}
								style={styles.attachmentRemove}
							>
								<Feather name="x" size={16} color="#fff" />
							</TouchableOpacity>
						</View>
					</View>
				) : null}

				{!isParentExecutionOwnedEdit ? (
					<>
						<SelectParts
							onPress={() => {
								if (locationId) {
									router.push({
										pathname: "/addParts",
										params: { comingFrom: "newWorkOrder" },
									});
								} else {
									ToastAndroid.show("Please select a location", ToastAndroid.SHORT);
								}
							}}
						/>

						<View style={styles.partsContainer}>
							{resolvedParts.map((part: any) => {
								const partId = resolveEntityId(part?.part_id || part);
								const hasManualSelection = manualParts.some((manualPart: any) => resolveEntityId(manualPart?.part_id || manualPart) === partId);
								return (
									<View style={[styles.partItem, part.procedureLinked && styles.partItemProcedure]} key={partId}>
										<Text style={styles.partText}>
											{part.part_name} ({part.estimatedQuantity})
										</Text>
										{part.procedureLinked ? (
											<Text style={styles.partBadge}>
												{part.manualQuantity ? "manual + procedure" : "procedure"}
											</Text>
										) : null}
										{hasManualSelection ? (
											<Pressable onPress={() => handleRemoveManualPart(partId)}>
												<Ionicons name="close" size={16} color="#000" />
											</Pressable>
										) : null}
									</View>
								);
							})}
						</View>

						{partStockValidationIssues.length > 0 ? (
							<View style={styles.shortageCard}>
								<Text style={styles.shortageTitle}>Stock shortages</Text>
								{partStockValidationIssues.map((issue) => (
									<Text key={issue.part_id} style={styles.shortageText}>
										{issue.part_name}: need {issue.requiredQuantity}, available {issue.availableQuantity}
									</Text>
								))}
							</View>
						) : null}

						{selectedProcedures.length > 0 ? (
							<View style={styles.procedureSummaryCard}>
								<Text style={styles.procedureSummaryTitle}>Linked procedures</Text>
								{selectedProcedures.map((procedure) => (
									<Text key={procedure.id} style={styles.procedureSummaryText}>
										{procedure.name}
									</Text>
								))}
							</View>
						) : null}
					</>
				) : null}

				<ActionButton onPress={handleSubmit} label={id ? "Update" : "Submit"} buttonStyle={styles.submitBtn} />
			</ScrollView>
		</KeyboardAwareScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9f9ff",
	},
	draftBanner: {
		marginHorizontal: 20,
		marginTop: 16,
		marginBottom: 8,
		padding: 14,
		borderRadius: 12,
		backgroundColor: "#EFF6FF",
		borderWidth: 0.8,
		borderColor: "#BFDBFE",
		flexDirection: "row",
		gap: 12,
		alignItems: "flex-start",
	},
	draftBannerTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#1D4ED8",
	},
	draftBannerText: {
		marginTop: 4,
		fontSize: 11,
		lineHeight: 16,
		fontFamily: Fonts.regular,
		color: "#475569",
	},
	draftBannerAction: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 999,
		backgroundColor: "#DBEAFE",
	},
	draftBannerActionText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#1D4ED8",
	},
	subContainer: {
		backgroundColor: "#f9f9ff",
	},
	followUpBanner: {
		marginHorizontal: 20,
		marginTop: 16,
		marginBottom: 8,
		padding: 14,
		borderRadius: 12,
		backgroundColor: "#F4EDFF",
		borderWidth: 0.8,
		borderColor: "#C4B5FD",
		flexDirection: "row",
		gap: 12,
		alignItems: "flex-start",
	},
	followUpBannerIconWrap: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#E9D5FF",
		alignItems: "center",
		justifyContent: "center",
	},
	followUpEyebrow: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#6D28D9",
		textTransform: "uppercase",
	},
	followUpTitle: {
		marginTop: 4,
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 18,
	},
	followUpMeta: {
		marginTop: 4,
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#475569",
	},
	submitBtn: {
		marginHorizontal: 20,
		marginBottom: 24,
	},
	partsContainer: {
		paddingHorizontal: 25,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	partItem: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		backgroundColor: "rgba(117, 43, 223, 0.1)",
		borderColor: "#752BDF",
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 6,
		alignItems: "center",
		flexDirection: "row",
		gap: 5,
	},
	partItemProcedure: {
		backgroundColor: "#FFF6E5",
		borderColor: "#D48806",
	},
	partText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	partBadge: {
		fontSize: 10,
		fontFamily: Fonts.medium,
		color: "#7A4A00",
	},
	labelContainer: {
		paddingHorizontal: 25,
		marginVertical: 10,
	},
	inlineLabelRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	labelText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	asterisk: {
		color: "#D63928",
		fontSize: 12,
		fontFamily: Fonts.regular,
		marginTop: -2,
		marginLeft: 2,
	},
	dateField: {
		width: "100%",
		marginTop: 10,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		backgroundColor: "#fff",
	},
	dateInput: {
		borderRadius: 8,
		height: 40,
		backgroundColor: "#fff",
		fontSize: 12,
		paddingStart: 12,
		fontFamily: Fonts.regular,
	},
	attachmentPreview: {
		padding: 10,
		marginHorizontal: 20,
		alignSelf: "flex-start",
	},
	attachmentRemove: {
		position: "absolute",
		top: -8,
		right: -8,
		backgroundColor: "#000",
		borderRadius: 12,
		padding: 4,
	},
	shortageCard: {
		marginHorizontal: 25,
		marginTop: 12,
		marginBottom: 8,
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#FFF1F0",
		borderWidth: 1,
		borderColor: "#FFCCC7",
	},
	shortageTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#A8071A",
		marginBottom: 6,
	},
	shortageText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#5C0011",
		marginBottom: 4,
	},
	executionOwnedNote: {
		marginHorizontal: 20,
		marginTop: 4,
		marginBottom: 8,
		padding: 12,
		borderRadius: 10,
		backgroundColor: "#FFF7E6",
		borderWidth: 0.8,
		borderColor: "#FFD591",
	},
	executionOwnedNoteTitle: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#7A4A00",
		marginBottom: 4,
	},
	executionOwnedNoteText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#7A4A00",
		lineHeight: 15,
	},
	procedureSummaryCard: {
		marginHorizontal: 25,
		marginTop: 12,
		marginBottom: 8,
		padding: 12,
		borderRadius: 8,
		backgroundColor: "#F6FFED",
		borderWidth: 1,
		borderColor: "#B7EB8F",
	},
	procedureSummaryTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#237804",
		marginBottom: 6,
	},
	procedureSummaryText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#135200",
		marginBottom: 4,
	},
	lockedNote: {
		marginHorizontal: 25,
		marginTop: 4,
		padding: 10,
		borderRadius: 8,
		backgroundColor: "#F0F5FF",
		borderWidth: 1,
		borderColor: "#ADC6FF",
	},
	lockedNoteText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#1D39C4",
	},
});

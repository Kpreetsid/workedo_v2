import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import AssignInput from "@/components/create-screens/AssignInput";
import Fonts from "@/constants/Typography";
import { DropDownIcon } from "@/constants/IconProvider";
import ActionButton from "@/components/create-screens/ActionButton";
import AssignInputContainer from "@/components/create-work-order/AssignInputContainer";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import DropDownInput from "@/components/create-screens/DropDownInput";
import { Feather, Ionicons } from "@expo/vector-icons";
import { createWorkOrder, createWorkRequest, editWorkRequest } from "@/src/services/work-request.service";
import { useEffect, useRef, useState } from "react";
import { getSOPs } from "@/src/services/preventive.service";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DatePicker from "@/components/global/DatePicker";
import moment from "moment";
import { AssignSection } from "@/components/create-work-order/AssignSection";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { FormField } from "@/components/global/FormField";
import AssignSectionNew from "@/components/create-work-order/AssignSectionNew";
import { Image } from "expo-image";
import { endpoints } from "@/src/api/endpoints";
import { WorkRequest } from "@/src/types/workRequest";

export default function NewWorkRequest() {
	const router = useRouter();
	const params = useLocalSearchParams<{ passedData?: string; isEdit?: string }>();
	// 🔒 SAFE PARSE
	const [data, setData] = useState<{ passedData: WorkRequest | null; isEdit: string | undefined }>({ passedData: null, isEdit: undefined });
	const [initialized, setInitialized] = useState(false);
	const { setWorkRequestForm, resetWorkRequestForm } = useWorkRequestStore();
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);
	const isEditMode = params?.isEdit === "true" && Boolean(params?.passedData);

	const [requestId, setRequestId] = useState<string>("");

	useEffect(() => {
		return () => {
			resetWorkRequestForm();
		}
	}, [])

	// typed, parsed object
	useEffect(() => {
		if (initialized) return;

		const { passedData, isEdit } = params;

		if (!passedData) {
			// Missing payload is normal in create mode; warn only for broken edit navigation.
			if (isEdit === "true") {
				console.warn("❌ passedData: passedData param missing");
			}
			setData({ passedData: null, isEdit: undefined });
			return;
		}

		try {
			const parsed = JSON.parse(passedData) as WorkRequest;
			console.log('parsed now = ', parsed)
			setData({
				passedData: parsed,
				isEdit,
			});
			console.log("Parsed Data:", { passedData: parsed, isEdit });
		} catch (e) {
			console.error("❌ newWorkRequest: failed to parse passedData", e);
			setData({ passedData: null, isEdit: undefined });
		}
	}, [params?.passedData, params?.isEdit, initialized]);

	useEffect(() => {
		if (!data) return; // ← only return if data isn't ready
		console.log('data parsed = ', data)

		if (!initialized && data.passedData) {
			setRequestId(data?.passedData?.id);
			setWorkRequestForm("title", data?.passedData?.title);
			setWorkRequestForm("message", data?.passedData?.description);
			setWorkRequestForm("location", data?.passedData?.location_id);
			setWorkRequestForm("selected_asset", data?.passedData?.asset_id);
			setWorkRequestForm("nature_of_work", data?.passedData?.problemType ?? null);
			setWorkRequestForm("priority", data?.passedData?.priority ?? "");

			if (data?.passedData?.files?.length! > 0) {
				setWorkRequestForm("attachments", data?.passedData?.files);
			}

			setInitialized(true); // ← only set here
		}
	}, [data])

	const handleSubmit = async () => {
		const data: any = useWorkRequestStore.getState();
		console.log("Work request Form =", data);

		// ✅ Basic validation
		const required: (keyof typeof data)[] = [
			"title",
			"message",
			"location",
			"selected_asset",
			// "nature_of_work",
			// "priority",
		];

		for (const field of required) {
			if (!data[field]) {
				const label = (field as string)
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());
				ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		// ✅ Build final payload matching your structure
		const payload = {
			asset_id: data.selected_asset?.id || "",
			description: data.message,
			files: data.attachments || [],
			location_id: data.location?.id || "",
			priority: data.priority,
			problemType: data.nature_of_work,
			status: "Open",
			title: data.title,
		};

		console.log("📦 Final Work Request Payload:", payload);

		try {
			if (isEditMode) {
				console.log('data.id = ', requestId)
				const res = await editWorkRequest(requestId, payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Work Order updated successfully!", ToastAndroid.SHORT);
					useWorkRequestStore.getState().resetWorkRequestForm();
					router.back();
				}
			} else {
				const res = await createWorkRequest(payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Work Order created successfully!", ToastAndroid.SHORT);
					useWorkRequestStore.getState().resetWorkRequestForm();
					router.back();
				}
			}

		} catch (error) {
			console.error("❌ Error creating work request:", error);
			ToastAndroid.show("Failed to create work request!", ToastAndroid.SHORT);
		}
	};

	return (
		<View style={{ backgroundColor: "#F5F7FA", flex: 1 }}>
			<Header title={isEditMode ? "Edit Work Request" : "New Work Request"} />

			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: "#F5F7FA" }}>
				<ScrollView style={styles.container}>
					<View style={styles.subContainer}>

						<FormField
							label="Title"
							placeholder="Enter Title"
							field="title"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
							styles={{ paddingHorizontal: 25 }}
						/>

						<FormField
							label="Message"
							placeholder="Enter a message"
							field="message"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
							styles={{ paddingHorizontal: 25 }}
						/>

					</View>

					<AssignSection type="requests" />
					{/* <AssignSectionNew type="requests" /> */}

					{/* <AssignInputContainer /> */}

					<View style={[styles.row, { paddingHorizontal: 25, gap: 10 }]}>

						<FormField
							label="Problem Type"
							type="dropdown"
							field="nature_of_work"
							options={["Preventive", "Electrical", "Break Down", "Inspection", "Corrective", "Safety", "Upgrade", "Meter Reading", "Mechanical", "Other"]}
							router={router}
							comingFrom="newWorkRequest"
							required={false}
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
							styles={{
								flex: 1,
							}}
						/>

						<FormField
							label="Priority"
							type="dropdown"
							field="priority"
							options={["None", "Low", "Medium", "High"]}
							router={router}
							required={false}
							comingFrom="newWorkRequest"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
							styles={{
								flex: 1,
							}}
						/>

					</View>

					{/* <Pressable style={styles.uploadBtn}>
						<Text style={styles.uploadBtnText}>Upload or Capture Photos</Text>
					</Pressable> */}

					<FormField
						label="Attachments"
						type="attachments"
						placeholder=""
						field="attachments"
						router={router}
						required={false}
						comingFrom="newWorkRequest"
						store={useWorkRequestStore}
						setterName="setWorkRequestForm"
					/>

					{
						useWorkRequestStore.getState().attachments.length > 0 &&
						<View style={{ backgroundColor: 'transparent', padding: 10, marginHorizontal: 20, alignItems: 'flex-start' }}>
							<View style={{ position: "relative" }}>
								<Image
									source={{
										uri: `${endpoints.baseURL}work_request/${useWorkRequestStore.getState().attachments[0]?.fileName}`
									}}
									style={{ width: 200, height: 200, borderRadius: 8 }}
								/>

								<TouchableOpacity
									onPress={() => {
										setWorkRequestForm("attachments", [])
									}}
									style={{
										position: "absolute",
										top: -8,
										right: -8,
										backgroundColor: "#000",
										borderRadius: 12,
										padding: 4,
									}}
								>
									<Feather name="x" size={16} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>
					}

					<ActionButton
						onPress={handleSubmit}
						label={isEditMode ? "Update Work Request" : "Create Work Request"}
						buttonStyle={styles.submitBtn}
					/>
				</ScrollView>
			</KeyboardAwareScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9f9ff",
	},
	subContainer: {
		backgroundColor: "#f9f9ff",
	},
	label: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201f23",
	},
	value: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#201f23",
		padding: 6
	},
	row: {
		flexDirection: "row",
	},
	inputContainer: {
		borderRadius: 2,
		padding: 2
	},
	messageInput: {
		height: 80,
		textAlignVertical: "top"
	},
	dropdownsRow: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		paddingHorizontal: 20,
		borderRadius: 8
	},
	dropdownContainer: {
		gap: 3,
		padding: 5,
		flexShrink: 1,
	},
	dropdownTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201f23",
		flex: 1
	},
	dropdown: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 4,
		paddingVertical: 2,
		paddingHorizontal: 8,
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
	},
	dropdownItemText: {
		fontFamily: Fonts.regular,
		fontSize: 12,
	},
	uploadBtn: {
		backgroundColor: "#742BDE10",
		padding: 20,
		marginHorizontal: 25,
		marginVertical: 10,
		alignItems: "center",
		borderWidth: 0.5,
		borderColor: "#742BDE",
		borderStyle: "dashed",
		borderRadius: 4,
	},
	uploadBtnText: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#742BDE"
	},
	submitBtn: {
		marginHorizontal: 20
	},
	partsContainer: {
		paddingHorizontal: 25,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	partItem: {
		paddingHorizontal: 10,
		backgroundColor: "#fff",
		borderColor: "#999",
		borderWidth: 0.2,
		justifyContent: "center",
		padding: 6,
		gap: 5,
		borderRadius: 5,
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
	},
	partText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000",
	},
})

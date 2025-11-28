import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import AssignInput from "@/components/create-screens/AssignInput";
import Fonts from "@/constants/Typography";
import { DropDownIcon } from "@/constants/IconProvider";
import ActionButton from "@/components/create-screens/ActionButton";
import AssignInputContainer from "@/components/create-work-order/AssignInputContainer";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import DropDownInput from "@/components/create-screens/DropDownInput";
import { Ionicons } from "@expo/vector-icons";
import { approveWorkRequest, createWorkOrder } from "@/src/services/work-request.service";
import { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DatePicker from "@/components/global/DatePicker";
import moment from "moment";
import { AssignSection } from "@/components/create-work-order/AssignSection";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { FormField } from "@/components/global/FormField";
import AssignSectionNew from "@/components/create-work-order/AssignSectionNew";
import { getSOPs } from "@/src/services/preventive.service";
import { useImageUpload } from "@/hooks/useImageUpload";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { updateWorkOrder, workOrderImageUpload } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Image } from "expo-image";
import { endpoints } from "@/src/api/endpoints";
import { WorkOrder } from "@/src/types/workOrder";

interface WorkOrderProps {
	passedData?: Record<string, any> | null;
}

export default function NewWorkOrder({ passedData }: WorkOrderProps) {
	console.log('work order props = ', passedData)
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const [id, setId] = useState();
	const { setWorkForm, isLoaded, resetForm } = useWorkOrderStore();
	const [forms, setForms] = useState<any>([]);
	const parts = useWorkOrderStore((state) => state.parts);
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<any>(null);

	const { user } = useAuthStore();

	useEffect(() => {
		if (passedData && !isLoaded) {
			console.log("Prefill data in NewWorkOrder =", passedData);
			const data = passedData;

			setId(data?.id);
			setWorkForm("title", data?.title);
			setWorkForm("message", data?.description);
			setWorkForm("location", data?.location);
			setWorkForm("assigned_users", data?.assignedUsers);
			setWorkForm("selected_asset", data?.asset);
			setWorkForm("nature_of_work", data?.nature_of_work);
			setWorkForm("completion_days", String(data?.estimated_time ?? ""));
			setWorkForm("priority", data?.priority ?? null);
			setWorkForm("start_date", data?.start_date ? moment(data?.start_date).format('YYYY-MM-DD') : '');
			setWorkForm("end_date", data?.end_date ? moment(data?.end_date).format('YYYY-MM-DD') : '');

			const form = forms?.find(
				(f: any) => f.id === data?.sop_form_id
			);

			setWorkForm("sop_form_id", form ? form.name : null);

			setWorkForm("parts", data?.parts?.map((p: any) => ({
				part_id: p.part_id,
				part_name: p.part_name,
				part_type: p.part_type,
				estimatedQuantity: p.estimatedQuantity,
			})) || []);

			setWorkForm("tasks", data?.tasks ?? []);

			// finally mark as loaded ONCE
			setWorkForm("isLoaded", true);

		}
	}, [passedData]);

	useEffect(() => {
		const fetchForms = async () => {
			try {
				const res = await getSOPs();
				if (res?.status) {
					console.log('res?.data - ', res.data);
					setForms(res?.data);
				}
			} catch (error) {
				console.error("Error fetching forms:", error);
			}
		};

		fetchForms();

		return () => {
			resetForm();
		}
	}, []);

	const handleRemovePart = (partId: string) => {
		const updatedParts = parts.filter(
			(p: any) => p.id !== partId && p._id !== partId
		);
		setWorkForm("parts", updatedParts);
	};

	useEffect(() => {
		console.log('parts changed in work order', useWorkOrderStore.getState().parts);
	}, [useWorkOrderStore.getState().parts])

	const handleSubmit = async () => {
		const data: any = useWorkOrderStore.getState();
		console.log("Work Order Form =", data);

		// ✅ Basic validation
		const required: (keyof typeof data)[] = [
			"title",
			"location",
			"selected_asset",
			"assigned_users",
			"start_date",
			"end_date",
		];

		// Fields that must not be empty arrays
		const requireNonEmptyArrays: (keyof typeof data)[] = [
			"assigned_users",
		];

		for (const field of required) {
			const value = data[field];

			// Handle array fields (must NOT be empty)
			if (requireNonEmptyArrays.includes(field)) {
				if (!Array.isArray(value) || value.length === 0) {
					const label = (field as string)
						.replace(/_/g, " ")
						.replace(/\b\w/g, (c) => c.toUpperCase());

					ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
					return;
				}
				continue;
			}

			// Handle normal fields
			if (!value) {
				if (field === "completion_days") {
					ToastAndroid.show(`Estimation Duration is required`, ToastAndroid.SHORT);
					return;
				}

				const label = (field as string)
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());

				ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
				return;
			}
		}


		// ✅ Build final payload matching your structure
		let payload = {
			createdFrom: data.work_request_id ? "Work Request" : "Work Order",
			description: data.message,
			end_date: data.end_date || new Date().toISOString().split("T")[0],
			estimated_time: data.completion_days, // using completion_days for hours/days input
			files: data.files || [],
			oldParts: null,
			parts: data.parts?.map((p: any) => ({
				actualQuantity: null,
				part_id: p.part_id,
				part_name: p.part_name,
				part_type: p.part_type,
				part_number: p.part_number,
				estimatedQuantity: p.estimatedQuantity,
				unit: p.unit,
			})) || [],
			tasks: data.tasks || [],
			priority: data.priority || "None",
			// sop_form_id: null,
			sop_form_id: forms?.find((f: any) => f.name === data.sop_form_id)?.id || null,
			start_date: data.start_date || new Date().toISOString().split("T")[0],
			status: "Open",
			title: data.title,
			type: data.nature_of_work,
			userIdList: data.assigned_users?.map((u: any) => u.id) || [],
			wo_asset_id: data.selected_asset?.id || "",
			wo_location_id: data.location?.id || "",
			image_path: data.files.length > 0 ? data.files[0].image_path : "",

			// ✅ Conditionally include work_request_id
			...(data.work_request_id && { work_request_id: data.work_request_id }),
		};

		console.log("📦 Final Work Order Payload:", payload);
		if(id) console.log('set id = ', id);

		try {
			if (passedData) {
				// edit scenario
				const res = await updateWorkOrder(id, payload);
				console.log("✅ Response:", res);
				if (res?.status) {

					if (data.work_request_id) {
						const approveRes = await approveWorkRequest(data.work_request_id);
						console.log("✅ Approve Response:", approveRes);
						if (approveRes.status) {
							ToastAndroid.show("Work Order updated successfully and Work Request approved!", ToastAndroid.SHORT);
							useWorkRequestStore.getState().resetWorkRequestForm();
							router.replace("/requests")
						}
					}

					useWorkOrderStore.getState().resetForm();
					if (!data.work_request_id) {
						ToastAndroid.show("Work Order updated successfully!", ToastAndroid.SHORT);
						router.back();
					}
				}


			} else {
				const res = await createWorkOrder(payload);
				console.log("✅ Response:", res);
				if (res?.status) {

					if (data.work_request_id) {
						const approveRes = await approveWorkRequest(data.work_request_id);
						console.log("✅ Approve Response:", approveRes);
						if (approveRes.status) {
							ToastAndroid.show("Work Order created successfully and Work Request approved!", ToastAndroid.SHORT);
							useWorkRequestStore.getState().resetWorkRequestForm();
							router.replace("/requests")
						}
					}

					useWorkOrderStore.getState().resetForm();
					if (!data.work_request_id) {
						ToastAndroid.show("Work Order created successfully!", ToastAndroid.SHORT);
						router.back();
					}
				}
			}


		} catch (error) {
			console.error("❌ Error creating work order:", error);
			ToastAndroid.show("Failed to create work order!", ToastAndroid.SHORT);
		}
	};

	const pickImage = (fromCamera = false) => {
		const options: any = {
			mediaType: 'photo' as const,
			quality: 0.8,
		};

		if (fromCamera) {
			launchCamera(options, handleImageResponse);
		} else {
			launchImageLibrary(options, handleImageResponse);
		}
	};

	const handleImageResponse = async (response: any) => {
		if (response.didCancel) return;
		if (response.errorCode) {
			Alert.alert('Error', response.errorMessage || 'Image selection failed');
			return;
		}

		const asset = response.assets?.[0];
		if (!asset) return;

		console.log('Selected image: ', asset.uri);

		const updatedWorkOrderImage = await workOrderImageUpload(asset, user);
		console.log('Updated work order image: ', updatedWorkOrderImage);

		setWorkForm("files", [updatedWorkOrderImage]);
	};

	return (
		<>
			<KeyboardAwareScrollView bottomOffset={30}>
				{/* <Header title="Create Work Order" /> */}
				<ScrollView style={styles.container}>
					<View style={styles.subContainer}>

						<FormField
							label="Title"
							placeholder="Enter Title"
							field="title"
							store={useWorkOrderStore}
							setterName="setWorkForm"
						/>

						<FormField
							label="Description"
							placeholder="Enter a description"
							field="message"
							store={useWorkOrderStore}
							setterName="setWorkForm"
							required={false}
						/>

					</View>

					{/* <AssignSection type="workOrders" /> */}
					<AssignSectionNew type="workOrders" />

					{/* <AssignInputContainer /> */}

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
						options={["None", "Low", "Medium", "High"]}
						store={useWorkOrderStore}
						setterName="setWorkForm"
						styles={{ paddingHorizontal: 25 }}
						required={false}
					/>


					<View style={styles.labelContainer}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
							<Text style={[styles.labelText]}>Start Date</Text>
							<Text style={styles.asterisk}>*</Text>
						</View>

						<Pressable style={styles.container1} onPress={() => {
							setActiveDateField("start_date");
							setIsDatePickerVisible(true);
						}}>
							<TextInput
								placeholder={"dd-mm-yyyy"}
								placeholderTextColor={"#999"}
								readOnly
								style={[styles.input1, styles.input2]}
								keyboardType="numeric"
								value={useWorkOrderStore.getState().start_date || ""}
							/>
						</Pressable>
					</View>


					<View style={styles.labelContainer}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
							<Text style={[styles.labelText]}>End Date</Text>
							<Text style={styles.asterisk}>*</Text>
						</View>

						<Pressable style={styles.container1} onPress={() => {
							setActiveDateField("end_date");
							setIsDatePickerVisible(true);
						}}>
							<TextInput
								placeholder={"dd-mm-yyyy"}
								placeholderTextColor={"#999"}
								readOnly
								style={[styles.input1, styles.input2]}
								keyboardType="numeric"
								value={useWorkOrderStore.getState().end_date || ""}
							/>
						</Pressable>
					</View>

					<FormField
						label="Estimation Duration (Hours)"
						placeholder="Enter Estimation Duration"
						field="completion_days"
						store={useWorkOrderStore}
						setterName="setWorkForm"
						required={false}
					/>

					<View style={{ marginHorizontal: 0 }}>
						<AssignInput label="Add Parts" comingFrom="newWorkOrder" required={false} onPress={() => router.push({
							pathname: "/addParts",
							params: { comingFrom: "newWorkOrder" }
						})} />
					</View>

					<View style={styles.partsContainer}>
						{useWorkOrderStore.getState().parts.length > 0 &&
							useWorkOrderStore.getState().parts.map((part: any, index: number) => (
								<View style={styles.partItem} key={index}>
									<Text style={styles.partText}>{part?.part_name}</Text>
									<Text style={styles.partText}>({part?.estimatedQuantity})</Text>
									<Pressable onPress={() => handleRemovePart(part.part_id)}>
										<Ionicons name="close" size={16} color="#000" />
									</Pressable>
								</View>
							))}
					</View>

					<Pressable style={styles.uploadBtn} onPress={() => pickImage()}>
						<Text style={styles.uploadBtnText}>Upload or Capture Photos</Text>
					</Pressable>

					{
						useWorkOrderStore.getState().files.length > 0 &&
						<View style={{ backgroundColor: 'transparent', padding: 10, marginHorizontal: 20 }}>
							<Image
								source={{
									uri: `${endpoints.baseURL}work_request/${useWorkOrderStore.getState().files[0].image_path}?t=${Date.now()}`
								}}
								style={{ width: 200, height: 200, borderRadius: 8 }}
							/>
						</View>
					}


					<DatePicker
						visible={isDatePickerVisible}
						onClose={() => setIsDatePickerVisible(false)}
						onDateSelect={(date) => {
							const formatted = moment(date).format("YYYY-MM-DD");
							console.log('active date field = ', activeDateField)
							if (activeDateField) {
								useWorkOrderStore.getState().setWorkForm(activeDateField, formatted);
								setIsDatePickerVisible(false);
								setActiveDateField(null);
							}
						}}
					/>

					<ActionButton onPress={handleSubmit} label="Create Work Order" buttonStyle={styles.submitBtn} />
				</ScrollView>
			</KeyboardAwareScrollView>
		</>
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
		paddingVertical: 6,
		backgroundColor: "rgba(117, 43, 223, 0.1)",
		borderColor: "#752BDF",
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 6,
		justifyContent: "center",
		padding: 6,
		gap: 5,
		display: "flex",
		alignItems: "center",
		flexDirection: "row",
	},
	partText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#000",
	},
	labelContainer: {
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "space-between",
		flex: 1,
		paddingHorizontal: 25,
		marginVertical: 10
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
	container1: {
		width: "100%",
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: 'space-between',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#f7f9fb",
		backgroundColor: "#fff",
	},
	label1: {
		fontSize: 12,
		color: "#222",
		backgroundColor: "#f7f9fb",
		borderColor: "#e3e5e5",
		borderWidth: 0.8,
		padding: 12,
		fontFamily: Fonts.regular,
	},
	input1: {
		borderRadius: 8,
		height: 40,
		backgroundColor: '#fff',
		textAlign: "left",
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		fontSize: 12,
		paddingStart: 12,
		fontFamily: Fonts.regular,
	},
	input2: {
		borderWidth: 1,
		borderColor: "#E1E8EE",
	}
})
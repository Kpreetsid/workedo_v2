import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
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
import { useRouter } from "expo-router";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { FormField } from "@/components/global/FormField";
import AssignSectionNew from "@/components/create-work-order/AssignSectionNew";
import { getSOPs } from "@/src/services/preventive.service";

export default function NewWorkOrder() {
	const router = useRouter();
	const { setWorkForm, resetForm } = useWorkOrderStore();
	const [forms, setForms] = useState<any>([]);
	const parts = useWorkOrderStore((state) => state.parts);

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
			"message",
			"location",
			"selected_asset",
			"assigned_users",
			"start_date",
			"end_date",
			// "parts",
			"nature_of_work",
			"priority",
			"completion_days",
		];

		// Fields that must not be empty arrays
		const requireNonEmptyArrays: (keyof typeof data)[] = [
			"assigned_users",
			// "parts",
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
			parts: data.parts?.map((p: any) => ({
				part_id: p.part_id || p._id,
				part_name: p.part_name,
				part_type: p.part_type,
				estimatedQuantity: p.estimatedQuantity || 1,
			})) || [],
			priority: data.priority,
			// sop_form_id: null,
			sop_form_id: forms?.find((f: any) => f.name === data.sop_form_id)?.id || null,
			start_date: data.start_date || new Date().toISOString().split("T")[0],
			status: "Open",
			title: data.title,
			type: data.nature_of_work,
			userIdList: data.assigned_users?.map((u: any) => u.id) || [],
			wo_asset_id: data.selected_asset?.id || "",
			wo_location_id: data.location?.id || "",

			// ✅ Conditionally include work_request_id
			...(data.work_request_id && { work_request_id: data.work_request_id }),
		};

		console.log("📦 Final Work Order Payload:", payload);

		try {
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
		} catch (error) {
			console.error("❌ Error creating work order:", error);
			ToastAndroid.show("Failed to create work order!", ToastAndroid.SHORT);
		}
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
							label="Message"
							placeholder="Enter a message"
							field="message"
							store={useWorkOrderStore}
							setterName="setWorkForm"
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
					/>

					<FormField
						label="Priority"
						type="dropdown"
						field="priority"
						options={["None", "Low", "Medium", "High"]}
						store={useWorkOrderStore}
						setterName="setWorkForm"
					/>

					<FormField
						label="Estimation Duration (Hours)"
						placeholder="Enter Estimation Duration"
						field="completion_days"
						store={useWorkOrderStore}
						setterName="setWorkForm"
					/>

					<View style={{ marginHorizontal: 0 }}>
						<AssignInput label="Add Parts" comingFrom="newWorkOrder" required={false} onPress={() => router.push({
							pathname: "/updateParts",
							params: { comingFrom: "newWorkOrder" }
						})} />
					</View>

					<View style={styles.partsContainer}>
						{useWorkOrderStore.getState().parts.length > 0 &&
							useWorkOrderStore.getState().parts.map((part: any, index: number) => (
								<View style={styles.partItem} key={index}>
									<Text style={styles.partText}>{part?.part_name}</Text>
									<Text style={styles.partText}>({part?.estimatedQuantity})</Text>
									<Pressable onPress={() => handleRemovePart(part.id || part._id)}>
										<Ionicons name="close" size={16} color="#000" />
									</Pressable>
								</View>
							))}
					</View>

					<Pressable style={styles.uploadBtn}>
						<Text style={styles.uploadBtnText}>Upload or Capture Photos</Text>
					</Pressable>

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
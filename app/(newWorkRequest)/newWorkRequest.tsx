import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import { Pressable, ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import AssignInput from "@/components/create-screens/AssignInput";
import Fonts from "@/constants/Typography";
import { DropDownIcon } from "@/constants/IconProvider";
import ActionButton from "@/components/create-screens/ActionButton";
import AssignInputContainer from "@/components/new-work-order/AssignInputContainer";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import DropDownInput from "@/components/create-screens/DropDownInput";
import { Ionicons } from "@expo/vector-icons";
import { createWorkOrder, createWorkRequest } from "@/src/services/work-request.service";
import { useEffect, useRef, useState } from "react";
import { getSOPs } from "@/src/services/preventive.service";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import DatePicker from "@/components/global/DatePicker";
import moment from "moment";
import { AssignSection } from "@/components/new-work-order/AssignSection";
import { useRouter } from "expo-router";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { FormField } from "@/components/global/FormField";

export default function NewWorkRequest() {
	const router = useRouter();
	const { setWorkRequestForm } = useWorkRequestStore();
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);

	const handleSubmit = async () => {
		const data: any = useWorkRequestStore.getState();
		console.log("Work request Form =", data);

		// ✅ Basic validation
		const required: (keyof typeof data)[] = [
			"title",
			"message",
			"location",
			"selected_asset",
			"nature_of_work",
			"priority",
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
			files: data.files || [],
			location_id: data.location?.id || "",
			priority: data.priority,
			problemType: data.nature_of_work,
			status: "Open",
			title: data.title
		};

		console.log("📦 Final Work Request Payload:", payload);

		try {
			const res = await createWorkRequest(payload);
			console.log("✅ Response:", res);
			if (res?.status) {
				ToastAndroid.show("Work Order created successfully!", ToastAndroid.SHORT);
				useWorkRequestStore.getState().resetWorkRequestForm();
				router.back();
			}
		} catch (error) {
			console.error("❌ Error creating work order:", error);
			ToastAndroid.show("Failed to create work order!", ToastAndroid.SHORT);
		}
	};

	return (
		<>
			<Header title="New Work Request" />

			<KeyboardAwareScrollView bottomOffset={30}>
				<ScrollView style={styles.container}>
					<View style={styles.subContainer}>

						<FormField
							label="Title"
							placeholder="Enter Title"
							field="title"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
						/>

						<FormField
							label="Message"
							placeholder="Enter a message"
							field="message"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
						/>

					</View>

					<AssignSection type="requests" />

					{/* <AssignInputContainer /> */}

					<View style={styles.row}>

						<FormField
							label="Problem Type"
							type="dropdown"
							field="nature_of_work"
							options={["Preventive", "Electrical", "Break Down", "Inspection", "Corrective", "Safety", "Upgrade", "Meter Reading", "Mechanical", "Other"]}
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
						/>

						<FormField
							label="Priority"
							type="dropdown"
							field="priority"
							options={["None", "Low", "Medium", "High"]}
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
						/>

					</View>

					<Pressable style={styles.uploadBtn}>
						<Text style={styles.uploadBtnText}>Upload or Capture Photos</Text>
					</Pressable>

					<ActionButton onPress={handleSubmit} label="Create Work Request" buttonStyle={styles.submitBtn} />
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
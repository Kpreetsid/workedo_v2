import Header from "@/components/global/Header";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import AssignSchedule from "@/components/create-screens/AssignSchedule";
import { router } from "expo-router";
import DatePicker from "@/components/global/DatePicker";
import { useEffect, useState } from "react";
import { PreventiveFormData, usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useRouter } from "expo-router";
import { ToastAndroid } from "react-native";
import moment from "moment";
import DropDownInput from "@/components/create-screens/DropDownInput";
import Fonts from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import { createPreventive, getSOPs } from "@/src/services/preventive.service";

export default function CreatePreventive() {
	const router = useRouter();
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const { formData, setFormValue, resetForm } = usePreventiveStore();
	const [forms, setForms] = useState<any>([]);

	useEffect(() => {
		const fetchForms = async () => {
			try {
				const res = await getSOPs();
				if (res?.status) {
					setForms(res?.data);
				}
			} catch (error) {
				console.error("Error fetching forms:", error);
			}
		};

		fetchForms();
	}, []);

	const handleSubmit = async () => {
		const { formData } = usePreventiveStore.getState();
		console.log("formData", formData);

		// ✅ Basic validation (optional)
		const required: (keyof PreventiveFormData)[] = [
			"title",
			"description",
			"location",
			"assigned_users",
			"start_date",
			"schedule",
			"assign_to",
			"nature_of_work",
			"priority",
			"completion_days",
			"parts",
		];

		for (const field of required) {
			if (!formData[field]) {
				const label = (field as string)
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase());
				ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		// ✅ Prepare payload
		const payload = {
			title: formData.title.trim(),
			description: formData.description.trim(),

			schedule: {
				mode: formData.schedule || "daily",
				enabled: true,
				no_of_repetition: 12, // default (can make dynamic)
				start_date: formData.start_date,
				end_date: "", // can later compute based on repetition
				[formData.schedule || "daily"]: {}, // dynamic key
			},

			work_order: {
				title: formData.title.trim(),
				description: formData.description.trim(),
				type: formData.nature_of_work || "Preventive",
				status: "Open",
				priority: formData.priority || "Low",
				wo_location_id: formData.location?.id || formData.location?._id || "",
				wo_asset_id: formData.selected_asset?.id || formData.selected_asset?._id || "",
				estimated_time: Number(formData.completion_days) || 0,
				start_date: formData.start_date,
				end_date: null,
				createdFrom: "Preventive",
				userIdList: formData.assigned_users
					? formData.assigned_users.map((user: any) => user.id || user._id)
					: [],
				sop_form_id: forms?.find((f: any) => f.name === formData.sop_form_id)?.id,
				parts:
					formData.parts?.map((p) => ({
						part_id: p.id || p._id,
						part_name: p.part_name,
						part_type: p.part_type,
						estimatedQuantity: 1,
					})) || [],
			},
		};

		console.log("📦 Final Preventive Payload:", payload);

		try {
			const res = await createPreventive(payload);
			console.log("✅ Response:", res);
			if (res?.status) {
				ToastAndroid.show("Preventive created successfully!", ToastAndroid.SHORT);
				usePreventiveStore.getState().resetForm();
			}
		} catch (error) {
			console.error("❌ Error creating preventive:", error);
			ToastAndroid.show("Failed to create preventive!", ToastAndroid.SHORT);
		}
	};

	const handleRemovePart = (partId: string) => {
		const updatedParts = formData.parts.filter(
			(p: any) => p.id !== partId && p._id !== partId
		);
		setFormValue("parts", updatedParts);
	};

	return (
		<>
			<Header title="Create Preventive" />
			<KeyboardAwareScrollView bottomOffset={30}>
				<View style={{ marginVertical: 5 }} />

				<FormInput
					label="Part Name"
					placeholder="Enter Title"
					value={formData.title}
					onChangeText={(text) => setFormValue("title", text)}
				/>

				<FormInput
					label="Description"
					placeholder="Enter a message"
					inputStyle={styles.descriptionInput}
					value={formData.description}
					onChangeText={(text) => setFormValue("description", text)}
				/>

				<AssignInput
					label="Location"
					onPress={() => router.push({
						pathname: "/selectLocation",
						params: { comingFrom: "" }
					})}
				/>

				{
					formData.location && (
						<AssignInput
							label="Asset"
							onPress={() => router.push({
								pathname: "/selectAsset",
								params: { comingFrom: "" }
							})}
						/>
					)
				}

				<AssignInput
					label="Assign User"
					onPress={() => router.push({
						pathname: "/selectUser",
						params: { comingFrom: "" }
					})}
				/>

				<AssignInput label="Start Date" onPress={() => setIsDatePickerVisible(true)} />

				<AssignSchedule />

				<View style={styles.row}>

					<DropDownInput
						label="Select SOP Form"
						value={formData.sop_form_id}
						options={forms?.map((form: any) => form.name)}
						containerStyle={styles.inputContainer}
						onSelect={(val) => { setFormValue("sop_form_id", val); }}
					/>

					<DropDownInput
						label="Nature of Work"
						value={formData.nature_of_work}
						options={["Preventive", "Electrical", "Break Down", "Inspection", "Corrective", "Safety", "Upgrade", "Meter Reading", "Mechanical", "Other"]}
						containerStyle={styles.inputContainer}
						onSelect={(val) => {
							setFormValue("nature_of_work", val);
						}}
					/>

				</View>

				<View style={styles.row}>
					<DropDownInput
						label="Priority"
						value={formData.priority}
						options={["None", "Low", "Medium", "High"]}
						containerStyle={styles.inputContainer}
						onSelect={(val) => {
							setFormValue("priority", val);
						}}
					/>

					<FormInput
						label="No. of Days"
						labelStyle={styles.label}
						placeholder="dd-mm-yyyy"
						containerStyle={styles.inputContainer}
						value={formData.completion_days}
						onChangeText={(text) => setFormValue("completion_days", text)}
					/>

				</View>

				<AssignInput label="Add Parts" onPress={() => router.push("/updateParts")} />
				{/* <AssignInput label="Add Parts" onPress={() => router.push("/selectPart")} /> */}

				<View style={styles.partsContainer}>
					{formData.parts.length > 0 &&
						formData.parts.map((part: any, index: number) => (
							<View style={styles.partItem} key={index}>
								<Text style={styles.partText}>{part?.part_name}</Text>
								<Text style={styles.partText}>({part?.quantity_needed})</Text>
								<Pressable onPress={() => handleRemovePart(part.id || part._id)}>
									<Ionicons name="close" size={16} color="#000" />
								</Pressable>
							</View>
						))}
				</View>

				<ActionButton label="Submit" onPress={handleSubmit} />

				<DatePicker
					visible={isDatePickerVisible}
					onClose={() => setIsDatePickerVisible(false)}
					onDateSelect={(date) => {
						// ✅ Format the date before saving
						const formattedDate = moment(date).format("YYYY-MM-DD");
						setFormValue("start_date", formattedDate);
						setIsDatePickerVisible(false);
					}}
				/>


			</KeyboardAwareScrollView>
		</>
	)
}

const styles = StyleSheet.create({
	descriptionInput: {
		height: 80,
		textAlignVertical: "top"
	},
	row: {
		flexDirection: "row",
		paddingHorizontal: 25,
		gap: 15,
	},
	label: {
		fontSize: 10
	},
	inputContainer: {
		paddingHorizontal: 0,
		flexGrow: 1,
		width: "45%",
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

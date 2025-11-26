import Header from "@/components/global/Header";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
import { FormField } from "@/components/global/FormField";
import SkipDatesUI from "@/components/create-preventive/skipDates";

export default function CreatePreventive() {
	const router = useRouter();

	const [dates, setDates] = useState<string[]>([]);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const [nDays, setNDays] = useState("1");
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<any>(null);

	const { skip_dates, setPreventiveValue, resetForm } = usePreventiveStore();
	const preventiveLocation = usePreventiveStore((s) => s.location);
	const [forms, setForms] = useState<any>([]);

	useEffect(() => {
		const fetchForms = async () => {
			try {
				const res = await getSOPs();
				if (res?.status) {
					console.log('forms = ', res?.data);
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

	// Add a new empty skip date row
	const addSkipDate = () => {
		setPreventiveValue("skip_dates", [...skip_dates, ""]);
	};

	// Update a specific skip date
	const updateSkipDate = (index: number, newDate: string) => {
		const updated = [...skip_dates];
		updated[index] = newDate;
		setPreventiveValue("skip_dates", updated);
	};

	const handleSubmit = async () => {
		const data: any = usePreventiveStore.getState();
		console.log("formData", data);

		// ✅ Basic validation (optional)
		const required: (keyof PreventiveFormData)[] = [
			"title",
			"description",
			"location",
			"assigned_users",
			"start_date",
			"schedule",
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

		// ✅ Prepare payload
		const payload = {
			title: data.title.trim(),
			description: data.description.trim(),

			schedule: {
				mode: data.schedule || "daily",
				enabled: true,
				no_of_repetition: data.no_of_repetition, // default (can make dynamic)
				start_date: data.start_date,
				end_date: data.end_date ? data.end_date : null, // can later compute based on repetition
				[data.schedule || "daily"]: {
					everyNDays: Number(nDays) || 1,
				}, // dynamic key
				skipDates: [],
				skipWeekendSaturday: false,
				skipWeekendSunday: false,
				skipWeekends: false
			},

			work_order: {
				title: data.title.trim(),
				description: data.description.trim(),
				type: data.nature_of_work || "Preventive",
				status: "Open",
				priority: data.priority || "Low",
				wo_location_id: data.location?.id || data.location?._id || "",
				wo_asset_id: data.selected_asset?.id || data.selected_asset?._id || "",
				estimated_time: Number(data.completion_days) || 0,
				start_date: data.start_date,
				end_date: null,
				createdFrom: "Preventive",
				userIdList: data.assigned_users
					? data.assigned_users.map((user: any) => user.id || user._id)
					: [],
				sop_form_id: forms?.find((f: any) => f.name === data.sop_form_id)?.id,
				parts:
					data.parts?.map((p: any) => ({
						part_id: p.id || p._id,
						part_name: p.part_name,
						part_type: p.part_type,
						estimatedQuantity: 1,
					})) || [],
				tasks: data.tasks || [],
			},
		};

		console.log("📦 Final Preventive Payload:", payload);
		return;

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
		const updatedParts = usePreventiveStore.getState().parts.filter(
			(p: any) => p.id !== partId && p._id !== partId
		);
		setPreventiveValue("parts", updatedParts);
	};

	return (
		<>
			<Header title="Create Preventive" />
			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: '#F5F7FA' }}>
				<View style={{ marginVertical: 10 }} />

				<Text style={{ fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 }}>Work Order Details</Text>

				<FormField
					label="Title"
					placeholder="Enter Title Name"
					field="title"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
				/>

				<FormField
					label="Description"
					placeholder="Enter Description"
					field="description"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
				/>

				<FormField
					label="Location"
					type="location"
					placeholder="Enter Location"
					field="location"
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
				/>

				{
					preventiveLocation && (
						<FormField
							label="Asset"
							type="asset"
							placeholder="Enter Asset"
							field="selected_asset"
							router={router}
							comingFrom="createPreventive"
							store={usePreventiveStore}
							setterName="setPreventiveValue"
						/>
					)
				}

				<FormField
					label="Assign User"
					type="user"
					field="assigned_users"
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
				/>

				<FormField
					label="Start Date"
					type="date"
					field="start_date"
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					setIsDatePickerVisible={setIsDatePickerVisible}
					setActiveDateField={setActiveDateField}
				/>

				<FormField
					label="Nature of Work"
					type="dropdown"
					field="nature_of_work"
					options={["Preventive", "Electrical", "Break Down", "Inspection", "Corrective", "Safety", "Upgrade", "Meter Reading", "Mechanical", "Other"]}
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>


				<FormField
					label="Priority"
					type="dropdown"
					field="priority"
					options={["None", "Low", "Medium", "High"]}
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>


				<FormField
					label="Estimation Duration (Hours) to complete"
					field="completion_days"
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Select SOP Form"
					type="dropdown"
					field="sop_form_id"
					options={forms?.map((form: any) => form.name)}
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<AssignInput
					label="Create Task"
					required={false}
					field="tasks"
					store={usePreventiveStore}
					comingFrom="createPreventive"
					onPress={() => router.push("/addTasks")}
				/>

				{/* <AssignSchedule /> */}

				<AssignInput
					label="Add Parts"
					required={false}
					field="parts"
					store={usePreventiveStore}
					comingFrom="createPreventive"
					onPress={() => router.push("/addParts")}
				/>

				<View style={styles.partsContainer}>
					{usePreventiveStore.getState().parts.length > 0 &&
						usePreventiveStore.getState().parts.map((part: any, index: number) => (
							<View style={styles.partItem} key={index}>
								<Text style={styles.partText}>{part?.part_name}</Text>
								<Text style={styles.partText}>({part?.estimatedQuantity})</Text>
								<Pressable onPress={() => handleRemovePart(part.id || part._id)}>
									<Ionicons name="close" size={16} color="#000" />
								</Pressable>
							</View>
						))}
				</View>


				<View style={{ marginVertical: 10 }} />

				<Text
					style={{
						fontSize: 16,
						fontWeight: 'bold',
						marginHorizontal: 20,
						marginBottom: 10
					}}>
					Schedule Settings :
				</Text>


				<FormField
					label="Schedule Type"
					type="dropdown"
					field="schedule"
					options={["Daily", "Weekly", "Monthly"]}
					router={router}
					required={false}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>


				<View style={styles.labelContainer}>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText]}>Daily Schedule</Text>
					</View>

					<View style={styles.container1}>
						<Text style={styles.label1}>Run every</Text>

						<TextInput
							style={styles.input1}
							keyboardType="numeric"
							value={nDays}
							onChangeText={setNDays}
						/>

						<Text style={styles.label1}>day(s)</Text>
					</View>
				</View>


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
							value={usePreventiveStore.getState().start_date}
						/>
					</Pressable>
				</View>


				<View style={styles.labelContainer}>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText]}>End Date</Text>
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
							value={usePreventiveStore.getState().end_date}
						/>
					</Pressable>
				</View>

				<FormField
					label="Number of Repititions"
					field="no_of_repititions"
					router={router}
					required={false}
					placeholder="e.g. 5"
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
				/>


				<View style={{ marginHorizontal: 25 }}>
					<SkipDatesUI
						onAdd={addSkipDate}
						onRemove={(i) => {
							const filtered = skip_dates.filter((_, idx) => idx !== i);
							setPreventiveValue("skip_dates", filtered);
						}}
						onDateFieldPress={(i) => {
							setActiveIndex(i);
							setIsDatePickerVisible(true);
						}}
					/>
				</View>

				<ActionButton label="Submit" onPress={handleSubmit} />

				<DatePicker
					visible={isDatePickerVisible}
					onClose={() => setIsDatePickerVisible(false)}
					onDateSelect={(date) => {
						const formatted = moment(date).format("YYYY-MM-DD");
						console.log('active date field = ', activeDateField)
						if (activeDateField) {
							usePreventiveStore.getState().setPreventiveValue(activeDateField, formatted);
							setIsDatePickerVisible(false);
							setActiveDateField(null);
							return;
						}

						if (activeIndex !== null) {
							updateSkipDate(activeIndex, formatted);
							setIsDatePickerVisible(false);
							return;
						}
					}}
				/>



				<View style={{ marginVertical: 10 }} />


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

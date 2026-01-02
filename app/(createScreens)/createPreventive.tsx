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
import { createPreventive, getSOPs, updatePreventive } from "@/src/services/preventive.service";
import { FormField } from "@/components/global/FormField";
import SkipDatesUI from "@/components/create-preventive/skipDates";
import SkipWeekendSelector from "@/components/create-preventive/skipWeekendSelector";
import { useLocalSearchParams } from "expo-router/build/hooks";
import LocationPickerModal from "@/components/create-work-order/LocationPickerModal";
import AssetPickerModal from "@/components/create-work-order/AssetPickerModal";
import WeekDays from "@/components/create-preventive/weekDaysComponent";
import MonthDays from "@/components/create-preventive/monthDaysComponent";

const MODE_FIELD_MAP: Record<string, string> = {
	daily: "everyNDays",
	weekly: "everyNWeeks",
	monthly: "everyNMonths",
};

const weekdayNames = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

export default function CreatePreventive() {
	const params: any = useLocalSearchParams();
	console.log('params = ', params);

	const comingFrom = params?.comingFrom;

	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [visibleAsset, setVisibleAsset] = useState(false);

	const [dates, setDates] = useState<string[]>([]);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const [nDays, setNDays] = useState("1");
	const [id, setId] = useState();
	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<any>(null);

	const { skip_dates, setPreventiveValue, resetForm, isLoaded } = usePreventiveStore();

	const preventiveLocation = usePreventiveStore((s) => s.location);
	const preventiveAssets = usePreventiveStore((s) => s.selected_asset)
	const schedule = usePreventiveStore((s) => s.schedule);

	const [forms, setForms] = useState<any>([]);

	const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([]);
	const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([]);

	const toggleWeekDay = (index: number) => {
		setSelectedWeekDays(prev =>
			prev.includes(index)
				? prev.filter(i => i !== index)
				: [...prev, index]
		);
	};

	const toggleMonthDay = (num: number) => {
		setSelectedMonthDays(prev =>
			prev.includes(num)
				? prev.filter(i => i !== num)
				: [...prev, num]
		);
	};

	useEffect(() => {
		if (params?.data && !isLoaded) {
			const data = JSON.parse(params.data);
			console.log('data here in params = ', data);

			// all setters here
			setId(data?.id);
			setPreventiveValue("title", data?.title);
			setPreventiveValue("description", data?.description);
			setPreventiveValue("location", data?.work_order?.location);
			setPreventiveValue("assigned_users", data?.work_order?.users);
			setPreventiveValue("selected_asset", data?.work_order?.asset);
			setPreventiveValue("nature_of_work", data?.work_order?.type);
			setPreventiveValue("completion_days", String(data?.work_order?.estimated_time ?? ""));
			const form = forms?.find(
				(f: any) => f.id === data?.work_order?.sop_form_id
			);

			setPreventiveValue("sop_form_id", form ? form.name : null);
			setPreventiveValue("schedule", data?.schedule?.mode);
			setNDays(deriveNDays(data?.schedule));
			setPreventiveValue("start_date", data?.schedule?.start_date);
			setPreventiveValue("end_date", data?.schedule?.end_date);
			setPreventiveValue("no_of_repititions", data?.schedule?.no_of_repetition === null ? "" : String(data?.schedule?.no_of_repetition));
			setPreventiveValue("skipWeekends", data?.schedule?.skipWeekends ?? false);
			setPreventiveValue("skipWeekendSaturday", data?.schedule?.skipWeekendSaturday ?? false);
			setPreventiveValue("skipWeekendSunday", data?.schedule?.skipWeekendSunday ?? false);
			setPreventiveValue("skip_dates", data?.schedule?.skipDates ?? []);
			setPreventiveValue("priority", data?.work_order?.priority ?? null);


			setPreventiveValue("parts", data.work_order?.parts?.map((p: any) => ({
				part_id: p.part_id,
				part_name: p.part_name,
				part_type: p.part_type,
				estimatedQuantity: p.estimatedQuantity,
			})) || []);

			setPreventiveValue("tasks", data?.work_order?.tasks ?? []);

			// finally mark as loaded ONCE
			setPreventiveValue("isLoaded", true);


			// WEEKLY — convert weekday names to indices
			if (data?.schedule?.mode === "weekly") {
				const weekdayNames = [
					"sunday",
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
				];

				const weekDayIndices =
					data?.schedule?.weekly?.days?.map(
						(day: string) => weekdayNames.indexOf(day.toLowerCase())
					) || [];

				setSelectedWeekDays(weekDayIndices);
			}

			// MONTHLY — numbers directly
			if (data?.schedule?.mode === "monthly") {
				const monthDays = data?.schedule?.monthly?.monthDays || [];
				setSelectedMonthDays(monthDays);
			}

		}
	}, [params]);

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
			"location",
			"selected_asset",
			"assigned_users",
			"start_date",
		];

		// Fields that must not be empty arrays
		const requireNonEmptyArrays: (keyof typeof data)[] = [
			"assigned_users",
		];

		for (const field of required) {
			const value = data[field];

			if (requireNonEmptyArrays.includes(field)) {
				if (!Array.isArray(value) || value.length === 0) {
					const label = (field as string)
						.replace(/_/g, " ")
						.replace(/\b\w/g, (c) => c.toUpperCase());

					var message = "";
					if (label === "Assigned Users") {
						message = "User selection"
					} else {
						message = label;
					}

					ToastAndroid.show(`${message} is required`, ToastAndroid.SHORT);
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

				var message = "";
				if (label === "Assigned Users") {
					message = "User selection"
				} else {
					message = label;
				}

				ToastAndroid.show(`${message} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		if (data?.end_date === "" && data?.no_of_repititions === "") {
			ToastAndroid.show("Please provide at least one: End Date or Number of Reps.", ToastAndroid.SHORT);
			return;
		}

		console.log("tasks =", data?.tasks);
		const invalid = data?.tasks.some((task: any) => !task?.title);

		if (invalid) {
			ToastAndroid.show("Task title is required", ToastAndroid.SHORT);
			return;
		}

		let mode: any;
		let field: any;

		if (params && params.data) {
			console.log('init', data?.schedule)
			mode = data?.schedule?.toLowerCase();
			field = MODE_FIELD_MAP[mode];
		} else {
			console.log('init else', data?.schedule)
			mode = data?.schedule?.toLowerCase();
			// const mode = data?.schedule?.mode?.toLowerCase();
			field = MODE_FIELD_MAP[mode];
		}

		console.log("mode:", mode, "field:", field);

		let scheduleObject: any = {
			mode: mode,
			enabled: true,
			no_of_repetition: data?.schedule?.no_of_repetition ? String(data.schedule.no_of_repetition) : null,
			start_date: data.start_date,
			end_date: data.end_date || null,

			// dynamic nested block
			[mode]: {
				[field]: Number(nDays) || 1,
			},

			skipDates: [],
			skipWeekendSaturday: data?.skipWeekendSaturday || false,
			skipWeekendSunday: data?.skipWeekendSunday || false,
			skipWeekends: data?.skipWeekends || false,
		};


		if (mode === "weekly" && scheduleObject[mode]) {
			scheduleObject[mode] = {
				...scheduleObject[mode],
				days: selectedWeekDays.map((i) => weekdayNames[i]),
			};
		}


		if (mode === "monthly" && scheduleObject[mode]) {
			scheduleObject[mode].days = selectedMonthDays;
		}

		console.log(scheduleObject)

		const workOrderObject = {
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
					part_id: p.part_id,
					part_name: p.part_name,
					part_type: p.part_type,
					estimatedQuantity: 1,
				})) || [],
			tasks: data.tasks || [],
		};

		// ✅ Prepare payload
		const payload = {
			title: data.title.trim(),
			description: data?.description?.trim(),
			schedule: scheduleObject,
			work_order: workOrderObject,
		};

		console.log("📦 Final Preventive Payload:", payload);

		try {
			if (params && params.data) {
				const res = await updatePreventive(id, payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Preventive updated successfully!", ToastAndroid.SHORT);
					usePreventiveStore.getState().resetForm();
					router.back();
				}
			} else {
				const res = await createPreventive(payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Preventive created successfully!", ToastAndroid.SHORT);
					usePreventiveStore.getState().resetForm();
					if (comingFrom === "overview") {
						router.replace("/preventive");
						return;
					}
					router.back();
				}
			}
		} catch (error) {
			console.error("❌ Error creating preventive:", error);
			ToastAndroid.show("Failed to create preventive!", ToastAndroid.SHORT);
		}
	};

	const deriveNDays = (schedule: any) => {
		if (!schedule) return "1";

		const mode = schedule?.mode;
		const field = MODE_FIELD_MAP[mode];
		console.log('mode = ', mode);
		console.log('field = ', field);

		return String(schedule?.[mode]?.[field] ?? "1");
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
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Description"
					placeholder="Enter Description"
					field="description"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					required={false}
					styles={{ paddingHorizontal: 25 }}
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
					openPicker={() => {
						console.log('opening')
						setVisible(true)
					}}
				/>

				<LocationPickerModal
					visible={visible}
					onClose={() => setVisible(false)}
					comingFrom="createPreventive"
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
							openPicker={() => {
								console.log('opening asset')
								setVisibleAsset(true)
							}}
						/>
					)
				}

				<AssetPickerModal
					visible={visibleAsset}
					comingFrom="createPreventive"
					onClose={() => setVisibleAsset(false)}
				/>

				{
					preventiveLocation && preventiveAssets &&
					<FormField
						label="Assign User"
						type="new-user"
						field="assigned_users"
						router={router}
						comingFrom="createPreventive"
						store={usePreventiveStore}
						setterName="setPreventiveValue"
					/>
				}

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
					required={false}
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
					required={false}
				/>


				<FormField
					label="Estimation Duration (Hours) to complete"
					field="completion_days"
					router={router}
					comingFrom="createPreventive"
					store={usePreventiveStore}
					setterName="setPreventiveValue"
					styles={{ paddingHorizontal: 25 }}
					required={false}
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
					required={false}
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
								<Pressable onPress={() => handleRemovePart(part.part_id)}>
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

						<Text style={styles.label1}>
							{schedule === "Weekly"
								? "week(s)"
								: schedule === "Monthly"
									? "month(s)"
									: "day(s)"}
						</Text>
					</View>

					{(schedule === "weekly" || schedule === "Weekly") && (
						<WeekDays selected={selectedWeekDays} onToggle={toggleWeekDay} />
					)}

					{(schedule === "monthly" || schedule === "Monthly") && (
						<MonthDays selected={selectedMonthDays} onToggle={toggleMonthDay} />
					)}
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

				<View style={{ marginHorizontal: 25 }}>
					<SkipWeekendSelector />
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

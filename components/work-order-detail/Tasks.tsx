import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { WorkOrder } from '@/src/types/workOrder';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { ScrollView } from 'react-native-gesture-handler';
import Fonts from '@/constants/Typography';
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../auth-screens/ActionButton';
import { updateWorkOrder } from '@/src/services/work-order.service';

interface Props {
	params: WorkOrder;
}

const UI_TYPES = ["Radio Button", "Text", "Number", "Check Box"];

const TYPE_MAP: Record<string, string> = {
	"Radio Button": "multipleChoice",
	"Text": "text",
	"Number": "number",
	"Check Box": "checkBox",
};

const Tasks = ({ params }: Props) => {
	console.log('params on tasks', params.tasks);
	const [activeDropdownTask, setActiveDropdownTask] = useState(null);

	const [tasks, setTasks] = useState<any[]>([]);

	// 🔥 initialize local state from params
	useEffect(() => {
		if (params?.tasks?.length) {
			setTasks(params.tasks);
		}
	}, []);

	const toggleCheckbox = (taskIndex: number, optionIndex: number) => {
		setTasks((prev) =>
			prev.map((task, i) =>
				i === taskIndex
					? {
						...task,
						options: task.options.map((opt: any, j: number) =>
							j === optionIndex
								? { ...opt, value: !opt.value }
								: opt
						),
					}
					: task
			)
		);
	};

	useEffect(() => {
		console.log('tasks', tasks);
	}, [tasks]);

	const selectRadio = (taskIndex: number, selectedValue: number) => {
		setTasks((prev) =>
			prev.map((task, i) =>
				i === taskIndex
					? { ...task, fieldValue: selectedValue }
					: task
			)
		);
	};

	const updateFieldValue = (taskIndex: number, value: string) => {
		setTasks((prev) =>
			prev.map((task, i) =>
				i === taskIndex ? { ...task, fieldValue: value } : task
			)
		);
	};

	useEffect(() => {
		console.log('tasks', tasks);
	}, [tasks]);

	const updateWorkOrderFunc = async () => {
		let payload = {
			"order_no": params?.order_no,
			"priority": params?.priority,
			"status": params?.status,
			"type": params?.type,
			"nature_of_work": params?.nature_of_work,
			"wo_asset_id": params?.wo_asset_id,
			"wo_location_id": params?.wo_location_id,
			"start_date": params?.start_date,
			"end_date": params?.end_date,
			"sop_form_id": null,
			"tasks": tasks,
			"task_submitted": true,
			"userIdList": params?.assignedUsers?.map((user: any) => user.user.id)
		}

		console.log(payload);

		const res = await updateWorkOrder(params.id, payload);
		console.log("✅ Response:", res);
		if (res?.status) {
			ToastAndroid.show("Work order updated successfully", ToastAndroid.SHORT);
		}
	}

	/** -------------------------------------------------------
	 *  UI COMPONENT
	 *  ------------------------------------------------------- */

	return (
		<KeyboardAwareScrollView bottomOffset={30}>
			<ScrollView style={styles.taskContainer}>

				{/* Task List */}
				{tasks.map((task: any, taskIndex: number) => (
					<View key={task.id} style={styles.taskCard}>

						<Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, marginBottom: 5 }}>
							{task.title}
						</Text>

						{task.type === "text" && (
							<TextInput
								style={styles.input}
								placeholder={task.title}
								placeholderTextColor="#94A3B8"
								value={task.fieldValue ?? ""}
								onChangeText={(t) => updateFieldValue(taskIndex, t)}
							/>
						)}

						{task.type === "number" && (
							<TextInput
								style={styles.input}
								placeholder={task.title}
								placeholderTextColor="#94A3B8"
								keyboardType="numeric"
								value={String(task.fieldValue ?? "")}
								onChangeText={(t) =>
									updateFieldValue(taskIndex, t.replace(/[^0-9]/g, ""))
								}
							/>
						)}


						{task.type === "checkBox" && (
							<View style={{ marginTop: 10 }}>
								{task.options.map((opt: any, optIndex: number) => (
									<TouchableOpacity
										key={optIndex}
										style={styles.checkboxRow}
										onPress={() => toggleCheckbox(taskIndex, optIndex)}
									>
										<Ionicons
											name={opt.value ? "checkbox" : "square-outline"}
											size={20}
											color="#742BDE"
										/>
										<Text style={styles.checkboxLabel}>
											{opt.key || `Option ${optIndex + 1}`}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						)}

						{task.type === "multipleChoice" && (
							<View style={{ marginTop: 10 }}>
								{task.options.map((opt: any, optIndex: number) => {
									const selected = Number(task.fieldValue) === opt.value;

									return (
										<TouchableOpacity
											key={optIndex}
											style={styles.radioRow}
											onPress={() => selectRadio(taskIndex, opt.value)}
										>
											<Ionicons
												name={selected ? "radio-button-on" : "radio-button-off"}
												size={20}
												color="#742BDE"
											/>
											<Text style={styles.radioLabel}>
												{opt.key || `Option ${optIndex + 1}`}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						)}
					</View>
				))}

				{
					tasks.length > 0 && <ActionButton
						label="Submit"
						onPress={() => updateWorkOrderFunc()}
						style={{ width: '100%', alignSelf: 'center', marginBottom: 40 }}
					/>
				}

			</ScrollView>
		</KeyboardAwareScrollView>
	);
}

export default Tasks

const styles = StyleSheet.create({
	taskContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},

	buttonContainer: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.6,
		shadowRadius: 2,
		marginBottom: 15,
	},

	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},

	taskCard: {
		width: "75%",
		backgroundColor: "#ffffff",
		padding: 15,
		borderRadius: 10,
		// paddingBottom: 80,
		marginBottom: 15,
		shadowColor: "#999",
		elevation: 3,
	},

	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},

	label: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#475569",
	},

	input: {
		backgroundColor: "#F5F5F5",
		padding: 10,
		borderRadius: 8,
		fontSize: 14,
		marginTop: 4,
		fontFamily: Fonts.regular,
		color: "#1E293B",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#D9D9D9",
	},

	dropdown: {
		backgroundColor: "#F1F5F9",
		padding: 10,
		borderRadius: 8,
		marginTop: 4,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	dropdownText: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#1E293B",
	},

	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.15)",
		justifyContent: "center",
		alignItems: "center",
	},

	dropdownMenu: {
		width: 200,
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingVertical: 5,
		elevation: 6,
	},

	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 15,
	},

	dropdownItemText: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#1E293B",
	},

	optionRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		gap: 10,
	},

	optionInput: {
		flex: 1,
		backgroundColor: "#F1F5F9",
		padding: 10,
		borderRadius: 8,
	},

	addOptionButton: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
		gap: 5,
	},

	addOptionText: {
		color: "#4F46E5",
		fontFamily: Fonts.medium,
		fontSize: 12,
	},
	checkboxRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 10,
	},
	checkboxLabel: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#334155",
	},
	radioRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 10,
	},

	radioLabel: {
		fontSize: 14,
		fontFamily: Fonts.regular,
		color: "#334155",
	},

});
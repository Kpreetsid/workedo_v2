import { StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WorkOrder } from "@/src/types/workOrder";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ScrollView } from "react-native-gesture-handler";
import Fonts from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import ActionButton from "../auth-screens/ActionButton";
import { patchWorkOrder } from "@/src/services/work-order.service";

interface Props {
	params: WorkOrder;
	onSaved?: () => void;
}

const Tasks = ({ params, onSaved }: Props) => {
	const [tasks, setTasks] = useState<any[]>([]);

	useEffect(() => {
		if (params?.tasks?.length) {
			setTasks(params.tasks);
			return;
		}
		setTasks([]);
	}, [params?.tasks]);

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

	const updateWorkOrderFunc = async () => {
		if (!params?.id) return;

		try {
			const res = await patchWorkOrder(params.id, {
				tasks,
				task_submitted: true,
			});

			if (res?.status) {
				ToastAndroid.show("Tasks updated successfully", ToastAndroid.SHORT);
				onSaved?.();
				return;
			}

			ToastAndroid.show("Failed to update tasks", ToastAndroid.SHORT);
		} catch (error: any) {
			ToastAndroid.show(error?.message || "Failed to update tasks", ToastAndroid.LONG);
		}
	};

	return (
		<KeyboardAwareScrollView bottomOffset={30}>
			<ScrollView style={styles.taskContainer}>
				{tasks.map((task: any, taskIndex: number) => (
					<View key={task.id || `${task.title}-${taskIndex}`} style={styles.taskCard}>
						<Text style={styles.taskTitle}>{task.title}</Text>

						{task.type === "text" ? (
							<TextInput
								style={styles.input}
								placeholder={task.title}
								placeholderTextColor="#94A3B8"
								value={task.fieldValue ?? ""}
								onChangeText={(t) => updateFieldValue(taskIndex, t)}
							/>
						) : null}

						{task.type === "number" ? (
							<TextInput
								style={styles.input}
								placeholder={task.title}
								placeholderTextColor="#94A3B8"
								keyboardType="numeric"
								value={String(task.fieldValue ?? "")}
								onChangeText={(t) => updateFieldValue(taskIndex, t.replace(/[^0-9]/g, ""))}
							/>
						) : null}

						{task.type === "checkBox" ? (
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
						) : null}

						{task.type === "multipleChoice" ? (
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
						) : null}
					</View>
				))}

				{tasks.length > 0 && params?.id ? (
					<ActionButton
						label="Submit"
						onPress={updateWorkOrderFunc}
						style={{ width: "100%", alignSelf: "center", marginBottom: 40 }}
					/>
				) : null}
			</ScrollView>
		</KeyboardAwareScrollView>
	);
};

export default Tasks;

const styles = StyleSheet.create({
	taskContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	taskCard: {
		width: "75%",
		backgroundColor: "#ffffff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 15,
		shadowColor: "#999",
		elevation: 3,
	},
	taskTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 16,
		marginBottom: 5,
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

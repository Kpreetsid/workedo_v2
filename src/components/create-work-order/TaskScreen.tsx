import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import React, {  useState } from "react";
import Fonts from "@/constants/Typography";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useWorkOrderStore } from "@/src/state/workOrders/useWorkOrderStore";

const UI_TYPES = ["Radio Button", "Text", "Number", "Check Box"];

const TYPE_MAP: Record<string, string> = {
  "Radio Button": "multipleChoice",
  "Text": "text",
  "Number": "number",
  "Check Box": "checkBox",
};

const TaskScreen = () => {
	const tasks = useWorkOrderStore((s) => s.tasks);
	const setWorkForm = useWorkOrderStore((s) => s.setWorkForm);

	const [activeDropdownTask, setActiveDropdownTask] = useState(null);

	const addTask = () => {
		const newTask = {
			id: Date.now(),
			title: "",
			type: "",                 // API format (set after user selects)
			fieldValue: "",
			options: [],              // MUST be array of {key,value}
		};

		setWorkForm("tasks", [newTask, ...tasks]);
	};

	const removeTask = (id: any) => {
		setWorkForm(
			"tasks",
			tasks.filter((t: any) => t.id !== id)
		);
	};

	const updateTask = (id: any, field: any, value: any) => {
		setWorkForm(
			"tasks",
			tasks.map((task: any) =>
				task.id === id ? { ...task, [field]: value } : task
			)
		);
	};

	const updateTaskMany = (id: any, updates: any) => {
		setWorkForm(
			"tasks",
			tasks.map((task: any) =>
				task.id === id ? { ...task, ...updates } : task
			)
		);
	};



	/** -------------------------------------------------------
	 *  ADD OPTION  (API FORMAT)
	 *  ------------------------------------------------------- */
	const addOption = (taskId: any) => {
		setWorkForm(
			"tasks",
			tasks.map((task: any) =>
				task.id === taskId
					? {
						...task,
						options: [
							...task.options,
							{
								key: "",
								value:
									task.type === "multipleChoice"
										? task.options.length // numeric index
										: false,               // checkbox defaults
							},
						],
					}
					: task
			)
		);
	};

	/** -------------------------------------------------------
	 *  UPDATE OPTION KEY
	 *  ------------------------------------------------------- */
	const updateOption = (taskId: any, index: any, newValue: any) => {
		setWorkForm(
			"tasks",
			tasks.map((task: any) =>
				task.id === taskId
					? {
						...task,
						options: task.options.map((opt: any, i: number) =>
							i === index ? { ...opt, key: newValue } : opt
						),
					}
					: task
			)
		);
	};

	/** -------------------------------------------------------
	 *  REMOVE OPTION
	 *  ------------------------------------------------------- */
	const removeOption = (taskId: any, index: any) => {
		setWorkForm(
			"tasks",
			tasks.map((task: any) =>
				task.id === taskId
					? {
						...task,
						options: task.options.filter((_: any, i: number) => i !== index),
					}
					: task
			)
		);
	};

  /** -------------------------------------------------------
   *  UI COMPONENT
   *  ------------------------------------------------------- */

  return (
    <KeyboardAwareScrollView bottomOffset={30}>
      <ScrollView style={styles.taskContainer}>
        {/* Add Task */}
        <TouchableOpacity style={styles.buttonContainer} onPress={addTask}>
          <Text style={styles.buttonText}>Add Task</Text>
          <Ionicons name="add-circle" size={18} color="white" />
        </TouchableOpacity>

        {/* Task List */}
        {tasks.map((task: any) => (
          <View key={task.id} style={styles.taskCard}>
            {/* Title */}
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Title</Text>
              <TouchableOpacity onPress={() => removeTask(task.id)}>
                <Ionicons name="trash" size={20} color="#818181" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={task.title}
              onChangeText={(t) => updateTask(task.id, "title", t)}
              placeholderTextColor="#94A3B8"
            />

            {/* TYPE SELECT */}
            <Text style={[styles.label, { marginTop: 12 }]}>Select Type</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setActiveDropdownTask(task.id)}
            >
              <Text style={styles.dropdownText}>
                {
                  // Convert API type back to UI name for display
                  task.type
                    ? Object.keys(TYPE_MAP).find(
                        (k) => TYPE_MAP[k] === task.type
                      ) || task.type
                    : "Select Type"
                }
              </Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>

            {/* DROPDOWN */}
            <Modal
              visible={activeDropdownTask === task.id}
              transparent
              animationType="fade"
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setActiveDropdownTask(null)}
              >
                <View style={styles.dropdownMenu}>
                  {UI_TYPES.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateTaskMany(task.id, {
                          type: TYPE_MAP[option],
                          options:
                            option === "Text" || option === "Number"
                              ? []               // no options
                              : task.options,    // keep options
                        });

                        setActiveDropdownTask(null);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>

            {/* OPTIONS UI */}
            {(task.type === "multipleChoice" ||
              task.type === "checkBox") && (
                <View style={{ marginTop: 15 }}>
                  {task.options.map((opt: any, index: number) => (
                    <View key={index} style={styles.optionRow}>
                      <TextInput
                        placeholderTextColor={"#000"}
                        style={styles.optionInput}
                        value={opt.key}
                        onChangeText={(text) =>
                          updateOption(task.id, index, text)
                        }
                        placeholder={`Option ${index + 1}`}
                      />

                      <TouchableOpacity
                        onPress={() => removeOption(task.id, index)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={22}
                          color="#4F46E5"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => addOption(task.id)}
                    style={styles.addOptionButton}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={14}
                      color="#4F46E5"
                    />
                    <Text style={styles.addOptionText}>Add Options</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

export default TaskScreen;

/* ─────────────────────────────────────────────── STYLES ─────────────────────────────────────────────── */

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
    paddingBottom: 80,
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
});

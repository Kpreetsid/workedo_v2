import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Fonts from "@/constants/Typography";
import ActionButton from "../auth-screens/ActionButton";
import { WorkOrder, WorkOrderTask } from "@/src/types/workOrder";
import { patchWorkOrder } from "@/src/services/work-order.service";

interface Props {
  params: WorkOrder;
  onSaved?: () => void;
}

const TASK_STATUSES = ["Open", "In-Progress", "On-Hold", "Completed"] as const;

const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();

const isTaskComplete = (task: WorkOrderTask) =>
  Boolean(task?.completed) || normalizeStatus(task?.status) === normalizeStatus("Completed");

export default function Tasks({ params, onSaved }: Props) {
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [saving, setSaving] = useState(false);

  const readOnly = Boolean(params?.hierarchy?.executionOwnedByChildren) || normalizeStatus(params?.status) === "completed";

  useEffect(() => {
    setTasks(Array.isArray(params?.tasks) ? params.tasks : []);
  }, [params?.tasks]);

  const completedCount = useMemo(() => tasks.filter((task) => isTaskComplete(task)).length, [tasks]);

  const updateTask = (taskIndex: number, updater: (task: WorkOrderTask) => WorkOrderTask) => {
    setTasks((prev) => prev.map((task, index) => (index === taskIndex ? updater(task) : task)));
  };

  const toggleCheckbox = (taskIndex: number, optionIndex: number) => {
    updateTask(taskIndex, (task) => ({
      ...task,
      status: task.status === "Completed" ? "In-Progress" : task.status || "In-Progress",
      completed: false,
      options: task.options.map((opt: any, index: number) =>
        index === optionIndex ? { ...opt, value: !opt.value } : opt
      ),
    }));
  };

  const selectRadio = (taskIndex: number, selectedValue: number) => {
    updateTask(taskIndex, (task) => ({
      ...task,
      status: task.status === "Completed" ? "In-Progress" : task.status || "In-Progress",
      completed: false,
      fieldValue: selectedValue,
    }));
  };

  const updateFieldValue = (taskIndex: number, value: string) => {
    updateTask(taskIndex, (task) => ({
      ...task,
      status: task.status === "Completed" ? "In-Progress" : task.status || "In-Progress",
      completed: false,
      fieldValue: value,
    }));
  };

  const updateTaskStatus = (taskIndex: number, status: (typeof TASK_STATUSES)[number]) => {
    updateTask(taskIndex, (task) => ({
      ...task,
      status,
      completed: status === "Completed",
    }));
  };

  const saveTaskProgress = async () => {
    if (!params?.id || readOnly) return;

    setSaving(true);
    try {
      const response = await patchWorkOrder(params.id, {
        tasks,
        task_submitted: tasks.length > 0,
      });

      if (response?.status) {
        ToastAndroid.show("Task progress saved", ToastAndroid.SHORT);
        onSaved?.();
        return;
      }

      ToastAndroid.show(response?.message || "Failed to save task progress", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Failed to save task progress", ToastAndroid.LONG);
    } finally {
      setSaving(false);
    }
  };

  if (!tasks.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No execution tasks are attached to this work order.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Task Execution</Text>
        <Text style={styles.heroTitle}>{completedCount}/{tasks.length} tasks completed</Text>
        <Text style={styles.heroSubtitle}>
          Update task status as work progresses so the work order history reflects what was completed on the floor.
        </Text>
      </View>

      {readOnly ? (
        <View style={styles.readOnlyBanner}>
          <Text style={styles.readOnlyTitle}>
            {normalizeStatus(params?.status) === "completed" ? "Tasks are locked after completion" : "Task execution belongs on child work orders"}
          </Text>
          <Text style={styles.readOnlyText}>
            {normalizeStatus(params?.status) === "completed"
              ? "The checklist remains visible for audit history, but task updates are no longer editable."
              : "This parent work order rolls up child execution. Record task progress on the child work orders instead."}
          </Text>
        </View>
      ) : null}

      {tasks.map((task, taskIndex) => (
        <View key={task.title || `${taskIndex}`} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[styles.statusPill, isTaskComplete(task) ? styles.statusPillComplete : styles.statusPillOpen]}>
              <Text style={[styles.statusPillText, isTaskComplete(task) ? styles.statusPillTextComplete : styles.statusPillTextOpen]}>
                {task.status || (task.completed ? "Completed" : "Open")}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            {TASK_STATUSES.map((status) => {
              const active = normalizeStatus(task.status || (task.completed ? "Completed" : "Open")) === normalizeStatus(status);
              return (
                <Pressable
                  key={`${task.title}-${status}`}
                  disabled={readOnly}
                  style={[styles.statusChip, active && styles.statusChipActive, readOnly && styles.statusChipDisabled]}
                  onPress={() => updateTaskStatus(taskIndex, status)}
                >
                  <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>{status.replace("-", " ")}</Text>
                </Pressable>
              );
            })}
          </View>

          {task.type === "text" ? (
            <TextInput
              editable={!readOnly}
              style={[styles.input, readOnly && styles.inputDisabled]}
              placeholder={task.title}
              placeholderTextColor="#94A3B8"
              value={String(task.fieldValue ?? "")}
              onChangeText={(text) => updateFieldValue(taskIndex, text)}
            />
          ) : null}

          {task.type === "number" ? (
            <TextInput
              editable={!readOnly}
              style={[styles.input, readOnly && styles.inputDisabled]}
              placeholder={task.title}
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={String(task.fieldValue ?? "")}
              onChangeText={(text) => updateFieldValue(taskIndex, text.replace(/[^0-9.]/g, ""))}
            />
          ) : null}

          {task.type === "checkBox" ? (
            <View style={styles.optionList}>
              {task.options.map((opt: any, optionIndex: number) => (
                <Pressable
                  key={`${task.title}-${optionIndex}`}
                  style={styles.checkboxRow}
                  disabled={readOnly}
                  onPress={() => toggleCheckbox(taskIndex, optionIndex)}
                >
                  <Ionicons
                    name={opt.value ? "checkbox" : "square-outline"}
                    size={20}
                    color={readOnly ? "#94A3B8" : "#742BDE"}
                  />
                  <Text style={styles.optionLabel}>{opt.key || `Option ${optionIndex + 1}`}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {task.type === "multipleChoice" ? (
            <View style={styles.optionList}>
              {task.options.map((opt: any, optionIndex: number) => {
                const selected = Number(task.fieldValue) === opt.value;
                return (
                  <Pressable
                    key={`${task.title}-choice-${optionIndex}`}
                    style={styles.checkboxRow}
                    disabled={readOnly}
                    onPress={() => selectRadio(taskIndex, opt.value)}
                  >
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={readOnly ? "#94A3B8" : "#742BDE"}
                    />
                    <Text style={styles.optionLabel}>{opt.key || `Option ${optionIndex + 1}`}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      ))}

      {!readOnly ? (
        <ActionButton
          label={saving ? "Saving..." : "Save Task Progress"}
          onPress={saveTaskProgress}
          disabled={saving}
          style={styles.saveButton}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 36,
    gap: 12,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: "#1D4ED8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: "#0F172A",
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#475569",
    lineHeight: 17,
    marginTop: 6,
  },
  readOnlyBanner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDBA74",
  },
  readOnlyTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#C2410C",
  },
  readOnlyText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#9A3412",
    lineHeight: 16,
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillComplete: {
    backgroundColor: "#DCFCE7",
  },
  statusPillOpen: {
    backgroundColor: "#E0E7FF",
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
  },
  statusPillTextComplete: {
    color: "#166534",
  },
  statusPillTextOpen: {
    color: "#4338CA",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },
  statusChipActive: {
    backgroundColor: "#742BDE",
    borderColor: "#742BDE",
  },
  statusChipDisabled: {
    opacity: 0.7,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#334155",
  },
  statusChipTextActive: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#0F172A",
  },
  inputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },
  optionList: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#334155",
  },
  saveButton: {
    marginTop: 4,
    marginBottom: 8,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#64748B",
    textAlign: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { ProcedureStep } from "@/src/types/procedure";
import { collectProcedureTriggeredActions, isProcedureStepVisible } from "@/src/utils/workOrderProcedure";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ProcedureRendererProps {
  steps: ProcedureStep[];
  responses: Record<string, any>;
  onChange: (stepId: string, value: any) => void;
  readOnly?: boolean;
  level?: number;
}

const OPTION_BASED_TYPES = new Set(["multiple-choice", "inspection-check", "yes-no-na"]);

const FIELD_TYPE_LABELS: Record<string, string> = {
  checkbox: "Checkbox",
  text: "Text Field",
  textarea: "Text Field",
  number: "Number Field",
  "multiple-choice": "Multiple Choice",
  checklist: "Checklist",
  "inspection-check": "Inspection Check",
  "yes-no-na": "Yes / No / N/A",
  date: "Date",
};

const coerceChecklistValue = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  return [];
};

const getOptionScore = (step: ProcedureStep, option: string): number | null => {
  if (!step?.scoring_enabled || !Array.isArray(step.option_scores) || !Array.isArray(step.options)) {
    return null;
  }
  const optionIndex = step.options.findIndex((item) => item === option);
  return optionIndex >= 0 && step.option_scores[optionIndex] !== undefined
    ? Number(step.option_scores[optionIndex] || 0)
    : null;
};

const renderChoice = (
  label: string,
  active: boolean,
  onPress: () => void,
  readOnly: boolean,
  score: number | null
) => (
  <Pressable
    key={label}
    style={[styles.choiceChip, active && styles.choiceChipActive, readOnly && styles.choiceChipDisabled]}
    onPress={readOnly ? undefined : onPress}
  >
    <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
    {score !== null ? (
      <View style={[styles.choiceScore, active && styles.choiceScoreActive]}>
        <Text style={[styles.choiceScoreText, active && styles.choiceScoreTextActive]}>{score}</Text>
      </View>
    ) : null}
  </Pressable>
);

export default function ProcedureRenderer({
  steps,
  responses,
  onChange,
  readOnly = false,
  level = 0,
}: ProcedureRendererProps) {
  const triggeredActions = useMemo(
    () => collectProcedureTriggeredActions(steps || [], responses || {}),
    [responses, steps]
  );

  const getStepTriggeredActions = (stepId?: string) =>
    triggeredActions.filter((action) => !!stepId && action.step_id === stepId);

  return (
    <View style={styles.container}>
      {(steps || []).map((step) => {
        if (!isProcedureStepVisible(step, responses)) {
          return null;
        }

        if (step?.type === "heading") {
          return (
            <View key={step.id} style={styles.headingBlock}>
              <Text style={styles.headingTitle}>{step.title}</Text>
              {!!step.description ? <Text style={styles.headingDescription}>{step.description}</Text> : null}
            </View>
          );
        }

        if (step?.type === "section") {
          return (
            <View key={step.id} style={[styles.sectionCard, level > 0 && styles.sectionCardNested]}>
              <Text style={styles.sectionTitle}>{step.title}</Text>
              {!!step.description ? <Text style={styles.sectionDescription}>{step.description}</Text> : null}
              <ProcedureRenderer
                steps={step.items || []}
                responses={responses}
                onChange={onChange}
                readOnly={readOnly}
                level={level + 1}
              />
            </View>
          );
        }

        const fieldType = step?.field_type || "text";
        const value = responses?.[step.id];
        const optionValues = fieldType === "yes-no-na"
          ? (Array.isArray(step.options) && step.options.length ? step.options : ["Yes", "No", "N/A"])
          : (step.options || []);
        const stepTriggeredActions = getStepTriggeredActions(step.id);

        return (
          <View key={step.id} style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldTitle}>
                {step.title}
                {step.required ? <Text style={styles.requiredMarker}> *</Text> : null}
              </Text>
              <Text style={styles.fieldType}>{FIELD_TYPE_LABELS[fieldType] || "Field"}</Text>
            </View>

            {!!step.description ? <Text style={styles.fieldDescription}>{step.description}</Text> : null}
            {fieldType === "date" && step.include_time ? (
              <Text style={styles.fieldMeta}>Includes time capture</Text>
            ) : null}

            {(fieldType === "text" || fieldType === "textarea") ? (
              <TextInput
                style={[styles.input, fieldType === "textarea" && styles.textArea, readOnly && styles.disabledInput]}
                value={typeof value === "string" ? value : value ? String(value) : ""}
                editable={!readOnly}
                multiline={fieldType === "textarea"}
                numberOfLines={fieldType === "textarea" ? 4 : 1}
                placeholder={fieldType === "textarea" ? "Add your response" : "Enter response"}
                onChangeText={(text) => onChange(step.id, text)}
              />
            ) : null}

            {fieldType === "number" ? (
              <TextInput
                style={[styles.input, readOnly && styles.disabledInput]}
                value={value === null || value === undefined ? "" : String(value)}
                editable={!readOnly}
                keyboardType="numeric"
                placeholder="Enter number"
                onChangeText={(text) => onChange(step.id, text.replace(/[^0-9.\-]/g, ""))}
              />
            ) : null}

            {fieldType === "date" ? (
              <TextInput
                style={[styles.input, readOnly && styles.disabledInput]}
                value={typeof value === "string" ? value : ""}
                editable={!readOnly}
                placeholder={step.include_time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD"}
                onChangeText={(text) => onChange(step.id, text)}
              />
            ) : null}

            {OPTION_BASED_TYPES.has(fieldType) ? (
              <View style={styles.choiceWrap}>
                {optionValues.map((option) =>
                  renderChoice(
                    option,
                    String(value || "") === String(option),
                    () => onChange(step.id, option),
                    readOnly,
                    getOptionScore(step, option)
                  )
                )}
              </View>
            ) : null}

            {(fieldType === "checkbox" || fieldType === "checklist") ? (
              <View style={styles.checklistWrap}>
                {optionValues.map((option) => {
                  const selectedValues = coerceChecklistValue(value);
                  const active = selectedValues.includes(option);
                  const score = getOptionScore(step, option);

                  return (
                    <Pressable
                      key={option}
                      style={styles.checklistItem}
                      onPress={readOnly ? undefined : () => {
                        const nextValues = active
                          ? selectedValues.filter((entry) => entry !== option)
                          : [...selectedValues, option];
                        onChange(step.id, nextValues);
                      }}
                    >
                      <Ionicons
                        name={active ? "checkbox" : "square-outline"}
                        size={18}
                        color={active ? "#742BDE" : "#64748B"}
                      />
                      <Text style={styles.checklistLabel}>{option}</Text>
                      {score !== null ? <Text style={styles.checklistScore}>{score}</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {stepTriggeredActions.length ? (
              <View style={styles.correctiveWrap}>
                <Text style={styles.correctiveHeader}>Corrective Actions</Text>
                {stepTriggeredActions.map((action, index) => (
                  <View key={`${action.id || action.title}-${index}`} style={styles.correctiveCard}>
                    <View style={styles.correctiveTitleRow}>
                      <Text style={styles.correctiveTitle}>{action.title}</Text>
                      {!!action.priority ? <Text style={styles.correctivePriority}>{action.priority}</Text> : null}
                    </View>
                    {!!action.description ? <Text style={styles.correctiveDescription}>{action.description}</Text> : null}
                    {Array.isArray(action.trigger_values) && action.trigger_values.length ? (
                      <Text style={styles.correctiveMeta}>Triggered by: {action.trigger_values.join(", ")}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headingBlock: {
    gap: 4,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  headingTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  headingDescription: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    padding: 12,
    gap: 10,
  },
  sectionCardNested: {
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: "#1E293B",
  },
  sectionDescription: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 16,
  },
  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    padding: 12,
    gap: 8,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  fieldTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  requiredMarker: {
    color: "#DC2626",
  },
  fieldType: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
    textTransform: "capitalize",
  },
  fieldDescription: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 16,
  },
  fieldMeta: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#F8FAFC",
    color: "#64748B",
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  choiceChipActive: {
    borderColor: "#742BDE",
    backgroundColor: "#F4EDFF",
  },
  choiceChipDisabled: {
    opacity: 0.7,
  },
  choiceChipText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#334155",
  },
  choiceChipTextActive: {
    color: "#5B21B6",
  },
  choiceScore: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  choiceScoreActive: {
    backgroundColor: "#DDD6FE",
  },
  choiceScoreText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#475569",
  },
  choiceScoreTextActive: {
    color: "#5B21B6",
  },
  checklistWrap: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checklistLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#334155",
  },
  checklistScore: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#475569",
  },
  correctiveWrap: {
    marginTop: 4,
    gap: 8,
  },
  correctiveHeader: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#991B1B",
    textTransform: "uppercase",
  },
  correctiveCard: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF7F7",
    borderWidth: 0.8,
    borderColor: "#FECACA",
    gap: 4,
  },
  correctiveTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  correctiveTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#991B1B",
  },
  correctivePriority: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: "#B45309",
    textTransform: "uppercase",
  },
  correctiveDescription: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#7F1D1D",
    lineHeight: 15,
  },
  correctiveMeta: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#7F1D1D",
  },
});

import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { ProcedureStep } from "@/src/types/procedure";
import { isProcedureStepVisible } from "@/src/utils/workOrderProcedure";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ProcedureRendererProps {
  steps: ProcedureStep[];
  responses: Record<string, any>;
  onChange: (stepId: string, value: any) => void;
  readOnly?: boolean;
  level?: number;
}

const OPTION_BASED_TYPES = new Set(["multiple-choice", "inspection-check", "yes-no-na"]);

const coerceChecklistValue = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  return [];
};

const renderChoice = (
  value: string,
  active: boolean,
  onPress: () => void,
  readOnly: boolean
) => (
  <Pressable
    key={value}
    style={[styles.choiceChip, active && styles.choiceChipActive, readOnly && styles.choiceChipDisabled]}
    onPress={readOnly ? undefined : onPress}
  >
    <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{value}</Text>
  </Pressable>
);

export default function ProcedureRenderer({
  steps,
  responses,
  onChange,
  readOnly = false,
  level = 0,
}: ProcedureRendererProps) {
  return (
    <View style={styles.container}>
      {(steps || []).map((step) => {
        if (!isProcedureStepVisible(step, responses)) {
          return null;
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

        return (
          <View key={step.id} style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldTitle}>
                {step.title}
                {step.required ? <Text style={styles.requiredMarker}> *</Text> : null}
              </Text>
              {!!fieldType ? <Text style={styles.fieldType}>{fieldType}</Text> : null}
            </View>

            {!!step.description ? <Text style={styles.fieldDescription}>{step.description}</Text> : null}

            {fieldType === "text" || fieldType === "textarea" ? (
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
                placeholder="YYYY-MM-DD"
                onChangeText={(text) => onChange(step.id, text)}
              />
            ) : null}

            {OPTION_BASED_TYPES.has(fieldType) ? (
              <View style={styles.choiceWrap}>
                {(step.options || []).map((option) =>
                  renderChoice(
                    option,
                    String(value || "") === String(option),
                    () => onChange(step.id, option),
                    readOnly
                  )
                )}
              </View>
            ) : null}

            {(fieldType === "checkbox" || fieldType === "checklist") ? (
              <View style={styles.checklistWrap}>
                {(step.options || []).map((option) => {
                  const selectedValues = coerceChecklistValue(value);
                  const active = selectedValues.includes(option);

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
                    </Pressable>
                  );
                })}
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
});

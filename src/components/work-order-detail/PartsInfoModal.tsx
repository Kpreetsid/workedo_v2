import { FC, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { CloseIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "../auth-screens/ActionButton";
import { patchWorkOrder } from "@/src/services/work-order.service";
import { WorkOrderPartLine } from "@/src/types/workOrder";

interface InventoryWarning {
  part_id?: string;
  part_name?: string;
  message?: string;
  quantity?: number;
}

interface PartsInfoModalProps {
  visible: boolean;
  onClose: () => void;
  parts: WorkOrderPartLine[];
  workOrderId?: string;
  inventoryWarnings?: InventoryWarning[];
  readOnly?: boolean;
  onSaved?: () => void;
}

type EditablePart = WorkOrderPartLine & {
  key: string;
  actualQuantityInput: string;
};

const { height } = Dimensions.get("window");

const toNumericValue = (value: any) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const normalizeActualInput = (value: any) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const resolvePartKey = (part: WorkOrderPartLine) =>
  String(part?.part_id || part?.id || part?._id || part?.part_number || part?.part_name || "").trim();

const buildEditableParts = (parts: WorkOrderPartLine[] = []): EditablePart[] =>
  (parts || []).map((part, index) => ({
    ...part,
    key: `${resolvePartKey(part)}-${index}`,
    actualQuantityInput: normalizeActualInput(part?.actualQuantity),
  }));

const sanitizePartsPayload = (parts: EditablePart[]) =>
  parts.map((part) => {
    const plannedQuantity = toNumericValue(part?.plannedQuantity ?? part?.estimatedQuantity);
    const parsedActual = part.actualQuantityInput === "" ? null : Number(part.actualQuantityInput);

    return {
      ...part,
      plannedQuantity,
      estimatedQuantity: plannedQuantity,
      actualQuantity: parsedActual === null ? null : Number.isFinite(parsedActual) ? parsedActual : null,
    };
  });

const PartsInfoModal: FC<PartsInfoModalProps> = ({
  visible,
  onClose,
  parts,
  workOrderId,
  inventoryWarnings,
  readOnly = false,
  onSaved,
}) => {
  const [editableParts, setEditableParts] = useState<EditablePart[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditableParts(buildEditableParts(parts));
  }, [parts, visible]);

  const warningMap = useMemo(() => {
    const map = new Map<string, InventoryWarning>();
    (inventoryWarnings || []).forEach((warning) => {
      const key = String(warning?.part_id || warning?.part_name || "").trim();
      if (key) {
        map.set(key, warning);
      }
    });
    return map;
  }, [inventoryWarnings]);

  const partSummary = useMemo(() => {
    return editableParts.reduce(
      (summary, part) => {
        summary.planned += toNumericValue(part?.plannedQuantity ?? part?.estimatedQuantity);
        summary.actual += toNumericValue(part?.actualQuantityInput === "" ? 0 : part?.actualQuantityInput);
        if (part?.procedureLinked) summary.procedureLinked += 1;
        if (warningMap.has(resolvePartKey(part)) || warningMap.has(part?.part_name || "")) summary.shortages += 1;
        return summary;
      },
      { planned: 0, actual: 0, procedureLinked: 0, shortages: 0 }
    );
  }, [editableParts, warningMap]);

  const updatePartActual = (key: string, value: string) => {
    setEditableParts((prev) =>
      prev.map((part) =>
        part.key === key
          ? {
              ...part,
              actualQuantityInput: value.replace(/[^0-9.]/g, ""),
            }
          : part
      )
    );
  };

  const savePartsUsage = async () => {
    if (!workOrderId || readOnly) {
      onClose();
      return;
    }

    const invalidPart = editableParts.find((part) => {
      if (part.actualQuantityInput === "") return false;
      const numericValue = Number(part.actualQuantityInput);
      return !Number.isFinite(numericValue) || numericValue < 0;
    });

    if (invalidPart) {
      ToastAndroid.show("Actual part quantity must be a valid positive number.", ToastAndroid.SHORT);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        parts: sanitizePartsPayload(editableParts),
      };
      const response = await patchWorkOrder(workOrderId, payload);
      if (response?.status) {
        ToastAndroid.show("Parts usage saved", ToastAndroid.SHORT);
        onSaved?.();
        onClose();
        return;
      }
      ToastAndroid.show(response?.message || "Unable to save parts usage", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Unable to save parts usage", ToastAndroid.LONG);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetTitle}>Parts Used</Text>
              <Text style={styles.sheetSubtitle}>Log actual usage and review shortages before completion.</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>Planned</Text>
              <Text style={styles.summaryValue}>{partSummary.planned}</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>Actual</Text>
              <Text style={styles.summaryValue}>{partSummary.actual}</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>Procedure</Text>
              <Text style={styles.summaryValue}>{partSummary.procedureLinked}</Text>
            </View>
            <View style={[styles.summaryChip, partSummary.shortages > 0 ? styles.summaryChipWarning : null]}>
              <Text style={[styles.summaryLabel, partSummary.shortages > 0 ? styles.summaryLabelWarning : null]}>Short</Text>
              <Text style={[styles.summaryValue, partSummary.shortages > 0 ? styles.summaryValueWarning : null]}>{partSummary.shortages}</Text>
            </View>
          </View>

          <ScrollView style={{ maxHeight: height * 0.55 }} contentContainerStyle={styles.listContent}>
            {editableParts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No parts linked</Text>
                <Text style={styles.emptyText}>This work order does not have any planned or procedure-linked parts yet.</Text>
              </View>
            ) : (
              editableParts.map((part) => {
                const warning =
                  warningMap.get(resolvePartKey(part)) ||
                  warningMap.get(String(part?.part_name || "").trim());
                const plannedQuantity = toNumericValue(part?.plannedQuantity ?? part?.estimatedQuantity);
                const sourceLabel = part?.procedureLinked ? "Procedure-linked" : "Manual";
                const procedureNames = Array.isArray(part?.procedureNames) ? part.procedureNames.filter(Boolean) : [];

                return (
                  <View key={part.key} style={styles.partCard}>
                    <View style={styles.partTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partName}>{part?.part_name || "Unnamed Part"}</Text>
                        <Text style={styles.partMeta}>
                          {part?.part_number || "No part number"}
                          {part?.unit ? ` | ${part.unit}` : ""}
                        </Text>
                      </View>
                      <View style={[styles.sourceChip, part?.procedureLinked ? styles.sourceChipProcedure : styles.sourceChipManual]}>
                        <Text style={[styles.sourceChipText, part?.procedureLinked ? styles.sourceChipTextProcedure : styles.sourceChipTextManual]}>
                          {sourceLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.quantityRow}>
                      <View style={styles.quantityCell}>
                        <Text style={styles.quantityLabel}>Planned</Text>
                        <Text style={styles.quantityValue}>{plannedQuantity}</Text>
                      </View>
                      <View style={styles.quantityCell}>
                        <Text style={styles.quantityLabel}>Actual Used</Text>
                        <TextInput
                          editable={!readOnly}
                          value={part.actualQuantityInput}
                          onChangeText={(value) => updatePartActual(part.key, value)}
                          style={[styles.quantityInput, readOnly && styles.quantityInputDisabled]}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor="#94A3B8"
                        />
                      </View>
                    </View>

                    {procedureNames.length > 0 ? (
                      <Text style={styles.procedureMeta}>From procedures: {procedureNames.join(", ")}</Text>
                    ) : null}

                    {!!warning?.message ? (
                      <View style={styles.warningChip}>
                        <Ionicons name="alert-circle-outline" size={14} color="#B45309" />
                        <Text style={styles.warningText}>{warning.message}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>

          {!readOnly ? (
            <View style={styles.actionWrap}>
              {saving ? <ActivityIndicator color="#742BDE" style={{ marginBottom: 8 }} /> : null}
              <ActionButton
                label={saving ? "Saving..." : "Save Parts Usage"}
                onPress={savePartsUsage}
                disabled={saving}
                style={{ width: "100%" }}
              />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.28)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "82%",
  },
  handle: {
    width: 56,
    height: 4,
    alignSelf: "center",
    backgroundColor: "#D8B4FE",
    borderRadius: 999,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: "#5B21B6",
  },
  sheetSubtitle: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },
  summaryRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryChip: {
    minWidth: 72,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  summaryChipWarning: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FCD34D",
  },
  summaryLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: "#64748B",
  },
  summaryLabelWarning: {
    color: "#B45309",
  },
  summaryValue: {
    marginTop: 6,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#0F172A",
  },
  summaryValueWarning: {
    color: "#B45309",
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  emptyState: {
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontFamily: Fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },
  partCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  partTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  partName: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#0F172A",
  },
  partMeta: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: "#64748B",
  },
  sourceChip: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  sourceChipProcedure: {
    backgroundColor: "#EEF4FF",
    borderColor: "#BFDBFE",
  },
  sourceChipManual: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  sourceChipText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  sourceChipTextProcedure: {
    color: "#1D4ED8",
  },
  sourceChipTextManual: {
    color: "#475569",
  },
  quantityRow: {
    flexDirection: "row",
    gap: 10,
  },
  quantityCell: {
    flex: 1,
    gap: 6,
  },
  quantityLabel: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: "#64748B",
  },
  quantityValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: "#0F172A",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quantityInput: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "#0F172A",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  quantityInputDisabled: {
    backgroundColor: "#F1F5F9",
    color: "#64748B",
  },
  procedureMeta: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: "#475569",
    lineHeight: 15,
  },
  warningChip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  warningText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 10,
    lineHeight: 15,
    color: "#B45309",
  },
  actionWrap: {
    paddingTop: 12,
  },
});

export default PartsInfoModal;

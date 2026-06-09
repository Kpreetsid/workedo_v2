import ActionButton from "../auth-screens/ActionButton";
import Fonts from "@/constants/Typography";
import { patchWorkOrder } from "@/src/services/work-order.service";
import { ProcedureRequiredPart, ProcedureTriggeredAction } from "@/src/types/procedure";
import { WorkOrder, WorkOrderProcedure } from "@/src/types/workOrder";
import {
  buildProcedureEntriesPayload,
  getIncompleteProcedureCount,
  getProcedureAnsweredRequiredFieldCount,
  getProcedureRequiredFieldCount,
  getProcedureRequiredParts,
  getProcedureScoreLabel,
  getProcedureTriggeredActions,
  isProcedureComplete,
  normalizeWorkOrderProcedures,
} from "@/src/utils/workOrderProcedure";
import React, { useEffect, useMemo, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ActivityIndicator, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import ProcedureRenderer from "./ProcedureRenderer";

interface ProceduresTabProps {
  params: WorkOrder;
  onSaved?: () => void;
}

const getPartLabel = (part: ProcedureRequiredPart) => part?.part_name || part?.part_number || part?.barcode || "Part";

const RequiredPartsCard = ({ parts }: { parts: ProcedureRequiredPart[] }) => {
  if (!parts.length) {
    return null;
  }

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailCardTitle}>Required Parts</Text>
      {parts.map((part, index) => {
        const available = Number(part?.inventory?.quantity ?? 0);
        const required = Number(part?.quantity ?? 0);
        const shortage = required > available;

        return (
          <View key={`${part.part_id || part.part_number || part.part_name}-${index}`} style={styles.partRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.partName}>{getPartLabel(part)}</Text>
              <Text style={styles.partMeta}>
                Need {required} {part?.unit || ""} {part?.inventory?.location_id ? `• stock ${available}` : ""}
              </Text>
              {!!part?.notes ? <Text style={styles.partNote}>{part.notes}</Text> : null}
            </View>
            <View style={[styles.partStatusChip, shortage ? styles.partStatusChipAlert : styles.partStatusChipSafe]}>
              <Text style={[styles.partStatusText, shortage ? styles.partStatusTextAlert : styles.partStatusTextSafe]}>
                {shortage ? "Short" : "Ready"}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const TriggeredActionsCard = ({ actions }: { actions: ProcedureTriggeredAction[] }) => {
  if (!actions.length) {
    return null;
  }

  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailCardTitle}>Corrective Actions Triggered</Text>
      {actions.map((action, index) => (
        <View key={`${action.id || action.title}-${index}`} style={styles.actionRow}>
          <Text style={styles.actionTitle}>{action.title}</Text>
          {!!action.priority ? <Text style={styles.actionMeta}>Priority: {action.priority}</Text> : null}
          {!!action.description ? <Text style={styles.actionDescription}>{action.description}</Text> : null}
        </View>
      ))}
    </View>
  );
};

export default function ProceduresTab({ params, onSaved }: ProceduresTabProps) {
  const [procedures, setProcedures] = useState<WorkOrderProcedure[]>([]);
  const [expandedProcedureId, setExpandedProcedureId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const normalizeStatus = (value?: string | null) => (value ?? "").toLowerCase().replace(/[-\s]/g, "");
  const isCompletedWorkOrder = ["completed", "done"].includes(normalizeStatus(params?.status));
  const isChildOwnedParent = Boolean(params?.hierarchy?.executionOwnedByChildren);
  const readOnly = isChildOwnedParent || isCompletedWorkOrder;

  useEffect(() => {
    const normalized = normalizeWorkOrderProcedures(params);
    setProcedures(normalized);
    setExpandedProcedureId((current) => current || normalized?.[0]?.id || null);
  }, [params]);

  const incompleteCount = useMemo(() => getIncompleteProcedureCount(procedures), [procedures]);
  const procedurePartsSummary = useMemo(() => {
    return procedures.reduce(
      (summary, procedure) => {
        const requiredParts = getProcedureRequiredParts(procedure);
        summary.requiredParts += requiredParts.length;
        summary.shortages += requiredParts.filter((part) => Number(part?.quantity ?? 0) > Number(part?.inventory?.quantity ?? 0)).length;
        return summary;
      },
      { requiredParts: 0, shortages: 0 }
    );
  }, [procedures]);

  const updateResponse = (procedureId: string, stepId: string, value: any) => {
    setProcedures((prev) =>
      prev.map((procedure) =>
        procedure.id === procedureId
          ? {
              ...procedure,
              responses: {
                ...(procedure.responses || {}),
                [stepId]: value,
              },
            }
          : procedure
      )
    );
  };

  const saveProcedures = async () => {
    if (!params?.id || readOnly) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        procedure_ids: procedures.map((procedure) => procedure.procedure_id || procedure.id).filter(Boolean),
        procedure_entries: buildProcedureEntriesPayload(procedures),
      };

      const res = await patchWorkOrder(params.id, payload);
      if (res?.status) {
        ToastAndroid.show(
          incompleteCount > 0 ? "Procedure progress saved" : "Procedures submitted successfully",
          ToastAndroid.SHORT
        );
        onSaved?.();
        return;
      }

      ToastAndroid.show("Failed to save procedures", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || "Failed to save procedures", ToastAndroid.LONG);
    } finally {
      setIsSaving(false);
    }
  };

  if (!procedures.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No procedures linked</Text>
        <Text style={styles.emptyText}>Attach a procedure template to this work order to capture inspection and execution data.</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView bottomOffset={24}>
      <View style={styles.container}>
        {readOnly ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerTitle}>
              {isCompletedWorkOrder
                ? "Procedures are locked after work order completion"
                : "Procedures are child-owned for this parent work order"}
            </Text>
            <Text style={styles.infoBannerText}>
              {isCompletedWorkOrder
                ? "This work order is completed, so procedure responses are now read-only."
                : "Capture procedure responses on the child work orders. This parent stays read-only for execution data."}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Procedure Execution</Text>
          <Text style={styles.summaryText}>
            {isCompletedWorkOrder
              ? "Procedure responses were captured for this completed work order and are now locked for audit consistency."
              : incompleteCount > 0
              ? `${incompleteCount} procedure${incompleteCount > 1 ? "s" : ""} still needs required responses before it becomes the official completion record.`
              : "All required procedure responses are complete. Saving will submit them as the official completion record."}
          </Text>
          {procedurePartsSummary.requiredParts > 0 ? (
            <Text style={styles.summarySupportText}>
              Required procedure parts: {procedurePartsSummary.requiredParts}
              {procedurePartsSummary.shortages > 0 ? ` | shortages detected: ${procedurePartsSummary.shortages}` : " | no shortages detected"}
            </Text>
          ) : null}
        </View>

        {procedures.map((procedure) => {
          const requiredFields = getProcedureRequiredFieldCount(procedure.steps || []);
          const answeredFields = getProcedureAnsweredRequiredFieldCount(procedure.steps || [], procedure.responses || {});
          const complete = isProcedureComplete(procedure);
          const scoreLabel = getProcedureScoreLabel(procedure.score_summary);
          const triggeredActions = getProcedureTriggeredActions(procedure);
          const requiredParts = getProcedureRequiredParts(procedure);
          const isExpanded = expandedProcedureId === procedure.id;

          return (
            <View key={procedure.id} style={styles.procedureCard}>
              <Pressable style={styles.procedureHeader} onPress={() => setExpandedProcedureId(isExpanded ? null : procedure.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.procedureName}>{procedure.name}</Text>
                  <Text style={styles.procedureMeta}>
                    {procedure.category || "Uncategorized"} • {complete ? "Complete" : "In Progress"}
                    {scoreLabel ? ` • ${scoreLabel}` : ""}
                  </Text>
                </View>

                <View style={[styles.statusPill, complete ? styles.statusPillSuccess : styles.statusPillPending]}>
                  <Text style={[styles.statusPillText, complete ? styles.statusPillTextSuccess : styles.statusPillTextPending]}>
                    {requiredFields ? `${answeredFields}/${requiredFields}` : procedure.submitted ? "Submitted" : "Open"}
                  </Text>
                </View>
              </Pressable>

              {!!procedure.description ? <Text style={styles.procedureDescription}>{procedure.description}</Text> : null}

              <View style={styles.procedureFacts}>
                <Text style={styles.factText}>Required answered: {answeredFields}/{requiredFields}</Text>
                <Text style={styles.factText}>Corrective actions: {triggeredActions.length}</Text>
              </View>

              {procedure.submitted_at ? (
                <Text style={styles.submittedMeta}>
                  Submitted by {procedure?.submitted_by ? `${procedure.submitted_by.firstName || ""} ${procedure.submitted_by.lastName || ""}`.trim() : "system"}
                  {" "}on {new Date(procedure.submitted_at).toLocaleString()}
                </Text>
              ) : null}

              {isExpanded ? (
                <View style={styles.expandedBody}>
                  <RequiredPartsCard parts={requiredParts} />

                  <ProcedureRenderer
                    steps={procedure.steps || []}
                    responses={procedure.responses || {}}
                    readOnly={readOnly}
                    onChange={(stepId, value) => updateResponse(procedure.id, stepId, value)}
                  />

                  <TriggeredActionsCard actions={triggeredActions} />
                </View>
              ) : null}
            </View>
          );
        })}

        {!readOnly ? (
          <View style={styles.actionWrap}>
            {isSaving ? <ActivityIndicator color="#742BDE" style={{ marginBottom: 6 }} /> : null}
            <ActionButton
              label={isSaving ? "Saving..." : incompleteCount > 0 ? "Save Progress" : "Submit Procedures"}
              onPress={saveProcedures}
              disabled={isSaving}
              style={{ width: "100%", alignSelf: "center", marginTop: 8, marginBottom: 40 }}
            />
          </View>
        ) : null}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  emptyState: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 18,
  },
  infoBanner: {
    backgroundColor: "#FFF7E6",
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.8,
    borderColor: "#FFD591",
  },
  infoBannerTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#7A4A00",
  },
  infoBannerText: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#7A4A00",
    lineHeight: 16,
  },
  summaryCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "#B4C6FC",
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#1E3A8A",
  },
  summaryText: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#334155",
    lineHeight: 16,
  },
  summarySupportText: {
    marginTop: 8,
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#1D4ED8",
  },
  procedureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  procedureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  procedureName: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  procedureMeta: {
    marginTop: 3,
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#475569",
  },
  procedureDescription: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#64748B",
    lineHeight: 16,
  },
  procedureFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  factText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: "#334155",
  },
  submittedMeta: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillPending: {
    backgroundColor: "#FFF7ED",
  },
  statusPillSuccess: {
    backgroundColor: "#ECFDF5",
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
  },
  statusPillTextPending: {
    color: "#9A3412",
  },
  statusPillTextSuccess: {
    color: "#047857",
  },
  expandedBody: {
    gap: 10,
  },
  actionWrap: {
    marginTop: 8,
  },
  detailCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.8,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  detailCardTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#0F172A",
  },
  partRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  partName: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: "#1E293B",
  },
  partMeta: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#475569",
  },
  partNote: {
    marginTop: 3,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#64748B",
  },
  partStatusChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  partStatusChipSafe: {
    backgroundColor: "#ECFDF5",
  },
  partStatusChipAlert: {
    backgroundColor: "#FEF2F2",
  },
  partStatusText: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
  },
  partStatusTextSafe: {
    color: "#047857",
  },
  partStatusTextAlert: {
    color: "#B91C1C",
  },
  actionRow: {
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.8,
    borderColor: "#FECACA",
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: "#991B1B",
  },
  actionMeta: {
    marginTop: 3,
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: "#B45309",
  },
  actionDescription: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: "#7F1D1D",
    lineHeight: 15,
  },
});

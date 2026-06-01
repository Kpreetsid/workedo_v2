import { ProcedureRequiredPart, ProcedureScoreSummary, ProcedureStep, ProcedureTriggeredAction } from "../types/procedure";
import { WorkOrder, WorkOrderProcedure } from "../types/workOrder";

export interface WorkOrderProcedureEntryPayload {
  procedure_id?: string | null;
  name: string;
  category?: string;
  tags?: string[];
  description?: string;
  steps: ProcedureStep[];
  responses: Record<string, any>;
}

const normalizeId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value?.id ?? value?._id ?? value?.procedure_id ?? "");
};

export function isProcedureStepVisible(step: ProcedureStep | null | undefined, responses: Record<string, any> = {}): boolean {
  const condition = step?.visibility_condition;
  if (!condition?.step_id || !Array.isArray(condition?.values) || !condition.values.length) {
    return true;
  }

  const dependentValue = responses?.[condition.step_id];
  const triggers = condition.values.map((value) => String(value || "").trim()).filter(Boolean);
  if (!triggers.length) {
    return true;
  }

  if (Array.isArray(dependentValue)) {
    return dependentValue.some((value) => triggers.includes(String(value || "").trim()));
  }

  return triggers.includes(String(dependentValue || "").trim());
}

export function isProcedureFieldAnswered(step: ProcedureStep, responses: Record<string, any> = {}): boolean {
  if (!isProcedureStepVisible(step, responses)) {
    return true;
  }
  if (step?.type !== "field" || !step?.required) {
    return true;
  }

  const value = responses?.[step.id];
  switch (step?.field_type) {
    case "checkbox":
    case "checklist":
      return Array.isArray(value) && value.length > 0;
    case "multiple-choice":
    case "inspection-check":
    case "yes-no-na":
      return typeof value === "string" && value.trim().length > 0;
    case "number":
      return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
    case "date":
      return typeof value === "string" && value.trim().length > 0;
    case "text":
    case "textarea":
    default:
      return typeof value === "string" ? value.trim().length > 0 : !!value;
  }
}

export function areProcedureStepsComplete(steps: ProcedureStep[] = [], responses: Record<string, any> = {}): boolean {
  return (steps || []).every((step) => {
    if (!isProcedureStepVisible(step, responses)) {
      return true;
    }
    if (step?.type === "section") {
      return areProcedureStepsComplete(step?.items || [], responses);
    }
    return isProcedureFieldAnswered(step, responses);
  });
}

export function getProcedureRequiredFieldCount(steps: ProcedureStep[] = []): number {
  return (steps || []).reduce((total, step) => {
    if (step?.type === "section") {
      return total + getProcedureRequiredFieldCount(step?.items || []);
    }
    return total + (step?.type === "field" && step?.required ? 1 : 0);
  }, 0);
}

export function getProcedureAnsweredRequiredFieldCount(
  steps: ProcedureStep[] = [],
  responses: Record<string, any> = {}
): number {
  return (steps || []).reduce((total, step) => {
    if (!isProcedureStepVisible(step, responses)) {
      return total;
    }
    if (step?.type === "section") {
      return total + getProcedureAnsweredRequiredFieldCount(step?.items || [], responses);
    }
    return total + (step?.type === "field" && step?.required && isProcedureFieldAnswered(step, responses) ? 1 : 0);
  }, 0);
}

export function isProcedureComplete(procedure: WorkOrderProcedure | null | undefined): boolean {
  if (!procedure) {
    return true;
  }
  return areProcedureStepsComplete(procedure.steps || [], procedure.responses || {});
}

export function normalizeWorkOrderProcedures(order: WorkOrder | null | undefined): WorkOrderProcedure[] {
  const rawProcedures = Array.isArray(order?.procedure_entries) && order?.procedure_entries?.length
    ? order.procedure_entries
    : Array.isArray(order?.procedures)
      ? order.procedures
      : [];

  return rawProcedures.map((procedure: any) => ({
    ...procedure,
    procedure_id: normalizeId(procedure?.procedure_id || procedure),
    id: normalizeId(procedure),
    name: procedure?.name || "Untitled Procedure",
    category: procedure?.category || "",
    tags: Array.isArray(procedure?.tags) ? procedure.tags : [],
    description: procedure?.description || "",
    steps: Array.isArray(procedure?.steps) ? procedure.steps : [],
    responses: procedure?.responses && typeof procedure.responses === "object" ? procedure.responses : {},
    submitted: !!procedure?.submitted,
    submitted_by: procedure?.submitted_by || null,
    submitted_at: procedure?.submitted_at || null,
    score_summary: procedure?.score_summary || null,
    triggered_actions: Array.isArray(procedure?.triggered_actions) ? procedure.triggered_actions : [],
    required_parts: Array.isArray(procedure?.required_parts) ? procedure.required_parts : [],
  }));
}

export function buildProcedureEntriesPayload(procedures: WorkOrderProcedure[] = []): WorkOrderProcedureEntryPayload[] {
  return (procedures || []).map((procedure) => ({
    procedure_id: procedure?.procedure_id || procedure?.id || null,
    name: procedure?.name || "Untitled Procedure",
    category: procedure?.category || "",
    tags: Array.isArray(procedure?.tags) ? procedure.tags : [],
    description: procedure?.description || "",
    steps: Array.isArray(procedure?.steps) ? procedure.steps : [],
    responses: procedure?.responses && typeof procedure.responses === "object" ? procedure.responses : {},
  }));
}

export function getIncompleteProcedureCount(procedures: WorkOrderProcedure[] = []): number {
  return (procedures || []).filter((procedure) => !isProcedureComplete(procedure)).length;
}

export function getProcedureRequiredParts(procedure: WorkOrderProcedure | null | undefined): ProcedureRequiredPart[] {
  return Array.isArray((procedure as any)?.required_parts) ? (procedure as any).required_parts : [];
}

export function getProcedureScoreLabel(scoreSummary?: ProcedureScoreSummary | null): string | null {
  if (!scoreSummary) {
    return null;
  }
  const earned = Number(scoreSummary.earned || 0);
  const possible = Number(scoreSummary.possible || 0);
  const percentage = scoreSummary.percentage;
  if (!possible && (percentage === null || percentage === undefined)) {
    return null;
  }
  if (percentage !== null && percentage !== undefined) {
    return `${percentage}% (${earned}/${possible})`;
  }
  return `${earned}/${possible}`;
}

export function getProcedureTriggeredActions(procedure: WorkOrderProcedure | null | undefined): ProcedureTriggeredAction[] {
  return Array.isArray(procedure?.triggered_actions) ? procedure.triggered_actions : [];
}

import { WorkOrder } from "../types/workOrder";

export type ReadinessState = "ready" | "attention" | "blocked";
export type ReadinessSectionId = "assignee" | "parts" | "procedure" | "schedule";

export interface ReadinessSection {
  id: ReadinessSectionId;
  label: string;
  state: ReadinessState;
  summary: string;
  details: string[];
}

export interface WorkOrderReadinessModel {
  state: ReadinessState;
  score: number;
  summary: string;
  executionReady: boolean;
  isOverdue: boolean;
  blockers: string[];
  sections: ReadinessSection[];
  sectionMap: Record<ReadinessSectionId, ReadinessSection>;
}

const BLOCKED_STATUSES = ["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"];

const parseDate = (value: any): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStartOfToday = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const getAssignedUserIds = (workOrder: any): string[] =>
  (workOrder?.assignedUsers || [])
    .map((user: any) => user?.userId || user?.id || user?.user?.id || user?.user?._id)
    .filter((id: any) => !!id)
    .map((id: any) => String(id));

const normalizeAvailabilityStatus = (status: any): string => String(status || "").trim().toLowerCase();

const getPartLifecycleState = (part: any): string => {
  const normalized = String(part?.lifecycleStatus || part?.lifecycle_status || "").trim().toLowerCase();
  if (["reserved", "issued", "returned", "short"].includes(normalized)) {
    return normalized;
  }
  return "planned";
};

const isBlockedLikeStatus = (status: string): boolean => BLOCKED_STATUSES.includes(status);

const buildAssigneeSection = (order: WorkOrder): ReadinessSection => {
  const assigneeIds = getAssignedUserIds(order);

  if (!assigneeIds.length) {
    return {
      id: "assignee",
      label: "Assignee",
      state: "blocked",
      summary: "No work order assignee selected.",
      details: ["Assign at least one owner before dispatching this job."],
    };
  }

  return {
    id: "assignee",
    label: "Assignee",
    state: "ready",
    summary: `${assigneeIds.length} work order owner${assigneeIds.length === 1 ? "" : "s"} assigned.`,
    details: ["Owners are ready for dispatch and execution."],
  };
};

const buildPartsSection = (order: WorkOrder): ReadinessSection => {
  const parts = Array.isArray(order?.parts) ? order.parts : [];
  const status = String(order?.status || "").trim();
  const inventoryWarnings = Array.isArray(order?.inventoryWarnings) ? order.inventoryWarnings : [];

  if (status === "Waiting-on-Parts") {
    return {
      id: "parts",
      label: "Parts",
      state: "blocked",
      summary: "Work order is waiting on parts availability.",
      details: [order?.block_reason || "Review reservations, missing inventory, or substitute parts before dispatch."],
    };
  }

  if (!parts.length) {
    return {
      id: "parts",
      label: "Parts",
      state: "attention",
      summary: "No parts planned on this work order.",
      details: ["Review whether parts staging is required before execution."],
    };
  }

  const invalidParts = parts.filter((part: any) => !part?.part_id || !(Number(part?.estimatedQuantity) > 0));
  if (invalidParts.length > 0) {
    return {
      id: "parts",
      label: "Parts",
      state: "blocked",
      summary: "Some planned parts are missing valid estimated quantities.",
      details: [`${invalidParts.length} part line${invalidParts.length === 1 ? "" : "s"} needs quantity cleanup.`],
    };
  }

  const blockedAvailability = parts.filter((part: any) => {
    const availability = normalizeAvailabilityStatus(part?.availabilityStatus);
    return ["missing", "out of stock", "out-of-stock"].includes(availability);
  });
  const shortLifecycleParts = parts.filter((part: any) => getPartLifecycleState(part) === "short");

  if (inventoryWarnings.length > 0 || blockedAvailability.length > 0 || shortLifecycleParts.length > 0) {
    const blockedCount = Math.max(inventoryWarnings.length, blockedAvailability.length, shortLifecycleParts.length);
    return {
      id: "parts",
      label: "Parts",
      state: "blocked",
      summary: "Some planned parts are unavailable for execution.",
      details: [`${blockedCount} part line${blockedCount === 1 ? "" : "s"} is missing, out of stock, short, or flagged by inventory validation.`],
    };
  }

  if (status === "Completed") {
    const missingActuals = parts.filter((part: any) => part?.actualQuantity === null || part?.actualQuantity === undefined);
    if (missingActuals.length > 0) {
      return {
        id: "parts",
        label: "Parts",
        state: "attention",
        summary: "Actual usage is not captured for all planned parts.",
        details: [`${missingActuals.length} part line${missingActuals.length === 1 ? "" : "s"} still needs actual quantity.`],
      };
    }
  }

  const totalEstimatedQuantity = parts.reduce((total: number, part: any) => total + Number(part?.estimatedQuantity || 0), 0);
  return {
    id: "parts",
    label: "Parts",
    state: "ready",
    summary: `${parts.length} part${parts.length === 1 ? "" : "s"} planned.`,
    details: [`Estimated issue quantity: ${totalEstimatedQuantity}.`, "Reservation and issue lifecycle is ready to track."],
  };
};

const buildProcedureSection = (order: WorkOrder): ReadinessSection => {
  const procedures = Array.isArray(order?.procedure_entries) && order.procedure_entries.length
    ? order.procedure_entries
    : Array.isArray(order?.procedures)
      ? order.procedures
      : [];
  const status = String(order?.status || "").trim();

  if (!procedures.length) {
    return {
      id: "procedure",
      label: "Procedure",
      state: "blocked",
      summary: "No procedure is attached.",
      details: ["Attach a procedure so technicians can follow and record the execution flow."],
    };
  }

  const incompleteProcedures = procedures.filter((procedure: any) => !procedure?.submitted);
  const scoredProcedures = procedures.filter((procedure: any) => Number(procedure?.score_summary?.possible || 0) > 0);

  if (incompleteProcedures.length > 0) {
    return {
      id: "procedure",
      label: "Procedure",
      state: status === "Completed" ? "attention" : "blocked",
      summary: `${incompleteProcedures.length} procedure${incompleteProcedures.length === 1 ? "" : "s"} still needs submission.`,
      details: [
        `${procedures.length - incompleteProcedures.length}/${procedures.length} procedure${procedures.length === 1 ? "" : "s"} submitted.`,
        "Complete all attached procedures before closeout so blocker tracking stays accurate.",
      ],
    };
  }

  const details: string[] = [`${procedures.length} procedure${procedures.length === 1 ? "" : "s"} attached and submitted.`];
  if (scoredProcedures.length > 0) {
    const earned = scoredProcedures.reduce((total: number, procedure: any) => total + Number(procedure?.score_summary?.earned || 0), 0);
    const possible = scoredProcedures.reduce((total: number, procedure: any) => total + Number(procedure?.score_summary?.possible || 0), 0);
    if (possible > 0) {
      details.push(`Procedure score: ${earned}/${possible}.`);
    }
  }

  const triggeredActions = procedures.reduce((total: number, procedure: any) => total + (Array.isArray(procedure?.triggered_actions) ? procedure.triggered_actions.length : 0), 0);
  if (triggeredActions > 0) {
    details.push(`${triggeredActions} corrective action${triggeredActions === 1 ? "" : "s"} triggered.`);
  }

  return {
    id: "procedure",
    label: "Procedure",
    state: "ready",
    summary: "Procedure guidance is attached.",
    details,
  };
};

const buildScheduleSection = (order: WorkOrder): ReadinessSection => {
  const startDate = parseDate(order?.start_date);
  const dueDate = parseDate(order?.end_date);
  const estimatedTime = Number(order?.estimated_time || 0);
  const today = getStartOfToday();
  const status = String(order?.status || "").trim();

  if (status === "Waiting-on-Permit") {
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: "Work order is waiting on permit clearance.",
      details: [order?.block_reason || "Permit approval is required before execution can begin."],
    };
  }

  if (status === "Blocked" || status === "On-Hold") {
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: status === "On-Hold" ? "Work order is currently on hold." : "Work order is blocked from execution.",
      details: [order?.block_reason || "Resolve the execution blocker before continuing this work."],
    };
  }

  if (!startDate && !dueDate) {
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: "Start and due dates are both missing.",
      details: ["Add a planned window so the work can be dispatched."],
    };
  }

  if (!startDate || !dueDate) {
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: "Schedule window is incomplete.",
      details: [!startDate ? "Start date is missing." : "Due date is missing."],
    };
  }

  if (dueDate < startDate) {
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: "Due date is earlier than the planned start date.",
      details: ["Fix the schedule window before releasing this work order."],
    };
  }

  if (dueDate < today && status !== "Completed") {
    const overdueDays = Math.max(1, Math.ceil((today.getTime() - dueDate.getTime()) / 86400000));
    return {
      id: "schedule",
      label: "Schedule",
      state: "blocked",
      summary: `Work order is overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}.`,
      details: ["Reschedule or escalate before execution continues."],
    };
  }

  const details: string[] = [`Planned for ${startDate.toLocaleDateString()} to ${dueDate.toLocaleDateString()}.`];
  if (!(estimatedTime > 0)) {
    details.push("Estimated labor time is still missing.");
    return {
      id: "schedule",
      label: "Schedule",
      state: "attention",
      summary: "Schedule window exists, but effort estimate is missing.",
      details,
    };
  }

  details.push(`Estimated labor: ${estimatedTime} hour${estimatedTime === 1 ? "" : "s"}.`);
  return {
    id: "schedule",
    label: "Schedule",
    state: "ready",
    summary: "Schedule window is defined.",
    details,
  };
};

const getOverallState = (sections: ReadinessSection[]): ReadinessState => {
  if (sections.some((section) => section.state === "blocked")) {
    return "blocked";
  }
  if (sections.some((section) => section.state === "attention")) {
    return "attention";
  }
  return "ready";
};

const getScore = (sections: ReadinessSection[]): number =>
  sections.reduce((score, section) => {
    if (section.state === "ready") return score + 25;
    if (section.state === "attention") return score + 15;
    return score;
  }, 0);

const getSummary = (state: ReadinessState, executionReady: boolean, sections: ReadinessSection[]): string => {
  const blockedSections = sections.filter((section) => section.state === "blocked");
  const attentionSections = sections.filter((section) => section.state === "attention");

  if (state === "blocked") {
    return `${blockedSections.length} blocker${blockedSections.length === 1 ? "" : "s"} must be resolved before execution.`;
  }
  if (executionReady && attentionSections.length > 0) {
    return `Ready to start, with ${attentionSections.length} item${attentionSections.length === 1 ? "" : "s"} to review.`;
  }
  if (state === "attention") {
    return `${attentionSections.length} item${attentionSections.length === 1 ? "" : "s"} needs planner attention.`;
  }
  return "All readiness checks look good.";
};

export function evaluateWorkOrderReadiness(order: WorkOrder | any): WorkOrderReadinessModel {
  const sections = [
    buildAssigneeSection(order),
    buildPartsSection(order),
    buildProcedureSection(order),
    buildScheduleSection(order),
  ];

  const sectionMap = sections.reduce((map, section) => {
    map[section.id] = section;
    return map;
  }, {} as Record<ReadinessSectionId, ReadinessSection>);

  const state = getOverallState(sections);
  const scheduleBlocked = sectionMap.schedule?.state === "blocked";
  const procedureBlocked = sectionMap.procedure?.state === "blocked";
  const assigneeReady = sectionMap.assignee?.state === "ready";
  const partsNotBlocked = sectionMap.parts?.state !== "blocked";
  const statusBlocked = isBlockedLikeStatus(String(order?.status || "").trim());
  const isOverdue = sectionMap.schedule?.summary?.toLowerCase().includes("overdue") || false;
  const executionReady = assigneeReady && !scheduleBlocked && !procedureBlocked && partsNotBlocked && !statusBlocked;
  const blockers = sections
    .filter((section) => section.state !== "ready")
    .map((section) => section.summary)
    .slice(0, 4);

  return {
    state,
    score: getScore(sections),
    summary: getSummary(state, executionReady, sections),
    executionReady,
    isOverdue,
    blockers,
    sections,
    sectionMap,
  };
}

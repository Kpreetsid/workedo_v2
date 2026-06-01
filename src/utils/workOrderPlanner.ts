import { evaluateWorkOrderReadiness, WorkOrderReadinessModel } from "./workOrderReadiness";

export type PlannerBucketId = "backlog" | "assigned" | "ready" | "blocked" | "overdue";
export type PlannerInsightId = "all" | "unassigned" | "dueToday" | "onHold" | "blockedByParts" | "needsEstimate" | "followUps";

export interface PlannerWorkOrderCard {
  order: any;
  bucketId: PlannerBucketId;
  blockers: string[];
  overdueDays: number;
  assigneeCount: number;
  taskSummary: string;
  readiness: WorkOrderReadinessModel;
  hierarchyBadge: { label: string; tone: "parent" | "child" } | null;
  hierarchySummary: string;
  executionOwnedByChildren: boolean;
}

export interface PlannerBucket {
  id: PlannerBucketId;
  label: string;
  description: string;
  emptyMessage: string;
  orders: PlannerWorkOrderCard[];
}

export interface PlannerInsight {
  id: PlannerInsightId;
  label: string;
  description: string;
  count: number;
}

const BUCKET_DEFINITIONS: Array<Omit<PlannerBucket, "orders">> = [
  { id: "backlog", label: "Backlog", description: "Open work waiting for assignment.", emptyMessage: "No work is waiting for assignment." },
  { id: "assigned", label: "Assigned", description: "Owners selected, but schedule details still need planning.", emptyMessage: "No assigned work is waiting for scheduling." },
  { id: "ready", label: "Ready", description: "Assigned work with enough context to start execution.", emptyMessage: "No work orders are fully ready right now." },
  { id: "blocked", label: "Blocked", description: "Missing key context or intentionally on hold.", emptyMessage: "No blocked work orders at the moment." },
  { id: "overdue", label: "Overdue", description: "Due date has already passed and work is still open.", emptyMessage: "No overdue work orders. Nice." },
];

const INSIGHT_DEFINITIONS: Array<Omit<PlannerInsight, "count">> = [
  { id: "all", label: "All Open", description: "Reset to the full open planner queue." },
  { id: "unassigned", label: "Unassigned", description: "Dispatch owners for work still sitting in backlog." },
  { id: "dueToday", label: "Due Today", description: "Watch jobs that need action before the day closes." },
  { id: "onHold", label: "On Hold", description: "Review paused jobs and decide what to unblock next." },
  { id: "blockedByParts", label: "Parts Blocked", description: "Focus on work orders stalled by parts setup issues." },
  { id: "needsEstimate", label: "Missing Estimate", description: "Fill in labor effort for scheduled work." },
  { id: "followUps", label: "Follow-Ups", description: "Track work generated from earlier jobs." },
];

const parseDate = (value: any): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStartOfToday = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getPriorityWeight = (priority: string): number => {
  switch (priority) {
    case "Urgent":
      return 4;
    case "High":
      return 3;
    case "Medium":
      return 2;
    case "Low":
      return 1;
    default:
      return 0;
  }
};

const getAssignedUserIds = (workOrder: any): string[] =>
  (workOrder?.assignedUsers || [])
    .map((user: any) => user?.userId || user?.id || user?.user?.id || user?.user?._id)
    .filter((id: any) => !!id)
    .map((id: any) => String(id));

const getHierarchyBadge = (order: any): { label: string; tone: "parent" | "child" } | null => {
  if (order?.hierarchy?.isParentWorkOrder) {
    return { label: "Parent", tone: "parent" };
  }
  if (order?.hierarchy?.isChildWorkOrder) {
    return { label: "Sub", tone: "child" };
  }
  return null;
};

const getHierarchySummary = (order: any): string => {
  const hierarchy = order?.hierarchy;
  if (hierarchy?.isParentWorkOrder) {
    return hierarchy?.childProgressLabel || `${hierarchy?.childStatusSummary?.completed || 0}/${hierarchy?.childStatusSummary?.total || 0} complete`;
  }
  if (hierarchy?.isChildWorkOrder && hierarchy?.parentReference?.order_no) {
    return `Parent ${hierarchy.parentReference.order_no}`;
  }
  return "";
};

const getTaskSummary = (order: any): string => {
  const totalTasks = Array.isArray(order?.tasks) ? order.tasks.length : 0;
  const completedTasks = (order?.tasks || []).filter((task: any) => task?.completed || String(task?.status || "").trim() === "Completed").length;
  return totalTasks ? `${completedTasks}/${totalTasks} tasks` : "No checklist";
};

const isOpenWorkOrder = (order: any): boolean => String(order?.status || "").trim() !== "Completed";

const getWorkOrderBucket = (order: any): PlannerBucketId => {
  const status = String(order?.status || "").trim();
  const readiness = evaluateWorkOrderReadiness(order);

  if (readiness.isOverdue) return "overdue";
  if (readiness.sectionMap.assignee?.state === "blocked") return "backlog";
  if (["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"].includes(status)) return "blocked";
  if (readiness.sectionMap.schedule?.state === "blocked") return "assigned";
  if (readiness.sectionMap.parts?.state === "blocked" || readiness.sectionMap.procedure?.state === "blocked") return "blocked";
  return readiness.executionReady ? "ready" : "assigned";
};

const getBlockers = (order: any, bucketId: PlannerBucketId): string[] => {
  const readiness = evaluateWorkOrderReadiness(order);
  const blockers = [...readiness.blockers];
  if (bucketId === "blocked" && String(order?.status || "").trim() === "On-Hold" && !blockers.includes("On hold")) {
    blockers.unshift("On hold");
  }
  return blockers.slice(0, 3);
};

const getOverdueDays = (order: any, bucketId: PlannerBucketId): number => {
  if (bucketId !== "overdue") return 0;
  const dueDate = parseDate(order?.end_date);
  if (!dueDate) return 0;
  const today = getStartOfToday();
  return Math.max(1, Math.ceil((today.getTime() - dueDate.getTime()) / 86400000));
};

const matchesPlannerInsight = (order: any, insightId: PlannerInsightId): boolean => {
  const readiness = evaluateWorkOrderReadiness(order);
  const dueDate = parseDate(order?.end_date);
  const today = getStartOfToday();
  const status = String(order?.status || "").trim();

  switch (insightId) {
    case "all":
      return true;
    case "unassigned":
      return getAssignedUserIds(order).length === 0;
    case "dueToday":
      return !!dueDate && isSameDay(dueDate, today);
    case "onHold":
      return ["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"].includes(status);
    case "blockedByParts":
      return status === "Waiting-on-Parts" || readiness.sectionMap.parts?.state === "blocked";
    case "needsEstimate":
      return readiness.sectionMap.schedule?.state === "attention" && !(Number(order?.estimated_time) > 0);
    case "followUps":
      return !!order?.parentId;
    default:
      return true;
  }
};

const sortOrders = (first: PlannerWorkOrderCard, second: PlannerWorkOrderCard): number => {
  const weights: Record<PlannerBucketId, number> = { overdue: 5, blocked: 4, ready: 3, assigned: 2, backlog: 1 };
  const bucketWeightDiff = weights[second.bucketId] - weights[first.bucketId];
  if (bucketWeightDiff !== 0) return bucketWeightDiff;

  const overdueDiff = second.overdueDays - first.overdueDays;
  if (overdueDiff !== 0) return overdueDiff;

  const priorityDiff = getPriorityWeight(second.order?.priority) - getPriorityWeight(first.order?.priority);
  if (priorityDiff !== 0) return priorityDiff;

  const firstDueDate = parseDate(first.order?.end_date)?.getTime() || Number.MAX_SAFE_INTEGER;
  const secondDueDate = parseDate(second.order?.end_date)?.getTime() || Number.MAX_SAFE_INTEGER;
  if (firstDueDate !== secondDueDate) return firstDueDate - secondDueDate;

  return new Date(second.order?.createdAt).getTime() - new Date(first.order?.createdAt).getTime();
};

export function buildPlannerBuckets(workOrders: any[] = []): PlannerBucket[] {
  const buckets = BUCKET_DEFINITIONS.map((definition) => ({ ...definition, orders: [] as PlannerWorkOrderCard[] }));

  (workOrders || [])
    .filter(isOpenWorkOrder)
    .map((order) => {
      const readiness = evaluateWorkOrderReadiness(order);
      const bucketId = getWorkOrderBucket(order);
      return {
        order,
        bucketId,
        blockers: getBlockers(order, bucketId),
        overdueDays: getOverdueDays(order, bucketId),
        assigneeCount: getAssignedUserIds(order).length,
        taskSummary: getTaskSummary(order),
        readiness,
        hierarchyBadge: getHierarchyBadge(order),
        hierarchySummary: getHierarchySummary(order),
        executionOwnedByChildren: Boolean(order?.hierarchy?.executionOwnedByChildren),
      };
    })
    .sort(sortOrders)
    .forEach((card) => {
      const bucket = buckets.find((item) => item.id === card.bucketId);
      bucket?.orders.push(card);
    });

  return buckets;
}

export function buildPlannerInsights(workOrders: any[] = []): PlannerInsight[] {
  const activeOrders = (workOrders || []).filter(isOpenWorkOrder);

  return INSIGHT_DEFINITIONS.map((definition) => ({
    ...definition,
    count: definition.id === "all" ? activeOrders.length : activeOrders.filter((order) => matchesPlannerInsight(order, definition.id)).length,
  }));
}

export function filterPlannerOrdersByInsight(workOrders: any[] = [], insightId: PlannerInsightId = "all"): any[] {
  const activeOrders = (workOrders || []).filter(isOpenWorkOrder);
  if (insightId === "all") {
    return activeOrders;
  }
  return activeOrders.filter((order) => matchesPlannerInsight(order, insightId));
}

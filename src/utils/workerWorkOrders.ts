import { WorkOrder } from "../types/workOrder";

export type WorkerQueueFilterId = "assigned" | "dueToday" | "inProgress" | "blockedWaiting" | "allOpen";

export interface WorkerQueueFilterDefinition {
  id: WorkerQueueFilterId;
  label: string;
  helper: string;
}

export interface WorkerQueueCounts {
  assigned: number;
  dueToday: number;
  inProgress: number;
  blockedWaiting: number;
  allOpen: number;
}

const BLOCKED_WAITING_STATUSES = ["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"];

const ACTIVE_STATUSES = [
  "Open",
  "Pending",
  "Blocked",
  "Waiting-on-Parts",
  "Waiting-on-Permit",
  "On-Hold",
  "In-Progress",
];

export const WORKER_QUEUE_FILTERS: WorkerQueueFilterDefinition[] = [
  { id: "assigned", label: "Assigned", helper: "Your active work orders" },
  { id: "dueToday", label: "Due Today", helper: "Jobs needing action today" },
  { id: "inProgress", label: "In Progress", helper: "Execution already started" },
  { id: "blockedWaiting", label: "Blocked/Waiting", helper: "Needs unblock or follow-up" },
  { id: "allOpen", label: "All Open", helper: "Every open work order in mobile" },
];

const normalizeStatus = (value?: string | null) => String(value || "").trim().toLowerCase();

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const getUserReferenceIds = (user?: any): string[] =>
  [user?.id, user?._id, user?.userId, user?.user_id]
    .filter(Boolean)
    .map((value) => String(value));

export const getAssignedUserReferenceIds = (workOrder?: WorkOrder | any): string[] =>
  (Array.isArray(workOrder?.assignedUsers) ? workOrder.assignedUsers : [])
    .map((entry: any) => entry?.userId || entry?.id || entry?.user?.id || entry?.user?._id)
    .filter(Boolean)
    .map((value: any) => String(value));

export const isCreatedByUser = (workOrder: WorkOrder | any, user?: any) => {
  const userIds = getUserReferenceIds(user);
  if (!userIds.length) return false;

  const creatorIds = [
    workOrder?.createdBy?.id,
    workOrder?.createdBy?._id,
    workOrder?.createdBy?.userId,
    workOrder?.reporter?.id,
    workOrder?.reporter?._id,
    workOrder?.reporter?.userId,
  ]
    .filter(Boolean)
    .map((value) => String(value));

  return userIds.some((userId) => creatorIds.includes(userId));
};

export const isAssignedToUser = (workOrder: WorkOrder, user?: any) => {
  const userIds = getUserReferenceIds(user);
  if (!userIds.length) return false;
  const assignedIds = getAssignedUserReferenceIds(workOrder);
  return userIds.some((userId) => assignedIds.includes(userId));
};

export const isBlockedWaitingWorkOrder = (workOrder: WorkOrder) =>
  BLOCKED_WAITING_STATUSES.some((status) => normalizeStatus(status) === normalizeStatus(workOrder?.status));

export const isActiveWorkOrder = (workOrder: WorkOrder) =>
  ACTIVE_STATUSES.some((status) => normalizeStatus(status) === normalizeStatus(workOrder?.status));

export const isDueTodayWorkOrder = (workOrder: WorkOrder) => {
  const dueDate = parseDate(workOrder?.end_date);
  if (!dueDate) return false;
  const today = new Date();
  return isSameDay(dueDate, today);
};

export const isOverdueWorkOrder = (workOrder: WorkOrder) => {
  const dueDate = parseDate(workOrder?.end_date);
  if (!dueDate) return false;
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dueDate < startOfToday;
};

export const matchesWorkerQueueFilter = (workOrder: WorkOrder, filterId: WorkerQueueFilterId, user?: any) => {
  switch (filterId) {
    case "assigned":
      return isAssignedToUser(workOrder, user);
    case "dueToday":
      return isAssignedToUser(workOrder, user) && isDueTodayWorkOrder(workOrder);
    case "inProgress":
      return isAssignedToUser(workOrder, user) && normalizeStatus(workOrder?.status) === normalizeStatus("In-Progress");
    case "blockedWaiting":
      return isAssignedToUser(workOrder, user) && isBlockedWaitingWorkOrder(workOrder);
    case "allOpen":
    default:
      return isActiveWorkOrder(workOrder);
  }
};

export const buildWorkerQueueCounts = (workOrders: WorkOrder[] = [], user?: any): WorkerQueueCounts => ({
  assigned: workOrders.filter((workOrder) => matchesWorkerQueueFilter(workOrder, "assigned", user)).length,
  dueToday: workOrders.filter((workOrder) => matchesWorkerQueueFilter(workOrder, "dueToday", user)).length,
  inProgress: workOrders.filter((workOrder) => matchesWorkerQueueFilter(workOrder, "inProgress", user)).length,
  blockedWaiting: workOrders.filter((workOrder) => matchesWorkerQueueFilter(workOrder, "blockedWaiting", user)).length,
  allOpen: workOrders.filter((workOrder) => matchesWorkerQueueFilter(workOrder, "allOpen", user)).length,
});

const getSearchHaystack = (workOrder: WorkOrder) => {
  const assetName = workOrder?.asset?.asset_name || "";
  const locationName = workOrder?.location?.location_name || "";
  const assigneeNames = (Array.isArray(workOrder?.assignedUsers) ? workOrder.assignedUsers : [])
    .map((entry: any) => [entry?.user?.firstName, entry?.user?.lastName].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" ");

  return [
    workOrder?.order_no,
    workOrder?.title,
    workOrder?.description,
    workOrder?.priority,
    workOrder?.status,
    assetName,
    locationName,
    assigneeNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const filterWorkerQueueOrders = (
  workOrders: WorkOrder[] = [],
  filterId: WorkerQueueFilterId,
  user?: any,
  searchText?: string
) => {
  const normalizedSearch = String(searchText || "").trim().toLowerCase();

  return workOrders
    .filter((workOrder) => isActiveWorkOrder(workOrder))
    .filter((workOrder) => matchesWorkerQueueFilter(workOrder, filterId, user))
    .filter((workOrder) => {
      if (!normalizedSearch) return true;
      return getSearchHaystack(workOrder).includes(normalizedSearch);
    })
    .sort(
      (first, second) =>
        new Date(second?.createdAt || 0).getTime() - new Date(first?.createdAt || 0).getTime()
    );
};

export const ALL_WORK_ORDER_STATUSES = [
  "Open",
  "Pending",
  "Blocked",
  "Waiting-on-Parts",
  "Waiting-on-Permit",
  "On-Hold",
  "In-Progress",
  "Approved",
  "Rejected",
  "Completed",
] as const;

export const ACTIVE_WORK_ORDER_STATUSES = [
  "Open",
  "Pending",
  "Blocked",
  "Waiting-on-Parts",
  "Waiting-on-Permit",
  "On-Hold",
  "In-Progress",
] as const;

export const CLOSED_WORK_ORDER_STATUSES = ["Approved", "Rejected", "Completed"] as const;

export const BLOCKED_FAMILY_STATUSES = ["Blocked", "Waiting-on-Parts", "Waiting-on-Permit", "On-Hold"] as const;

export const BLOCK_REASON_REQUIRED_STATUSES = ["Blocked", "Waiting-on-Parts", "Waiting-on-Permit"] as const;

export const normalizeWorkOrderStatus = (value?: string | null) =>
  String(value || "").trim().toLowerCase().replace(/[-\s]/g, "");

export const formatWorkOrderStatusLabel = (status?: string | null) =>
  String(status || "Open").trim().replace(/-/g, " ");

export const isClosedWorkOrderStatus = (status?: string | null) =>
  CLOSED_WORK_ORDER_STATUSES.some((item) => normalizeWorkOrderStatus(item) === normalizeWorkOrderStatus(status));

export const requiresWorkOrderBlockReason = (status?: string | null) =>
  BLOCK_REASON_REQUIRED_STATUSES.some((item) => normalizeWorkOrderStatus(item) === normalizeWorkOrderStatus(status));

export const getWorkOrderStatusTone = (status?: string | null) => {
  switch (String(status || "").trim()) {
    case "Completed":
      return { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" };
    case "Approved":
      return { bg: "#E0F2FE", text: "#075985", border: "#7DD3FC" };
    case "Rejected":
      return { bg: "#FEE2E2", text: "#B91C1C", border: "#FCA5A5" };
    case "In-Progress":
      return { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD" };
    case "On-Hold":
      return { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" };
    case "Waiting-on-Parts":
      return { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" };
    case "Waiting-on-Permit":
      return { bg: "#ECFEFF", text: "#0F766E", border: "#67E8F9" };
    case "Blocked":
      return { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" };
    case "Pending":
      return { bg: "#F3E8FF", text: "#7E22CE", border: "#D8B4FE" };
    case "Open":
    default:
      return { bg: "#F8FAFC", text: "#334155", border: "#CBD5E1" };
  }
};

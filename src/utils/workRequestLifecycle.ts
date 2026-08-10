import { WorkRequest } from "../types/workRequest";

export type WorkRequestStage = "open" | "approved" | "rejected" | "converted";
export type WorkRequestGovernanceState =
  | "healthy"
  | "due-soon"
  | "breached"
  | "rejected"
  | "converted"
  | "pending";

const normalizeStatus = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "");

const normalizeRole = (value?: string | null) => String(value || "").trim().toLowerCase();

const decodeHtmlEntity = (entity: string, code?: string, hexCode?: string) => {
  const namedEntities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  if (code || hexCode) {
    const value = Number.parseInt(code ?? hexCode ?? "", hexCode ? 16 : 10);
    return Number.isFinite(value) && value >= 0 && value <= 0x10ffff
      ? String.fromCodePoint(value)
      : entity;
  }

  return namedEntities[entity.slice(1, -1).toLowerCase()] ?? entity;
};

export const formatWorkRequestDescription = (value?: string | null) =>
  String(value || "")
    .replace(/&(?:#(\d+)|#x([\da-f]+)|amp|apos|gt|lt|nbsp|quot);/gi, decodeHtmlEntity)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(?:p|div|li|h[1-6]|tr|blockquote|ul|ol)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

export const getRequestLinkedWorkOrder = (request?: WorkRequest | null) => {
  if (!request) return null;
  return request.converted_work_order_id || null;
};

export const getWorkRequestStage = (request?: WorkRequest | null): WorkRequestStage => {
  if (!request) return "open";
  if (getRequestLinkedWorkOrder(request) || request.converted_order_no) {
    return "converted";
  }

  const status = normalizeStatus(request.status);
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "open";
};

export const canApproveRequest = (request?: WorkRequest | null, userRole?: string | null) =>
  getWorkRequestStage(request) === "open" && normalizeRole(userRole) === "admin";

export const canRejectRequest = (request?: WorkRequest | null, userRole?: string | null) =>
  getWorkRequestStage(request) === "open" && normalizeRole(userRole) === "admin";

export const canCreateWorkOrderFromRequest = (request?: WorkRequest | null, userRole?: string | null) =>
  getWorkRequestStage(request) === "approved" && normalizeRole(userRole) === "admin";

export const canEditRequest = (request?: WorkRequest | null) => getWorkRequestStage(request) === "open";

export const canDeleteRequest = (request?: WorkRequest | null) => getWorkRequestStage(request) === "open";

export const getWorkRequestGovernanceState = (
  request?: WorkRequest | null
): WorkRequestGovernanceState => {
  const stage = getWorkRequestStage(request);
  if (stage === "converted") return "converted";
  if (stage === "rejected") return "rejected";

  const dueAt = stage === "approved" ? request?.order_due_at : request?.review_due_at;
  if (!dueAt) return "pending";

  const dueDate = new Date(dueAt).getTime();
  if (Number.isNaN(dueDate)) return "pending";

  const diffMs = dueDate - Date.now();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffMs < 0) return "breached";
  if (diffHours <= 6) return "due-soon";
  return "healthy";
};

export const getWorkRequestGovernanceLabel = (request?: WorkRequest | null) => {
  const stage = getWorkRequestStage(request);
  if (stage === "converted") {
    return request?.converted_order_no || request?.converted_work_order_id?.order_no
      ? `Converted to ${request.converted_order_no || request.converted_work_order_id?.order_no}`
      : "Converted to work order";
  }

  if (stage === "rejected") {
    return request?.remarks ? `Rejected: ${request.remarks}` : "Rejected";
  }

  const dueAt = stage === "approved" ? request?.order_due_at : request?.review_due_at;
  if (!dueAt) {
    return stage === "approved" ? "Awaiting work order conversion" : "Awaiting review";
  }

  const dueText = formatRequestDateTime(dueAt);
  if (getWorkRequestGovernanceState(request) === "breached") {
    return stage === "approved" ? "Work order conversion overdue" : "Review overdue";
  }

  return stage === "approved" ? `Order due ${dueText}` : `Review due ${dueText}`;
};

export const formatRequestDateTime = (value?: string | null) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRequestUserLabel = (user?: WorkRequest["createdBy"] | any) => {
  if (!user) return "N/A";
  if (typeof user === "string") return user;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.username || user.email || "N/A";
};

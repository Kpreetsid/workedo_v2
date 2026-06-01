import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { WorkOrderActivityRecord } from "../types/workOrderActivity";
import { WorkOrderHistorySnapshot } from "../types/workOrder";

export type WorkOrderActivityFilterId =
  | "all"
  | "general"
  | "status"
  | "assignees"
  | "parts"
  | "procedures"
  | "execution"
  | "tasks"
  | "files"
  | "comments"
  | "children";

export const WORK_ORDER_ACTIVITY_FILTERS: Array<{ id: WorkOrderActivityFilterId; label: string; actions?: string[] }> = [
  { id: "all", label: "All" },
  { id: "general", label: "General", actions: ["created", "updated", "deleted"] },
  { id: "status", label: "Status", actions: ["status-changed"] },
  { id: "assignees", label: "Assignees", actions: ["assignees-updated"] },
  { id: "parts", label: "Parts", actions: ["parts-updated"] },
  { id: "procedures", label: "Procedures", actions: ["procedures-updated", "sop-submitted"] },
  { id: "execution", label: "Execution", actions: ["execution-updated"] },
  { id: "tasks", label: "Tasks", actions: ["tasks-updated"] },
  { id: "files", label: "Files", actions: ["attachments-added"] },
  { id: "comments", label: "Comments", actions: ["comment-added", "comment-updated", "comment-deleted"] },
  { id: "children", label: "Child WOs", actions: ["child-created"] },
];

export function getWorkOrderActivityLabel(actionType: string): string {
  const labels: Record<string, string> = {
    created: "Work Order Created",
    updated: "Details Updated",
    "status-changed": "Status Changed",
    "assignees-updated": "Assignees Updated",
    "parts-updated": "Parts Updated",
    "procedures-updated": "Procedures Updated",
    "execution-updated": "Execution Updated",
    "tasks-updated": "Tasks Updated",
    "attachments-added": "Attachments Added",
    "sop-submitted": "SOP / Checklist Updated",
    "comment-added": "Comment Added",
    "comment-updated": "Comment Updated",
    "comment-deleted": "Comment Deleted",
    "child-created": "Child Work Order Created",
    deleted: "Work Order Deleted",
  };

  return labels[String(actionType || "").trim()] || "Activity";
}

export function getWorkOrderActivityIcon(actionType: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    created: "add-circle-outline",
    updated: "create-outline",
    "status-changed": "sync-outline",
    "assignees-updated": "people-outline",
    "parts-updated": "cube-outline",
    "procedures-updated": "checkmark-done-outline",
    "execution-updated": "time-outline",
    "tasks-updated": "list-outline",
    "attachments-added": "attach-outline",
    "sop-submitted": "document-text-outline",
    "comment-added": "chatbubble-outline",
    "comment-updated": "chatbox-ellipses-outline",
    "comment-deleted": "trash-outline",
    "child-created": "git-branch-outline",
    deleted: "close-circle-outline",
  };

  return icons[String(actionType || "").trim()] || "time-outline";
}

export function getWorkOrderActivityTone(actionType: string) {
  const normalized = String(actionType || "").trim();
  switch (normalized) {
    case "created":
    case "child-created":
      return { bg: "#F6FFED", border: "#B7EB8F", text: "#135200", icon: "#389E0D" };
    case "status-changed":
    case "execution-updated":
    case "sop-submitted":
      return { bg: "#E6F4FF", border: "#91CAFF", text: "#003A8C", icon: "#1677FF" };
    case "parts-updated":
      return { bg: "#FFF7E6", border: "#FFD591", text: "#873800", icon: "#FA8C16" };
    case "comment-deleted":
    case "deleted":
      return { bg: "#FFF1F0", border: "#FFA39E", text: "#A8071A", icon: "#F5222D" };
    default:
      return { bg: "#F5F7FA", border: "#D9E2EC", text: "#3D4A5C", icon: "#64748B" };
  }
}

export function getWorkOrderActivityDetails(entry: WorkOrderActivityRecord): string[] {
  const metadata = entry?.metadata || {};
  const details: string[] = [];
  const actionType = String(entry?.action_type || "").trim();

  if (Array.isArray(metadata?.changed_fields) && metadata.changed_fields.length) {
    details.push(`Changed: ${metadata.changed_fields.join(", ")}`);
  }

  if (metadata?.from_status || metadata?.to_status) {
    details.push(`Status: ${metadata.from_status || "-"} -> ${metadata.to_status || "-"}`);
  }

  if (Array.isArray(metadata?.added_ids) && metadata.added_ids.length) {
    details.push(`${metadata.added_ids.length} assignee(s) added`);
  }

  if (Array.isArray(metadata?.removed_ids) && metadata.removed_ids.length) {
    details.push(`${metadata.removed_ids.length} assignee(s) removed`);
  }

  if (metadata?.before?.lineCount !== undefined || metadata?.after?.lineCount !== undefined) {
    details.push(`Part lines: ${metadata?.before?.lineCount ?? 0} -> ${metadata?.after?.lineCount ?? 0}`);
  }

  if (metadata?.before?.plannedQuantity !== undefined || metadata?.after?.plannedQuantity !== undefined) {
    details.push(`Planned qty: ${metadata?.before?.plannedQuantity ?? 0} -> ${metadata?.after?.plannedQuantity ?? 0}`);
  }

  if (metadata?.before?.submitted !== undefined || metadata?.after?.submitted !== undefined) {
    details.push(`Procedures submitted: ${metadata?.after?.submitted ?? 0}/${metadata?.after?.total ?? 0}`);
  }

  if (metadata?.before?.laborCount !== undefined || metadata?.after?.laborCount !== undefined) {
    details.push(`Labor entries: ${metadata?.before?.laborCount ?? 0} -> ${metadata?.after?.laborCount ?? 0}`);
  }

  if (metadata?.before?.actualTime !== undefined || metadata?.after?.actualTime !== undefined) {
    details.push(`Actual time: ${metadata?.before?.actualTime ?? 0}h -> ${metadata?.after?.actualTime ?? 0}h`);
  }

  if (metadata?.before?.completed !== undefined || metadata?.after?.completed !== undefined) {
    details.push(`Tasks completed: ${metadata?.after?.completed ?? 0}/${metadata?.after?.total ?? 0}`);
  }

  if (metadata?.count) {
    details.push(`Count: ${metadata.count}`);
  }

  if (Array.isArray(metadata?.file_names) && metadata.file_names.length) {
    details.push(`Files: ${metadata.file_names.join(", ")}`);
  }

  if (metadata?.preview && ["comment-added", "comment-updated", "comment-deleted"].includes(actionType)) {
    details.push(`Comment: ${metadata.preview}`);
  }

  if (metadata?.child_order_no) {
    details.push(`Child WO: ${metadata.child_order_no}`);
  }

  return details.filter((detail) => !!String(detail || "").trim());
}

export function matchesWorkOrderActivityFilter(entry: WorkOrderActivityRecord, filterId: WorkOrderActivityFilterId): boolean {
  if (filterId === "all") {
    return true;
  }

  const filter = WORK_ORDER_ACTIVITY_FILTERS.find((item) => item.id === filterId);
  if (!filter?.actions?.length) {
    return true;
  }

  return filter.actions.includes(String(entry?.action_type || "").trim());
}

export function getWorkOrderSnapshotSummary(snapshot: WorkOrderHistorySnapshot) {
  const parts = Array.isArray(snapshot?.parts) ? snapshot.parts : [];
  const tasks = Array.isArray(snapshot?.tasks) ? snapshot.tasks : [];
  const procedures = Array.isArray(snapshot?.procedure_entries) ? snapshot.procedure_entries : [];
  const laborEntries = Array.isArray(snapshot?.labor_entries) ? snapshot.labor_entries : [];

  const plannedQuantity = parts.reduce((total: number, part: any) => total + Number(part?.estimatedQuantity || part?.plannedQuantity || 0), 0);
  const actualQuantity = parts.reduce((total: number, part: any) => total + Number(part?.actualQuantity || 0), 0);
  const completedTasks = tasks.filter((task: any) => task?.completed || String(task?.status || "").trim() === "Completed").length;
  const submittedProcedures = procedures.filter((entry: any) => Boolean(entry?.submitted)).length;
  const laborHours = laborEntries.reduce((total: number, entry: any) => total + Number(entry?.hours || 0), 0);

  return {
    partLines: parts.length,
    plannedQuantity,
    actualQuantity,
    taskCount: tasks.length,
    completedTasks,
    procedureCount: procedures.length,
    submittedProcedures,
    laborCount: laborEntries.length,
    laborHours,
  };
}

export function getWorkOrderSnapshotDetails(snapshot: WorkOrderHistorySnapshot): string[] {
  const details: string[] = [];
  const interestingFields: Array<["status" | "priority" | "type" | "nature_of_work" | "estimated_time" | "actual_time" | "end_date", string]> = [
    ["status", "Status"],
    ["priority", "Priority"],
    ["type", "Type"],
    ["nature_of_work", "Nature"],
    ["estimated_time", "Est. hours"],
    ["actual_time", "Actual hours"],
    ["end_date", "Due date"],
  ];

  interestingFields.forEach(([field, label]) => {
    const value = snapshot?.[field];
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (field === "end_date") {
      const dueDateValue = String(value);
      details.push(`${label}: ${moment(dueDateValue).isValid() ? moment(dueDateValue).format("DD MMM YYYY") : dueDateValue}`);
      return;
    }

    details.push(`${label}: ${value}`);
  });

  if (snapshot?.work_request_id) {
    details.push("Linked request retained");
  }

  if (snapshot?.parentId) {
    details.push("Linked to parent work order");
  }

  return details;
}

export function getWorkOrderSnapshotActor(snapshot: WorkOrderHistorySnapshot): string {
  if (snapshot?.updatedBy && typeof snapshot.updatedBy === "object") {
    const firstName = String((snapshot.updatedBy as any)?.firstName || "").trim();
    const lastName = String((snapshot.updatedBy as any)?.lastName || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
  }

  if (snapshot?.history_created_by && typeof snapshot.history_created_by === "object") {
    const firstName = String((snapshot.history_created_by as any)?.firstName || "").trim();
    const lastName = String((snapshot.history_created_by as any)?.lastName || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      return fullName;
    }
  }

  return "System";
}

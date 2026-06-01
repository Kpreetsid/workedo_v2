import { Part, PartHistoryRecord } from "../types/part";

export type PartStockState = "out" | "low" | "healthy";
export type PartHistoryFilterId = "all" | "stock" | "transfers" | "cycleCount" | "setup";

const STOCK_ACTIONS = ["stock-added", "stock-removed", "stock-set"];
const TRANSFER_ACTIONS = ["transfer-out", "transfer-in"];
const CYCLE_COUNT_ACTIONS = ["cycle-count-submitted", "cycle-count-approved", "cycle-count-rejected"];
const SETUP_ACTIONS = ["created", "updated"];

export const PART_HISTORY_FILTERS: Array<{ id: PartHistoryFilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "stock", label: "Stock" },
  { id: "transfers", label: "Transfers" },
  { id: "cycleCount", label: "Cycle Count" },
  { id: "setup", label: "Setup" },
];

export function getPartNetworkQuantity(part?: Part | null): number {
  if (Number.isFinite(Number(part?.network_on_hand))) {
    return Number(part?.network_on_hand || 0);
  }

  const locations = Array.isArray(part?.stock_locations) ? part.stock_locations : [];
  if (locations.length > 0) {
    return locations.reduce((total, entry) => total + Number(entry?.quantity || 0), 0);
  }

  return Number(part?.quantity || 0);
}

export function getPartLocationCount(part?: Part | null): number {
  if (Number.isFinite(Number(part?.network_location_count))) {
    return Number(part?.network_location_count || 0);
  }

  const locations = Array.isArray(part?.stock_locations) ? part.stock_locations : [];
  return locations.length || (part ? 1 : 0);
}

export function getPartAlternativeLocationCount(part?: Part | null): number {
  return Array.isArray(part?.alternative_locations) ? part.alternative_locations.length : 0;
}

export function getPartPreferredStockSource(part?: Part | null) {
  if (part?.preferred_stock_source) {
    return part.preferred_stock_source;
  }

  const alternatives = Array.isArray(part?.alternative_locations) ? part.alternative_locations : [];
  return alternatives.find((entry) => Number(entry?.available_for_transfer || 0) > 0) || alternatives[0] || null;
}

export function getPartStockState(part?: Pick<Part, "quantity" | "min_quantity"> | null): PartStockState {
  const quantity = Number(part?.quantity || 0);
  const minQuantity = Number(part?.min_quantity || 0);

  if (quantity <= 0) {
    return "out";
  }

  if (quantity <= minQuantity) {
    return "low";
  }

  return "healthy";
}

export function getPartStockStateLabel(part?: Pick<Part, "quantity" | "min_quantity"> | null): string {
  const state = getPartStockState(part);
  if (state === "out") return "Out of Stock";
  if (state === "low") return "Low Stock";
  return "In Stock";
}

export function getPartHistoryActionLabel(actionType?: string): string {
  const labels: Record<string, string> = {
    created: "Part created",
    updated: "Part updated",
    "stock-added": "Stock added",
    "stock-removed": "Stock removed",
    "stock-set": "Stock set",
    "transfer-out": "Transferred out",
    "transfer-in": "Transferred in",
    "cycle-count-submitted": "Cycle count submitted",
    "cycle-count-approved": "Cycle count approved",
    "cycle-count-rejected": "Cycle count rejected",
  };

  return labels[String(actionType || "").trim()] || "Activity";
}

export function matchesPartHistoryFilter(entry: PartHistoryRecord, filterId: PartHistoryFilterId): boolean {
  if (filterId === "all") {
    return true;
  }

  const actionType = String(entry?.action_type || "").trim();

  if (filterId === "stock") {
    return STOCK_ACTIONS.includes(actionType);
  }

  if (filterId === "transfers") {
    return TRANSFER_ACTIONS.includes(actionType);
  }

  if (filterId === "cycleCount") {
    return CYCLE_COUNT_ACTIONS.includes(actionType);
  }

  if (filterId === "setup") {
    return SETUP_ACTIONS.includes(actionType);
  }

  return true;
}

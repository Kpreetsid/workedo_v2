import { ProcedureTemplate } from "../types/procedure";
import { Part } from "../types/part";

export interface WorkOrderPartDraft {
  id?: string;
  _id?: string;
  part_id?: string;
  part_name: string;
  part_number?: string;
  barcode?: string;
  part_type?: string;
  unit?: string;
  cost?: number;
  currency?: string;
  estimatedQuantity?: number;
  actualQuantity?: number | null;
  plannedQuantity?: number;
  procedureLinked?: boolean;
  procedureNames?: string[];
  manualQuantity?: number;
  procedureQuantity?: number;
}

export interface PartShortage {
  part_id: string;
  part_name: string;
  requiredQuantity: number;
  availableQuantity: number;
  procedureNames: string[];
}

const resolvePartKey = (part: any): string =>
  String(part?.part_id || part?.id || part?._id || part?.part_number || part?.part_name || "").trim();

const toQuantity = (value: any): number => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
};

export const buildProcedureLinkedParts = (procedures: ProcedureTemplate[] = []): WorkOrderPartDraft[] => {
  const procedureParts = new Map<string, WorkOrderPartDraft>();

  (procedures || []).forEach((procedure) => {
    (procedure?.required_parts || []).forEach((requiredPart) => {
      const key = resolvePartKey(requiredPart);
      const quantity = toQuantity(requiredPart?.quantity);

      if (!key || !quantity) {
        return;
      }

      const existing = procedureParts.get(key);
      if (existing) {
        existing.procedureQuantity = toQuantity(existing.procedureQuantity) + quantity;
        existing.estimatedQuantity = toQuantity(existing.estimatedQuantity) + quantity;
        existing.plannedQuantity = toQuantity(existing.plannedQuantity) + quantity;
        existing.procedureNames = Array.from(
          new Set([...(existing.procedureNames || []), procedure?.name].filter(Boolean))
        );
        procedureParts.set(key, existing);
        return;
      }

      procedureParts.set(key, {
        part_id: String(requiredPart?.part_id || "").trim(),
        part_name: requiredPart?.part_name || "Unnamed Part",
        part_number: requiredPart?.part_number || "",
        barcode: requiredPart?.barcode || "",
        part_type: "Procedure",
        unit: requiredPart?.unit || "",
        cost: Number(requiredPart?.inventory?.cost || 0),
        currency: "INR",
        estimatedQuantity: quantity,
        plannedQuantity: quantity,
        actualQuantity: null,
        procedureLinked: true,
        procedureQuantity: quantity,
        manualQuantity: 0,
        procedureNames: procedure?.name ? [procedure.name] : [],
      });
    });
  });

  return Array.from(procedureParts.values());
};

export const buildResolvedWorkOrderParts = (
  manualParts: WorkOrderPartDraft[] = [],
  selectedProcedures: ProcedureTemplate[] = []
): WorkOrderPartDraft[] => {
  const combinedParts = new Map<string, WorkOrderPartDraft>();

  (manualParts || []).forEach((part) => {
    const key = resolvePartKey(part);
    const manualQuantity = toQuantity(part?.estimatedQuantity ?? part?.plannedQuantity);

    if (!key || !manualQuantity) {
      return;
    }

    combinedParts.set(key, {
      ...part,
      part_id: String(part?.part_id || part?.id || part?._id || "").trim(),
      estimatedQuantity: manualQuantity,
      plannedQuantity: manualQuantity,
      actualQuantity: part?.actualQuantity ?? null,
      manualQuantity,
      procedureQuantity: 0,
      procedureLinked: false,
      procedureNames: Array.isArray(part?.procedureNames) ? [...part.procedureNames] : [],
    });
  });

  buildProcedureLinkedParts(selectedProcedures).forEach((procedurePart) => {
    const key = resolvePartKey(procedurePart);
    const procedureQuantity = toQuantity(procedurePart?.estimatedQuantity);

    if (!key || !procedureQuantity) {
      return;
    }

    const existing = combinedParts.get(key);
    if (existing) {
      const totalQuantity = toQuantity(existing.manualQuantity) + toQuantity(existing.procedureQuantity) + procedureQuantity;
      combinedParts.set(key, {
        ...existing,
        estimatedQuantity: totalQuantity,
        plannedQuantity: totalQuantity,
        procedureLinked: true,
        procedureQuantity: toQuantity(existing.procedureQuantity) + procedureQuantity,
        procedureNames: Array.from(
          new Set([...(existing.procedureNames || []), ...(procedurePart.procedureNames || [])].filter(Boolean))
        ),
      });
      return;
    }

    combinedParts.set(key, procedurePart);
  });

  return Array.from(combinedParts.values()).filter((part) => toQuantity(part?.estimatedQuantity) > 0);
};

export const findPartShortages = (
  resolvedParts: WorkOrderPartDraft[] = [],
  availableParts: Part[] = []
): PartShortage[] => {
  const availableMap = new Map<string, Part>();

  (availableParts || []).forEach((part) => {
    const key = resolvePartKey(part);
    if (key) {
      availableMap.set(key, part);
    }
  });

  return (resolvedParts || [])
    .map((part) => {
      const key = resolvePartKey(part);
      const available = availableMap.get(key);
      return {
        part_id: String(part?.part_id || key),
        part_name: part?.part_name || "Unnamed Part",
        requiredQuantity: toQuantity(part?.estimatedQuantity),
        availableQuantity: Number(available?.quantity || 0),
        procedureNames: Array.isArray(part?.procedureNames) ? part.procedureNames : [],
      };
    })
    .filter((part) => part.availableQuantity < part.requiredQuantity);
};

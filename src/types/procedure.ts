export interface ProcedureRequiredPart {
  part_id?: string;
  part_name: string;
  part_number?: string;
  barcode?: string;
  quantity: number;
  unit?: string;
  notes?: string;
  inventory?: {
    id: string;
    quantity: number;
    min_quantity: number;
    reorder_point: number;
    location_id: string;
    cost?: number;
  } | null;
}

export interface ProcedureStepCorrectiveAction {
  id: string;
  title: string;
  description?: string;
  trigger_values?: string[];
  priority?: string;
}

export interface ProcedureTriggeredAction extends ProcedureStepCorrectiveAction {
  step_id?: string;
  step_title?: string;
}

export interface ProcedureScoreSummary {
  earned: number;
  possible: number;
  percentage?: number | null;
}

export interface ProcedureStepVisibilityCondition {
  step_id?: string;
  values?: string[];
}

export interface ProcedureStep {
  id: string;
  type: string;
  title: string;
  description?: string;
  field_type?: string;
  required?: boolean;
  options?: string[];
  scoring_enabled?: boolean;
  option_scores?: number[];
  visibility_condition?: ProcedureStepVisibilityCondition;
  corrective_actions?: ProcedureStepCorrectiveAction[];
  include_time?: boolean;
  items?: ProcedureStep[];
}

export interface ProcedureTemplate {
  _id?: string;
  id: string;
  name: string;
  category?: string;
  description?: string;
  tags?: string[];
  required_parts?: ProcedureRequiredPart[];
  steps?: ProcedureStep[];
  version?: number;
  is_latest?: boolean;
}

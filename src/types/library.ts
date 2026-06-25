import { ProcedureTemplate } from "./procedure";

export interface WorkOrderTemplate {
  _id?: string;
  id?: string;
  template_name?: string;
  title?: string;
  description?: string;
  estimated_time?: number | null;
  priority?: string;
  nature_of_work?: string;
  maintenance_type?: string;
  status?: string;
  is_active?: boolean;
  procedure_ids?: string[];
  procedures?: ProcedureTemplate[];
  assignees?: Array<Record<string, any>>;
  locations?: Array<Record<string, any>>;
  assets?: Array<Record<string, any>>;
  parts?: Array<Record<string, any>>;
  field_rules?: Record<string, { hidden?: boolean; required?: boolean; read_only?: boolean }>;
  due_date_settings?: {
    due_after_value?: number | null;
    due_after_unit?: string | null;
    start_before_value?: number | null;
    start_before_unit?: string | null;
    recurrence_value?: number | null;
    recurrence_unit?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

import { SopForm } from "./sop";

export interface InspectionUser {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export interface InspectionAssignedUser {
  assignedUser?: InspectionUser;
  user?: InspectionUser;
}

export interface InspectionLocation {
  id?: string;
  _id?: string;
  location_name?: string;
  location_type?: string;
}

export interface InspectionAsset {
  id?: string;
  _id?: string;
  asset_name?: string;
  asset_type?: string;
  asset_model?: string;
}

export interface Inspection {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  start_date?: string;
  form_id?: SopForm | string;
  inspection_report?: Record<string, any>;
  location_id?: InspectionLocation | string;
  asset_id?: InspectionAsset | string;
  assignedUsers?: InspectionAssignedUser[];
  status?: string;
  month?: string;
  createdFrom?: string;
  no_of_actions?: number;
  createdBy?: InspectionUser;
  updatedBy?: InspectionUser;
  createdAt?: string;
  updatedAt?: string;
}

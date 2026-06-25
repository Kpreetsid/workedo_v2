export interface SopCategory {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
}

export interface SopLocation {
  id?: string;
  _id?: string;
  location_name?: string;
  name?: string;
  location_type?: string;
}

export interface SopFormComponent {
  key?: string;
  label?: string;
  type?: string;
  input?: boolean;
  values?: Array<{ label?: string; value?: string }>;
  components?: SopFormComponent[];
}

export interface SopForm {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  visible?: boolean;
  categoryId?: SopCategory | string;
  locationId?: SopLocation | string;
  json_temp?: {
    components?: SopFormComponent[];
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

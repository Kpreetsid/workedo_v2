export interface LocationAsset {
  id: string;
  asset_name: string;
  asset_id: string;
  asset_type: string;
  asset_model?: string;
  asset_timezone?: string;
  asset_build_type?: string;
  specificFrequency?: any[]; // could be number[] or object[] depending on your data
  top_level?: boolean;
  locationId: {
    _id: string;
    id: string;
    location_name: string;
  };
  account_id: string;
  description?: string;
  manufacturer?: string;
  year?: string;
  assigned_to?: number | string;
  visible: boolean;
  createdBy?: string;
  top_level_asset_id?: string;
  createdAt?: string;
  updatedAt?: string;

  // optional fields from your app logic
  lastData?: string;
  status?: string;

  // additional nested list
  userList?: {
    firstName: string;
    lastName: string;
    id: string;
  }[];
}

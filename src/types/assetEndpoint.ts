export interface AssetEndpoint {
  id?: string;
  online?: string;
  is_linked?: boolean;
  composite_id: string;
  point_name: string;
  mount_location: string;
  mount_direction: string;
  asset_id: string;
  mac_id: string;
  mount_id: number;
  image: string | null;
  asset_name?: string;
  asset_type?: string;
  mount_material?: string;
  mount_type?: string;
  deviceInfo?: any;
}

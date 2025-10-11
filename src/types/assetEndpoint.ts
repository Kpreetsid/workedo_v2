export interface AssetEndpoint {
  composite_id: string;
  point_name: string;
  mount_location: string;
  mount_direction: string;
  asset_id: string;
  mac_id: string;
  mount_id: number;
  image: string | null;
  asset_name?: string;
}
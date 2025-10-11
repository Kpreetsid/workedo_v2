export interface BaseAsset {
	_id?: string; // from backend
	id: string;
	asset_name: string;
	asset_id: string;
	asset_type: string | null;
	asset_model?: string;
	visible: boolean;
	asset_build_type?: string;
	account_id: string;
	top_level?: boolean;
	top_level_asset_id?: string;
	locationId?: string;
	asset_timezone?: string;
	org_timezone?: string;
	description?: string | null;
	manufacturer?: string | null;
	year?: string | null;
	assigned_to: string | number;
	teamId?: string | null;
	userId?: string;
	userName?: string;
	asset_class?: string;
	qr_code?: string;
	childs?: AssetChild[];
	specificFrequency?: any[];
	createdBy?: string;
	createdAt?: string;
	updatedAt?: string;
	userList?: string[]; // backend sends array of string IDs
  }
  
  export interface AssetChild extends BaseAsset {
	parent_id?: string;
	parent_name?: string;
  }
  
  export interface Asset extends BaseAsset {
	image_path?: string; // optional (not always sent)
	locationData?: AssetLocation; // ✅ changed from array to single object
  }
  
  export interface AssetLocation {
	location_name: string;
	id: string;
  }
  
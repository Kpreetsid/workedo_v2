interface BaseAsset {
	asset_name: string;
	asset_id: string | null;
	equipment_id: string;
	asset_type: string | null;
	visible: boolean;
	asset_build_type?: string; // ✅ optional
	id: string;
	account_id: string;
	top_level?: boolean;
	top_level_asset_id?: string;
	locationId?: string;
	locationName?: string;
	asset_timezone?: string;
	org_timezone?: string;
	description?: string | null;
	model?: string | null;
	manufacturer?: string | null;
	year?: string | null;
	teamId?: string | null;
	assigned_to: string | number;
	userId?: string; // ✅ optional
	userName?: string; // ✅ optional
	asset_class?: string;
	qr_code?: string;
	childs?: AssetChild[]; // ✅ optional
}


interface AssetChild extends BaseAsset {
	parent_id?: string;
	parent_name?: string;
}


export interface Asset extends BaseAsset {
	image_path: string;
	locationData: AssetLocation[];
	location: AssetLocation;
}

interface AssetLocation {
	location_name: string;
	id: string;
}
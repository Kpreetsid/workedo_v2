import { create } from "zustand";

export interface CreateAssetFormData {
	title: string;
	asset_id: string;
	asset_type: string | null;
	asset_build_type?: string | null;
	timezone: string;
	timezones: any[];
    parent_location?: { id: string; location_name: string; };
    parent_asset?: { id: string; asset_name: string; };
	assigned_users: any[];
	location: any | null;
	locationObject: any | null;
	manufacturer: string | null;
	model: string;
	year: string;
	description: string;
}

interface CreateAssetStore extends CreateAssetFormData {
	setTitle: (data: string) => void;
	setAssetId: (data: string) => void;
	setAssetType: (data: string) => void;
	setAssetBuildType: (data: string) => void;
	setTimezone: (data: any) => void;
	setTimezones: (data: any[]) => void;
	setParentLocation: (data: { id: string; location_name: string }) => void;
	setParentAsset: (data: { id: string; asset_name: string }) => void;
	setAssignedUsers: (data: any[]) => void;
	setLocation: (data: any) => void;
	setLocationObject: (data: any) => void;
	setManufacturer: (data: string) => void;
	setModel: (data: string) => void;
	setYear: (data: string) => void;
	setDescription: (data: string) => void;

	/** Generic setter if you ever need it */
	setCreateAssetValue: <K extends keyof CreateAssetFormData>(
		key: K,
		value: CreateAssetFormData[K]
	) => void;

	resetForm: () => void;
}

const initialState: CreateAssetFormData = {
	title: "",
	asset_id: "",
	asset_type: "",
	asset_build_type: "",
	timezone: "",
	timezones: [],
	parent_location: undefined,
	parent_asset: undefined,
	assigned_users: [],
	location: null,
	locationObject: null,
	manufacturer: "",
	model: "",
	year: "",
	description: "",
};

export const useCreateAssetStore = create<CreateAssetStore>((set) => ({
	...initialState,

	// INDIVIDUAL SETTERS
	setTitle: (data) => set({ title: data }),
	setAssetId: (data) => set({ asset_id: data }),
	setAssetType: (data) => set({ asset_type: data }),
	setAssetBuildType: (data) => set({ asset_build_type: data }),
	setTimezone: (data) => set({ timezone: data }),
	setTimezones: (data) => set({ timezones: data }),
	setParentLocation: (data) => set({ parent_location: data }),
	setParentAsset: (data) => set({ parent_asset: data }),
	setAssignedUsers: (data: any[]) => set({ assigned_users: data }),
	setLocation: (data: any) => set({ location: data }),
	setLocationObject: (data: any) => set({ locationObject: data }),
	setManufacturer: (data: string) => set({ manufacturer: data }),
	setModel: (data: string) => set({ model: data }),
	setYear: (data: string) => set({ year: data }),
	setDescription: (data) => set({ description: data }),

	// GENERIC SETTER
	setCreateAssetValue: (key, value) =>
		set(() => ({
			[key]: value,
		})),

	// RESET FORM
	resetForm: () => set(initialState),
}));

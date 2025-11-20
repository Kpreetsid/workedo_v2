import { create } from "zustand";

export interface CreateAssetFormData {
	title: string;
	asset_id: string;
	asset_type: string;
	timezone: any[];
	assigned_users: any[];
	location: any | null;
	locationObject: any | null;
	manufacturer: string;
	model: string;
	year: string;
	description: string;
}

interface CreateAssetStore extends CreateAssetFormData {
	setTitle: (data: string) => void;
	setAssetId: (data: string) => void;
	setAssetType: (data: string) => void;
	setTimezone: (data: any[]) => void;
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
	timezone: [],
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
	setTimezone: (data) => set({ timezone: data }),
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

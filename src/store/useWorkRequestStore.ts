import { create } from "zustand";

export interface WorkRequestFormData {
	title: string;
	message: string;
	location: any | null; // full location object
	selected_asset: any | null;
	nature_of_work: string; // Problem Type
	priority: string;
	completion_days: string; // Estimation Duration
	files: any[];
}

interface WorkRequestStore {
	workRequestForm: WorkRequestFormData;
	setWorkRequestForm: (key: keyof WorkRequestFormData, value: any) => void;
	resetWorkRequestForm: () => void;
}

export const useWorkRequestStore = create<WorkRequestStore>((set) => ({
	workRequestForm: {
		title: "",
		message: "",
		location: null,
		selected_asset: null,
		nature_of_work: "",
		priority: "",
		completion_days: "",
		files: [],
	},

	setWorkRequestForm: (key, value) =>
		set((state) => ({
			workRequestForm: { ...state.workRequestForm, [key]: value },
		})),

	resetWorkRequestForm: () =>
		set({
			workRequestForm: {
				title: "",
				message: "",
				location: null,
				selected_asset: null,
				nature_of_work: "",
				priority: "",
				completion_days: "",
				files: [],
			},
		}),
}));
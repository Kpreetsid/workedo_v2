import { create } from "zustand";

export interface WorkRequestFormData {
	title: string;
	message: string;
	location: any | null;
	selected_asset: any | null;
	nature_of_work: string;
	priority: string;
	completion_days: string;
	files: any[];
}

interface WorkRequestStore {
	title: string;
	message: string;
	location: any | null;
	selected_asset: any | null;
	nature_of_work: string;
	priority: string;
	completion_days: string;
	files: any[];
	setWorkRequestForm: (key: keyof WorkRequestFormData, value: any) => void;
	resetWorkRequestForm: () => void;
}

export const useWorkRequestStore = create<WorkRequestStore>((set) => ({
	title: "",
	message: "",
	location: null,
	selected_asset: null,
	nature_of_work: "",
	priority: "",
	completion_days: "",
	files: [],

	setWorkRequestForm: (key, value) =>
		set((state) => ({
			...state, [key]: value
		})),

	resetWorkRequestForm: () =>
		set({
			title: "",
			message: "",
			location: null,
			selected_asset: null,
			nature_of_work: "",
			priority: "",
			completion_days: "",
			files: [],
		}),
}));
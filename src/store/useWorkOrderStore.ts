import { create } from "zustand";

export interface WorkOrderFormData {
	title: string;
	message: string;
	location: any | null; // full location object
  assigned_users: any[]; // full user object
  selected_asset: any | null;
  start_date: string;
	end_date: string;
	nature_of_work: string; // Problem Type
  sop_form_id: string;
	priority: string;
	completion_days: string; // Estimation Duration
	parts: any[];
	files: any[];
}

interface WorkOrderStore {
	workForm: WorkOrderFormData;
	setWorkForm: (key: keyof WorkOrderFormData, value: any) => void;
	resetForm: () => void;
}

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
	workForm: {
		title: "",
		message: "",
		location: null,
		assigned_users: [],
		selected_asset: null,
		start_date: "",
		end_date: "",
		nature_of_work: "",
		sop_form_id: "",
		priority: "",
		completion_days: "",
		parts: [],
		files: [],
	},

	setWorkForm: (key, value) =>
		set((state) => ({
			workForm: { ...state.workForm, [key]: value },
		})),

	resetForm: () =>
		set({
			workForm: {
				title: "",
				message: "",
				location: null,
				assigned_users: [],
				selected_asset: null,
				start_date: "",
				end_date: "",
				nature_of_work: "",
				sop_form_id: "",
				priority: "",
				completion_days: "",
				parts: [],
				files: [],
			},
		}),
}));
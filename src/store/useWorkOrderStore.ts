import { create } from "zustand";

interface WorkOrderStore {
	title: string;
	message: string;
	location: any | null;
	assigned_users: any[];
	selected_asset: any | null;
	start_date: string;
	end_date: string;
	nature_of_work: string;
	sop_form_id: string;
	priority: string;
	completion_days: string;
	parts: any[];
	files: any[];
	tasks: any[];
	work_request_id?: string;
	setWorkForm: (key: keyof Omit<WorkOrderStore, "setWorkForm" | "resetForm">, value: any) => void;
	resetForm: () => void;
}

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
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
	tasks: [],
	work_request_id: "",

	setWorkForm: (key, value) => set({ [key]: value } as any),

	resetForm: () =>
		set({
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
			tasks: [],
			work_request_id: "",
		}),
}));

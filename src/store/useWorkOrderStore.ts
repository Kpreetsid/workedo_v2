import moment from "moment";
import { create } from "zustand";

interface WorkOrderStore {
	isLoaded: boolean;
	title: string;
	message: string;
	location: any | null;
	assigned_users: any[];
	selected_asset: any | null;
	start_date: string;
	end_date: string;
	nature_of_work: string;
	sop_form_id: string;
	sop_form_name: string;
	sop_form_data: Record<string, any>;
	priority: string;
	completion_days: string;
	parts: any[];
	attachments: any[];
	tasks: any[];
	work_request_id?: string;
	setWorkForm: (key: keyof Omit<WorkOrderStore, "setWorkForm" | "resetForm">, value: any) => void;
	resetForm: () => void;
}

export const useWorkOrderStore = create<WorkOrderStore>((set) => ({
	isLoaded: false,
	title: "",
	message: "",
	location: null,
	assigned_users: [],
	selected_asset: null,
	start_date: moment().format('YYYY-MM-DD'),
	end_date: moment().add(2, 'days').format('YYYY-MM-DD'),
	nature_of_work: "Preventive",
	sop_form_id: "",
	sop_form_name: "",
	sop_form_data: {},
	priority: "",
	completion_days: "",
	parts: [],
	attachments: [],
	tasks: [],
	work_request_id: "",

	setWorkForm: (key, value) => set({ [key]: value } as any),

	resetForm: () =>
		set({
			isLoaded: false,
			title: "",
			message: "",
			location: null,
			assigned_users: [],
			selected_asset: null,
			start_date: moment().format('YYYY-MM-DD'),
			end_date: moment().add(2, 'days').format('YYYY-MM-DD'),
			nature_of_work: "",
			sop_form_id: "",
			sop_form_name: "",
			sop_form_data: {},
			priority: "",
			completion_days: "",
			parts: [],
			attachments: [],
			tasks: [],
			work_request_id: "",
		}),
}));

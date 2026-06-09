import moment from "moment";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ProcedureTemplate } from "../../types/procedure";
import { storage } from "../../storage/mmkv";

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
	procedure_ids: string[];
	selected_procedures: ProcedureTemplate[];
	parent_id?: string;
	work_request_id?: string;
	setWorkForm: (key: keyof Omit<WorkOrderStore, "setWorkForm" | "resetForm">, value: any) => void;
	resetForm: () => void;
}

export const useWorkOrderStore = create<WorkOrderStore>()(
	persist(
		(set) => ({
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
			procedure_ids: [],
			selected_procedures: [],
			parent_id: "",
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
					procedure_ids: [],
					selected_procedures: [],
					parent_id: "",
					work_request_id: "",
				}),
		}),
		{
			name: "work-order-draft-storage",
			storage: createJSONStorage(() => ({
				setItem: (name, value) => storage.set(name, value),
				getItem: (name) => storage.getString(name) ?? null,
				removeItem: (name) => storage.delete(name),
			})),
			partialize: (state) => ({
				title: state.title,
				message: state.message,
				location: state.location,
				assigned_users: state.assigned_users,
				selected_asset: state.selected_asset,
				start_date: state.start_date,
				end_date: state.end_date,
				nature_of_work: state.nature_of_work,
				sop_form_id: state.sop_form_id,
				sop_form_name: state.sop_form_name,
				sop_form_data: state.sop_form_data,
				priority: state.priority,
				completion_days: state.completion_days,
				parts: state.parts,
				attachments: state.attachments,
				tasks: state.tasks,
				procedure_ids: state.procedure_ids,
				selected_procedures: state.selected_procedures,
				parent_id: state.parent_id,
				work_request_id: state.work_request_id,
			}),
		}
	)
);

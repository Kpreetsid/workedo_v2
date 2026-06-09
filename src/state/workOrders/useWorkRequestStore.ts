import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { storage } from "@/src/storage/mmkv";

export interface WorkRequestFormData {
	title: string;
	message: string;
	location: any | null;
	selected_asset: any | null;
	nature_of_work: string;
	priority: string;
	completion_days: string;
	attachments: any[];
}

interface WorkRequestStore {
	title: string;
	message: string;
	location: any | null;
	selected_asset: any | null;
	nature_of_work: string;
	priority: string;
	completion_days: string;
	attachments: any[];
	setWorkRequestForm: (key: keyof WorkRequestFormData, value: any) => void;
	resetWorkRequestForm: () => void;
}

export const useWorkRequestStore = create<WorkRequestStore>()(
	persist(
		(set) => ({
			title: "",
			message: "",
			location: null,
			selected_asset: null,
			nature_of_work: "General",
			priority: "None",
			completion_days: "",
			attachments: [],

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
					nature_of_work: "General",
					priority: "None",
					completion_days: "",
					attachments: [],
				}),
		}),
		{
			name: "work-request-draft-storage",
			storage: createJSONStorage(() => ({
				setItem: (name, value) => storage.set(name, value),
				getItem: (name) => storage.getString(name) ?? null,
				removeItem: (name) => storage.delete(name),
			})),
			partialize: (state) => ({
				title: state.title,
				message: state.message,
				location: state.location,
				selected_asset: state.selected_asset,
				nature_of_work: state.nature_of_work,
				priority: state.priority,
				completion_days: state.completion_days,
				attachments: state.attachments,
			}),
		}
	)
);

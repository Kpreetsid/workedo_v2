import { create } from "zustand";

export interface PreventiveFormData {
  title: string;
  description: string;
  location: any | null; // full location object
  assigned_users: any[]; // full user object
  selected_asset: any | null;
  start_date: string;
  schedule: string;
  assign_to: string;
  sop_form_id: string;
  nature_of_work: string;
  priority: string;
  completion_days: string;
  parts: any[];
}

interface PreventiveStore {
  formData: PreventiveFormData;
  setFormValue: (key: keyof PreventiveFormData, value: any) => void;
  resetForm: () => void;
}

export const usePreventiveStore = create<PreventiveStore>((set) => ({
  formData: {
    title: "",
    description: "",
    location: null,
    assigned_users: [],
    selected_asset: null,
    start_date: "",
    schedule: "",
    assign_to: "",
    sop_form_id: "",
    nature_of_work: "",
    priority: "",
    completion_days: "",
    parts: [],
  },
  setFormValue: (key, value) =>
    set((state) => ({
      formData: { ...state.formData, [key]: value },
    })),
  resetForm: () =>
    set({
      formData: {
        title: "",
        description: "",
        location: null,
        assigned_users: [],
        selected_asset: null,
        start_date: "",
        schedule: "",
        assign_to: "",
        sop_form_id: "",
        nature_of_work: "",
        priority: "",
        completion_days: "",
        parts: [],
      },
    }),
}));
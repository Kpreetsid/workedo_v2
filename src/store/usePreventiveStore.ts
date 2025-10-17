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
  setPreventiveValue: (key: keyof PreventiveFormData, value: any) => void;
  resetForm: () => void;
}

export const usePreventiveStore = create<PreventiveStore>((set) => ({
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
  setPreventiveValue: (key: keyof PreventiveFormData, value: any) =>
    set((state) => ({
      [key]: value,
    })),
  resetForm: () =>
    set({
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
    }),
}));
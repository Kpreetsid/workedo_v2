import moment from "moment";
import { create } from "zustand";

export interface PreventiveFormData {
  isLoaded: boolean;
  title: string;
  description: string;
  location: any | null; // full location object
  assigned_users: any[]; // full user object
  selected_asset: any | null;
  start_date: string;
  end_date: string;
  schedule: string;
  assign_to: string;
  sop_form_id: string;
  nature_of_work: string;
  priority: string;
  completion_days: string;
  parts: any[];
  tasks: any[];
  no_of_repititions: string;
  skip_dates: string[];
  skipWeekends: boolean;
  skipWeekendSaturday: boolean;
  skipWeekendSunday: boolean;
}

interface PreventiveStore {
  isLoaded: boolean;
  title: string;
  description: string;
  location: any | null; // full location object
  assigned_users: any[]; // full user object
  selected_asset: any | null;
  start_date: string;
  end_date?: string;
  schedule: string;
  assign_to: string;
  sop_form_id: string;
  nature_of_work: string;
  priority: string;
  completion_days: string;
  parts: any[];
  tasks: any[];
  no_of_repititions: string;
  skip_dates: string[];
  skipWeekends: boolean;
  skipWeekendSaturday: boolean;
  skipWeekendSunday: boolean;
  setPreventiveValue: (key: keyof PreventiveFormData, value: any) => void;
  resetForm: () => void;
}

export const usePreventiveStore = create<PreventiveStore>((set) => ({
  isLoaded: false,
  title: "",
  description: "",
  location: null,
  assigned_users: [],
  selected_asset: null,
  start_date: moment().format('YYYY-MM-DD'),
  end_date: "",
  schedule: "daily",
  assign_to: "",
  sop_form_id: "",
  nature_of_work: "",
  priority: "",
  completion_days: "",
  parts: [],
  tasks: [],
  no_of_repititions: "",
  skip_dates: [],
  skipWeekends: false,
  skipWeekendSaturday: false,
  skipWeekendSunday: false,
  setPreventiveValue: (key: keyof PreventiveFormData, value: any) =>
    set((state) => ({
      [key]: value,
    })),
  resetForm: () =>
    set({
      isLoaded: false,
      title: "",
      description: "",
      location: null,
      assigned_users: [],
      selected_asset: null,
      start_date: moment().format('YYYY-MM-DD'),
      end_date: "",
      schedule: "daily",
      assign_to: "",
      sop_form_id: "",
      nature_of_work: "",
      priority: "",
      completion_days: "",
      parts: [],
      tasks: [],
      no_of_repititions: "",
      skip_dates: [],
      skipWeekends: false,
      skipWeekendSaturday: false,
      skipWeekendSunday: false,
    }),
}));
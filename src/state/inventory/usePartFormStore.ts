import { create } from "zustand";

interface PartFormState {
  isLoaded: boolean;
  part_name: string;
  description: string;
  location: any | null;
  selected_part: string;
  part_number: string;
  available_quantity: string;
  min_stock_quantity: string;
  unit_cost: string;
  uom: string;
  setPartFormValue: (key: keyof PartFormState, value: any) => void;
  resetPartForm: () => void;
}

export const usePartFormStore = create<PartFormState>((set) => ({
  isLoaded: false,
  part_name: "",
  description: "",
  location: null,
  selected_part: "",
  part_number: "",
  available_quantity: "",
  min_stock_quantity: "",
  unit_cost: "",
  uom: "",

  setPartFormValue: (key, value) =>
    set(() => ({
      [key]: value,
    })),
  resetPartForm: () =>
    set({
      isLoaded: false,
      part_name: "",
      description: "",
      location: null,
      selected_part: "",
      part_number: "",
      available_quantity: "",
      min_stock_quantity: "",
      unit_cost: "",
      uom: ""
    }),
}));
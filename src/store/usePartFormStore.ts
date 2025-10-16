import { create } from "zustand";

interface PartFormState {
  partForm: {
    part_name: string;
    description: string;
    location: any | null;
    selected_part: string;
    part_number: string;
    available_quantity: string;
    min_stock_quantity: string;
    unit_cost: string;
  };
  setPartFormValue: (key: keyof PartFormState["partForm"], value: any) => void;
  resetPartForm: () => void;
}

export const usePartFormStore = create<PartFormState>((set) => ({
  partForm: {
    part_name: "",
    description: "",
    location: null,
    selected_part: "",
    part_number: "",
    available_quantity: "",
    min_stock_quantity: "",
    unit_cost: "",
  },
  setPartFormValue: (key, value) =>
    set((state) => ({
      partForm: { ...state.partForm, [key]: value },
    })),
  resetPartForm: () =>
    set({
      partForm: {
        part_name: "",
        description: "",
        location: null,
        selected_part: "",
        part_number: "",
        available_quantity: "",
        min_stock_quantity: "",
        unit_cost: "",
      },
    }),
}));
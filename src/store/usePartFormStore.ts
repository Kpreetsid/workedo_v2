import { create } from "zustand";

interface PartFormState {
  formData: {
    part_name: string;
    description: string;
    location: string;
    selected_part: string;
    part_number: string;
    available_quantity: string;
    min_stock_quantity: string;
    unit_cost: string;
  };
  setFormValue: (key: keyof PartFormState["formData"], value: string) => void;
  resetForm: () => void;
}

export const usePartFormStore = create<PartFormState>((set) => ({
  formData: {
    part_name: "",
    description: "",
    location: "",
    selected_part: "",
    part_number: "",
    available_quantity: "",
    min_stock_quantity: "",
    unit_cost: "",
  },
  setFormValue: (key, value) =>
    set((state) => ({
      formData: { ...state.formData, [key]: value },
    })),
  resetForm: () =>
    set({
      formData: {
        part_name: "",
        description: "",
        location: "",
        selected_part: "",
        part_number: "",
        available_quantity: "",
        min_stock_quantity: "",
        unit_cost: "",
      },
    }),
}));

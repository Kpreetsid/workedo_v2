import { create } from "zustand";

interface UserFormState {
  username: string;
  email: string;

  setFormValue: (key: keyof Omit<UserFormState, "setFormValue" | "resetForm">, value: string) => void;
  resetForm: () => void;
}

export const useUserFormStore = create<UserFormState>((set) => ({
  username: "",
  email: "",

  setFormValue: (key, value) => set({ [key]: value } as any),

  resetForm: () => set({ username: "", email: "" }),
}));

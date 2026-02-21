import { create } from "zustand";

export interface PDMSelectedLocation {
  id: string;
  location_name: string;
}

export interface PDMStoreData {
  selectedLocation: PDMSelectedLocation[];
}

interface PDMStore extends PDMStoreData {
  setSelectedLocation: (
    selectedLocation: PDMSelectedLocation[] | PDMSelectedLocation | null
  ) => void;

  /** Generic setter if you ever need it */
  setPDMValue: <K extends keyof PDMStoreData>(key: K, value: PDMStoreData[K]) => void;

  resetForm: () => void;
}

const initialState: PDMStoreData = {
  selectedLocation: [],
};

export const usePDMStore = create<PDMStore>((set) => ({
  ...initialState,

  // INDIVIDUAL SETTER
  setSelectedLocation: (selectedLocation) =>
    set({
      selectedLocation: !selectedLocation
        ? []
        : Array.isArray(selectedLocation)
        ? selectedLocation
        : [selectedLocation],
    }),

  // GENERIC SETTER
  setPDMValue: (key, value) =>
    set(() => ({
      [key]: value,
    })),

  // RESET
  resetForm: () => set(initialState),
}));

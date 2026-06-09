import { create } from "zustand";

interface Location {
  id?: string;
  location_name: string;
  [key: string]: any;
}

interface LocationStore {
  selectedPartLocation: Location | null;
  setSelectedPartLocation: (location: Location | null) => void;
  clearPartLocation: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  selectedPartLocation: null,
  setSelectedPartLocation: (location) => set({ selectedPartLocation: location }),
  clearPartLocation: () => set({ selectedPartLocation: null }),
}));
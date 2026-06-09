import { create } from "zustand";

interface GlobalStore {
  locationsTree: any[];
  setLocationsTree: (data: any[]) => void;

  assetsTree: any[];
  setAssetsTree: (data: any[]) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  locationsTree: [],
  setLocationsTree: (data) => set({ locationsTree: data }),

  assetsTree: [],
  setAssetsTree: (data) => set({ assetsTree: data }),
}));
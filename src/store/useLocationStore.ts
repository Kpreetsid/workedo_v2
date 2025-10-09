import { create } from "zustand";
import type { Location } from "@/src/types/location";

interface LocationStore {
  locationParams: Location | null;
  setLocationParams: (location: Location | null) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
    locationParams: null,
    setLocationParams: (location) => set({ locationParams: location }),
}));
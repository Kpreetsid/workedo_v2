import { create } from "zustand";
import { LocationAsset } from "@/src/types/locationAsset";
import { Location } from "@/src/types/location";
import { AssetHealthSummary } from "../types/assetHistory";

interface OverviewState {
  parentLocations: Location[];
  childLocations: Location[];
  childAssets: LocationAsset[];
  assetKPIHistory: AssetHealthSummary | null;

  parentSelectionId: string | null;
  childSelectionIds: string[];

  setParentLocations: (data: Location[]) => void;
  setChildLocations: (data: Location[]) => void;
  setChildAssets: (data: LocationAsset[]) => void;
  setParentSelectionId: (data: string | null) => void;
  setChildSelectionIds: (data: string[]) => void;
  setAssetKPIHistory: (data: AssetHealthSummary | null) => void;

  clearOverview: () => void;
}

export const useOverviewStore = create<OverviewState>((set) => ({
  parentLocations: [],
  childLocations: [],
  childAssets: [],
  assetKPIHistory: null,

  parentSelectionId: null,
  childSelectionIds: [],

  setParentLocations: (data) => set({ parentLocations: data }),
  setChildLocations: (data) => set({ childLocations: data }),
  setChildAssets: (data) => set({ childAssets: data }),
  setParentSelectionId: (data) => set({ parentSelectionId: data }),
  setChildSelectionIds: (data) => set({ childSelectionIds: data }),
  setAssetKPIHistory: (data) => set({ assetKPIHistory: data }),

  clearOverview: () => set({
    parentLocations: [],
    childLocations: [],
    childAssets: [],
    assetKPIHistory: null,
    parentSelectionId: null,
    childSelectionIds: [],
  }),
}));
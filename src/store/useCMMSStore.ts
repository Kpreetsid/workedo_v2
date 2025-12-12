import { create } from "zustand";
import { LocationAsset } from "@/src/types/locationAsset";
import { Location } from "@/src/types/location";
import { AssetHealthSummary } from "../types/assetHistory";

interface CMMSState {
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

  clearCMMS: () => void;
}

export const useCMMSStore = create<CMMSState>((set) => ({
  // these are for the data inside dropdown for parent and child locations
  parentLocations: [],
  childLocations: [],

  // child assets are actually assets data of all or selected child locations
  childAssets: [],

  // assetKPIHistory is the data of assets health summary of all or selected child locations
  assetKPIHistory: null,

  // selections from drop down
  parentSelectionId: null,
  childSelectionIds: [],

  // functions to set the data
  setParentLocations: (data) => set({ parentLocations: data }),
  setChildLocations: (data) => set({ childLocations: data }),
  setChildAssets: (data) => set({ childAssets: data }),
  setParentSelectionId: (data) => set({ parentSelectionId: data }),
  setChildSelectionIds: (data) => set({ childSelectionIds: data }),
  setAssetKPIHistory: (data) => set({ assetKPIHistory: data }),

  // function to clear the data
  clearCMMS: () => set({
    parentLocations: [],
    childLocations: [],
    childAssets: [],
    assetKPIHistory: null,
    parentSelectionId: null,
    childSelectionIds: [],
  }),
}));
import { create } from "zustand";
import { LocationAsset } from "@/src/types/locationAsset";
import { AssetHealthSummary } from "../../types/assetHistory";

export interface OverviewParentLocation {
  id: string;
  location_name: string;
}

interface OverviewState {
  parentLocations: OverviewParentLocation[];
  childAssets: LocationAsset[];
  assetKPIHistory: AssetHealthSummary | null;

  selectedAssets: string[];

  setParentLocations: (data: OverviewParentLocation[]) => void;
  setChildAssets: (data: LocationAsset[]) => void;
  setSelectedAssets: (data: string[]) => void;
  setAssetKPIHistory: (data: AssetHealthSummary | null) => void;

  clearOverview: () => void;
}

export const useOverviewStore = create<OverviewState>((set) => ({
  // these are for the data inside dropdown for parent and child locations
  parentLocations: [],

  // child assets are actually assets data of all or selected child locations
  childAssets: [],

  // assetKPIHistory is the data of assets health summary of all or selected child locations
  assetKPIHistory: null,

  // selected parent assets
  selectedAssets: [],

  // functions to set the data
  setParentLocations: (data) => set({ parentLocations: data }),
  setChildAssets: (data) => set({ childAssets: data }),
  setSelectedAssets: (data) => set({ selectedAssets: data }),
  setAssetKPIHistory: (data) => set({ assetKPIHistory: data }),

  // function to clear the data
  clearOverview: () => set({
    parentLocations: [],
    childAssets: [],
    assetKPIHistory: null,
    selectedAssets: [],
  }),
}));

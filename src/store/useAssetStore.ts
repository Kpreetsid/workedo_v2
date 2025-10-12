import { create } from "zustand";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

export interface AssetState {
    endpoints: AssetEndpoint[];
    endpointSelected: AssetEndpoint | null;
    compositeIdSelected: string | null;
    assetHealth: any;
    selectedAxis: string[];

    // ✅ Asset Filter
    selectedSignal: string;        // Velocity / Acceleration / Displacement
    selectedValueType: string;     // Rms / Peak_to_peak / Peak / Kurtosis
    
    graphData: null,

    // ✅ Actions
    setEndpoints: (data: AssetEndpoint[]) => void;
    setEndpointSelected: (data: AssetEndpoint | null) => void;
    setCompositeIdSelected: (id: string | null) => void;
    setAssetHealth: (data: any) => void;
    setSelectedAxis: (data: string[]) => void;
    toggleAxis: (axis: string) => void;

    setGraphData: (data: string[]) => void;

    // ✅ Filter actions
    setSelectedSignal: (signal: string) => void;
    setSelectedValueType: (valueType: string) => void;

    clearAssetState: () => void;
}

export const useAssetStore = create<AssetState>((set) => ({
    endpoints: [],
    endpointSelected: null,
    compositeIdSelected: null,
    assetHealth: null,
    selectedAxis: ["Horizontal"],

    selectedSignal: "Velocity",     // default option
    selectedValueType: "Rms",       // default option

    graphData: null,
    setGraphData: (data: any) => set({ graphData: data }),

    setEndpoints: (data) => set({ endpoints: data }),
    setEndpointSelected: (data) => set({ endpointSelected: data }),
    setCompositeIdSelected: (id) => set({ compositeIdSelected: id }),
    setAssetHealth: (data) => set({ assetHealth: data }),
    setSelectedAxis: (data) => set({ selectedAxis: data }),

    toggleAxis: (axis) =>
        set((state) => ({
            selectedAxis: state.selectedAxis.includes(axis)
                ? state.selectedAxis.filter((a) => a !== axis)
                : [...state.selectedAxis, axis],
        })),

    // ✅ New setters for AssetFilter
    setSelectedSignal: (signal) => set({ selectedSignal: signal }),
    setSelectedValueType: (valueType) => set({ selectedValueType: valueType }),

    clearAssetState: () =>
        set({
            endpoints: [],
            endpointSelected: null,
            compositeIdSelected: null,
            assetHealth: null,
            selectedAxis: ["Horizontal"],
            selectedSignal: "Velocity",
            selectedValueType: "Rms",
            graphData: null,
        }),
}));

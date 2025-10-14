import { create } from "zustand";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

export interface AssetState {
	asset_data: any;
	endpoints: AssetEndpoint[];
	endpointSelected: AssetEndpoint | null;
	compositeIdSelected: string | null;
	assetHealth: any;
	selectedAxis: string[];

	// ✅ Asset Filter
	selectedSignal: string;        // Velocity / Acceleration / Displacement
	selectedValueType: string;     // Rms / Peak_to_peak / Peak / Kurtosis

	graphData: null,

	selectedSensor: AssetEndpoint | null,
	selectedEndpointToEdit: AssetEndpoint | null;
	deviceInfo: [] | null,

	// ✅ Actions
	setAssetData: (data: any) => void,
	setEndpoints: (data: AssetEndpoint[]) => void;
	setEndpointSelected: (data: AssetEndpoint | null) => void;
	setCompositeIdSelected: (id: string | null) => void;
	setAssetHealth: (data: any) => void;
	setSelectedAxis: (data: string[]) => void;
	toggleAxis: (axis: string) => void;

	setGraphData: (data: string[]) => void;
	setSelectedSensor: (data: any) => void;
	setSelectedEndpointToEdit: (data: any) => void;
	setDeviceInfo: (data: any) => void;

	// ✅ Filter actions
	setSelectedSignal: (signal: string) => void;
	setSelectedValueType: (valueType: string) => void;

	clearAssetState: () => void;
}

export const useAssetStore = create<AssetState>((set) => ({
	asset_data: null,
	endpoints: [],
	endpointSelected: null,
	compositeIdSelected: null,
	assetHealth: null,
	selectedAxis: ["Horizontal"],

	selectedSignal: "Velocity",     // default option
	selectedValueType: "Rms",       // default option

	graphData: null,
	selectedSensor: null,
	selectedEndpointToEdit: null,
	deviceInfo: [],
	setAssetData: (data: any) => set({ asset_data: data }),
	setGraphData: (data: any) => set({ graphData: data }),
	setSelectedSensor: (data: any) => set({ selectedSensor: data }),
	setSelectedEndpointToEdit: (data: any) => set({ selectedEndpointToEdit: data }),
	setDeviceInfo: (data: any) => set({ deviceInfo: data }),

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
			asset_data: null,
			endpoints: [],
			endpointSelected: null,
			compositeIdSelected: null,
			assetHealth: null,
			selectedAxis: ["Horizontal"],
			selectedSignal: "Velocity",
			selectedValueType: "Rms",
			graphData: null,
			selectedSensor: null,
			selectedEndpointToEdit: null,
			deviceInfo: [],
		}),
}));

import { create } from "zustand";

export interface GatewayFormData {
  mac_id: string;
  location: any | null; // full location object
  sensor: any | null;
}

interface GatewayStore {
  gatewayFormData: GatewayFormData;
  setGatewayFormValue: (key: keyof GatewayFormData, value: any) => void;
  resetGatewayForm: () => void;
}

export const useGatewayStore = create<GatewayStore>((set) => ({
  gatewayFormData: {
    mac_id: "",
    location: null,
    sensor: "",
  },
  setGatewayFormValue: (key: keyof GatewayFormData, value: any) =>
    set((state) => ({
      gatewayFormData: { ...state.gatewayFormData, [key]: value },
    })),
  resetGatewayForm: () =>
    set({
      gatewayFormData: {
        mac_id: "",
        location: null,
        sensor: ""
      },
    }),
}));
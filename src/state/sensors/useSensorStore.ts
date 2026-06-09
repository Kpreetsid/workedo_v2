import { create } from "zustand";

interface SensorStore {
  isLoaded: boolean;

  mac_id: string;
  sensor_type: string;
  mount_orientation: string;
  mount_material: string;
  mount_type: string;

  // 👇 manual axis mapping (ONLY used when custom)
  asset_x_axis: string;
  asset_y_axis: string;
  asset_z_axis: string;


  setSensorForm: (
    key: keyof Omit<SensorStore, "setSensorForm" | "resetForm">,
    value: any
  ) => void;

  resetSensorForm: () => void;
}

export const useSensorStore = create<SensorStore>((set) => ({
  isLoaded: false,

  mac_id: "",
  sensor_type: "",
  mount_orientation: "",
  mount_material: "",
  mount_type: "",

  asset_x_axis: "",
  asset_y_axis: "",
  asset_z_axis: "",

  setSensorForm: (key, value) =>
    set({ [key]: value } as any),

  resetSensorForm: () =>
    set({
      isLoaded: false,
      mac_id: "",
      sensor_type: "",
      mount_orientation: "",
      mount_material: "",
      mount_type: "",
      asset_x_axis: "",
      asset_y_axis: "",
      asset_z_axis: "",
    }),
}));

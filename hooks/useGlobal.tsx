import { useCallback } from "react";
import { storage } from "@/src/storage/mmkv";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useAssetStore } from "@/src/store/useAssetStore";
import { useGatewayStore } from "@/src/store/useGatewayStore";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useUserFormStore } from "@/src/store/useUserFormStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { useCreateLocationStore } from "@/src/store/useCreateLocationStore";
import { useCreateAssetStore } from "@/src/store/useCreateAsset";

export function useGlobal() {
	const router = useRouter();
	const { setUser } = useAuthStore();

	const mapAPItoConfigData = (api: any) => {
		if (!api) return [];

		return [
			{
				title: "General Configurations",
				data: [
					{ label: "Mount Location", value: api.mount?.mount_location || "-" },
					{ label: "Mount Material", value: api.mount?.mount_material || "-" },
					{ label: "Mount Type", value: api.mount?.mount_type || "-" },
					{ label: "Asset Type", value: api.mount?.asset_type || "-" },
					{ label: "Custom Mapping", value: JSON.stringify(api.mount?.customMapping) || "-" }
				],
			},
			{
				title: "Signal Processing Configurations",
				data: [
					{ label: "RPM", value: api.signal_processing?.rpm || "-" },
					{
						label: "High Pass Filter Cut-Off",
						value: api.signal_processing?.high_pass
							? `${api.signal_processing.high_pass}Hz`
							: "-",
					},
					{
						label: "Low Pass Filter Cut-Off",
						value: api.signal_processing?.low_pass
							? `${api.signal_processing.low_pass}Hz`
							: "-",
					},
				],
			},
			{
				title: "Bearing Configurations",
				data: [
					{ label: "Bearing Number", value: api.bearing_details?.bearing_number || "-" },
					{ label: "BPFO", value: api.bearing_details?.bpfo || "-" },
					{ label: "BPFI", value: api.bearing_details?.bpfi || "-" },
					{ label: "BSF", value: api.bearing_details?.bsf || "-" },
					{ label: "FTF", value: api.bearing_details?.ftf || "-" },
				],
			},
			{
				title: "Firmware Configurations",
				data: [
					{
						label: "Sensitivity",
						value: api.firmware?.sensitivity ? `${api.firmware.sensitivity}g` : "-",
					},
					{
						label: "Vibration Sampling Frequency (Raw Data)",
						value: api.firmware?.sampling_rate
							? `${api.firmware.sampling_rate}Hz`
							: "-",
					},
					{
						label: "Vibration Sampling Frequency (Edge)",
						value: api.firmware?.sampling_rate_edge
							? `${api.firmware.sampling_rate_edge}Hz`
							: "-",
					},
					{
						label: "Vibration No. of Samples (Raw Data)",
						value: api.firmware?.no_of_samples || "-",
					},
					{
						label: "Vibration No. of Samples (Edge)",
						value: api.firmware?.no_of_samples_edge || "-",
					},
					{
						label: "Edge Calculation Interval (Minutes)",
						value: api.edge?.sleep_time || "-",
					},
				],
			},
			{
				title: "Edge Parameters",
				data: [
					{
						label: "Acceleration RMS Horizontal(g)",
						value: api.edge?.acc_rms_x || "-",
					},
					{
						label: "Acceleration RMS Vertical(g)",
						value: api.edge?.acc_rms_y || "-",
					},
					{
						label: "Acceleration RMS Axial(g)",
						value: api.edge?.acc_rms_z || "-",
					},
					{
						label: "Velocity RMS Horizontal(mm/s)",
						value: api.edge?.velocity_x || "-",
					},
					{
						label: "Velocity RMS Vertical(mm/s)",
						value: api.edge?.velocity_y || "-",
					},
					{
						label: "Velocity RMS Axial(mm/s)",
						value: api.edge?.velocity_z || "-",
					},
					{
						label: "Acc. Peak to Peak Horizontal(g)",
						value: api.edge?.acc_pp_x || "-",
					},
					{
						label: "Acc. Peak to Peak Vertical(g)",
						value: api.edge?.acc_pp_y || "-",
					},
					{
						label: "Acc. Peak to Peak Axial(g)",
						value: api.edge?.acc_pp_z || "-",
					},
					{ label: "Temperature (‘C)", value: api.edge?.temp || "-" },
					{ label: "Counter", value: api.edge?.counter || "-" },
					{
						label: "Edge alarm time out (Hours)",
						value: api.edge?.edgeAlarmTimeOut || "-",
					},
				],
			},
			{
				title: "Utility",
				data: [
					{
						label: "Currently tracking End-Point",
						value: api.mount?.point_name || "Not defined yet",
					},
					{ label: "Running Value", value: api.utility?.operating_value || "-" },
					{
						label: "Shift start time (24 Hr format)",
						value: api.timezone_data?.shift_start_time || "-",
					},
					{
						label: "Total working hours",
						value: api.utility?.total_working_hours || "-",
					},
					{ label: "Time Zone", value: api.timezone_data?.timezone || "-" },
					{ label: "User Emails", value: api.timezone_data?.user_list || "-" },
				],
			},
		];
	}

	const logout = () => {
		console.log("Logout");
		storage.delete('token');
		storage.delete('user');

		useOverviewStore.getState().clearOverview();
		useAssetStore.getState().clearAssetState();
		useGatewayStore.getState().resetGatewayForm();
		useLocationStore.getState().clearPartLocation();
		usePartFormStore.getState().resetPartForm();
		usePreventiveStore.getState().resetForm();
		useUserFormStore.getState().resetForm();
		useWorkOrderStore.getState().resetForm();
		useWorkRequestStore.getState().resetWorkRequestForm();
		useCreateAssetStore.getState().resetForm();
		useCreateLocationStore.getState().resetForm();
		setUser(null);

		// Remove authenticated screens from the navigation history so Android's
		// Back button cannot reveal them after the user has logged out.
		router.dismissAll();
		router.replace("/");
	}

	return {
		logout,
		mapAPItoConfigData
	};
}

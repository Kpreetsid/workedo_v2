import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Fonts from "@/constants/Typography";
import { useAssetStore } from "@/src/store/useAssetStore";
import { AssetEndpoint } from "@/src/types/assetEndpoint";

type ConfigViewType = "vibration" | "energy" | "current";

type DeviceInfoPayload = {
	viewType?: ConfigViewType;
	config?: any;
	endpoint?: AssetEndpoint | null;
} | null;

const getMacId = (endpoint?: AssetEndpoint | null) => {
	const macId = endpoint?.mac_id;
	if (macId) {
		return macId.includes("_") ? macId.split("_")[1] : macId;
	}

	const compositeId = endpoint?.composite_id;
	return compositeId?.includes("_") ? compositeId.split("_")[1] : "-";
};

const getLinkStatus = (endpoint?: AssetEndpoint | null) => {
	if (endpoint?.is_linked === true) return "Linked";
	if (endpoint?.is_linked === false) return "Not Linked";
	return "-";
};

const getSensorStatus = (endpoint?: AssetEndpoint | null) => {
	if (endpoint?.online === "True") return "Online";
	if (endpoint?.online === "False") return "Offline";
	return endpoint?.online || "-";
};

const buildConfigItem = (label: string, value: any) => ({
	label,
	value:
		value === undefined || value === null || value === ""
			? "-"
			: Array.isArray(value)
				? value.join(", ")
				: String(value),
});

const buildVibrationSections = (config: any, endpoint?: AssetEndpoint | null) => {
	const compositeId = endpoint?.composite_id?.toLowerCase() || "";
	const isWireless = compositeId.startsWith("wl_");
	const isBluetooth = compositeId.startsWith("ble_");
	const isWired = compositeId.startsWith("w_");

	const sections = [
		{
			title: "General Configurations",
			data: [
				buildConfigItem("Mount Location", config?.mount?.mount_location),
				buildConfigItem("Mount Material", config?.mount?.mount_material),
				buildConfigItem("Mount Type", config?.mount?.mount_type),
				buildConfigItem("Sensor Type", config?.mount?.selectedSensorType),
				buildConfigItem("Mount Direction", config?.mount?.mount_direction),
			],
		},
		{
			title: "Signal Processing Configurations",
			data: [
				buildConfigItem("RPM", config?.signal_processing?.rpm),
				buildConfigItem("High Pass Filter Cut-Off", config?.signal_processing?.high_pass),
				buildConfigItem("Low Pass Filter Cut-Off", config?.signal_processing?.low_pass),
			],
		},
		{
			title: "Bearing Configurations",
			data: [
				buildConfigItem("Bearing Number", config?.bearing_details?.bearing_number),
				buildConfigItem("BPFO", config?.bearing_details?.bpfo),
				buildConfigItem("BPFI", config?.bearing_details?.bpfi),
				buildConfigItem("BSF", config?.bearing_details?.bsf),
				buildConfigItem("FTF", config?.bearing_details?.ftf),
			],
		},
		{
			title: "Firmware Configurations",
			data: [
				buildConfigItem("Sensitivity", config?.firmware?.sensitivity),
				buildConfigItem("Vibration Sampling Frequency (Raw Data)", config?.firmware?.sampling_rate),
				buildConfigItem("Vibration Sampling Frequency (Edge)", config?.firmware?.sampling_rate_edge),
				buildConfigItem("Vibration No. of Samples (Raw Data)", config?.firmware?.no_of_samples),
				buildConfigItem("Vibration No. of Samples (Edge)", config?.firmware?.no_of_samples_edge),
				...((isBluetooth || isWired)
					? [buildConfigItem("Acoustic Sampling Frequency", config?.firmware?.acoustic_sampling_rate)]
					: []),
				...((isWireless || isBluetooth)
					? [buildConfigItem("Raw Data Interval (Hours)", config?.firmware?.sleep_time ? (config.firmware.sleep_time / 60).toFixed(2) : "-")]
					: []),
				...(isWired
					? [
							buildConfigItem("Raw Data Interval (Minutes)", config?.firmware?.sleep_time),
							buildConfigItem("Overall RMS Frequency (Seconds)", config?.firmware?.wired_rms_freq),
						]
					: []),
				...((isWireless || isBluetooth)
					? [buildConfigItem("Edge Calculation Interval (Minutes)", config?.firmware?.rms_data_interval)]
					: []),
			],
		},
	];

	if (isWireless || isBluetooth) {
		sections.push({
			title: "Edge Parameters",
			data: [
				buildConfigItem("Acceleration RMS Horizontal (g)", config?.edge?.acc_rms_x),
				buildConfigItem("Acceleration RMS Vertical (g)", config?.edge?.acc_rms_y),
				buildConfigItem("Acceleration RMS Axial (g)", config?.edge?.acc_rms_z),
				buildConfigItem("Velocity RMS Horizontal (mm/s)", config?.edge?.velocity_x),
				buildConfigItem("Velocity RMS Vertical (mm/s)", config?.edge?.velocity_y),
				buildConfigItem("Velocity RMS Axial (mm/s)", config?.edge?.velocity_z),
				buildConfigItem("Acc. Peak to Peak Horizontal (g)", config?.edge?.acc_pp_x),
				buildConfigItem("Acc. Peak to Peak Vertical (g)", config?.edge?.acc_pp_y),
				buildConfigItem("Acc. Peak to Peak Axial (g)", config?.edge?.acc_pp_z),
				buildConfigItem("Temperature (C)", config?.edge?.temp),
				buildConfigItem("Counter", config?.edge?.counter),
				buildConfigItem("Edge Alarm Time Out (Hours)", config?.edge?.edgeAlarmTimeOut),
			],
		});
	}

	sections.push({
		title: "Utility",
		data: [
			buildConfigItem("Currently Tracking End-Point", config?.utility?.name || endpoint?.point_name),
			buildConfigItem(
				"Running Value",
				config?.utility?.operating_value !== undefined && config?.utility?.operating_value !== null
					? `${config.utility.operating_value} mm/sec`
					: "-"
			),
			buildConfigItem(
				"Shift Start Time (24 Hr Format)",
				config?.timezone_data?.shift_start_time !== undefined && config?.timezone_data?.shift_start_time !== null
					? `${config.timezone_data.shift_start_time} hr`
					: "-"
			),
			buildConfigItem(
				"Total Working Hours",
				config?.timezone_data?.working_hours !== undefined && config?.timezone_data?.working_hours !== null
					? `${config.timezone_data.working_hours} hr`
					: "-"
			),
			buildConfigItem("Time Zone", config?.timezone_data?.org_timezone || config?.timezone_data?.timezone),
			buildConfigItem("User Emails", config?.timezone_data?.userEmail || config?.timezone_data?.user_list),
		],
	});

	return sections;
};

const buildEnergySection = (config: any, endpoint?: AssetEndpoint | null) => [
	{
		title: "Energy Configurations",
		data: [
			buildConfigItem("MAC ID", config?.mount?.mac_id || endpoint?.mac_id),
			buildConfigItem("Point Name", config?.mount?.point_name || endpoint?.point_name),
			buildConfigItem("RPM", config?.mount?.rpm || (endpoint as any)?.rpm),
			buildConfigItem("Block Size", config?.energy?.block_size),
			buildConfigItem("Sampling Rate", config?.energy?.sampling_rate),
			buildConfigItem("RMS Frequency (Seconds)", config?.energy?.rms_freq),
			buildConfigItem("Raw Frequency (Minutes)", config?.energy?.raw_freq),
			buildConfigItem("CT1 Primary", config?.energy?.ct1_primary),
			buildConfigItem("CT1 Secondary", config?.energy?.ct1_secondary),
			buildConfigItem("CT2 Primary", config?.energy?.ct2_primary),
			buildConfigItem("CT2 Secondary", config?.energy?.ct2_secondary),
			buildConfigItem("PT Ratio", config?.energy?.pt_ratio),
			buildConfigItem("R Burden", config?.energy?.r_burden),
		],
	},
];

const renderSection = (section: { title: string; data: Array<{ label: string; value: string }> }) => (
	<View key={section.title} style={styles.sectionCard}>
		<Text style={styles.sectionTitle}>{section.title}</Text>
		<View style={styles.grid}>
			{section.data.map((item) => (
				<View key={`${section.title}-${item.label}`} style={styles.gridItem}>
					<Text style={styles.label}>{item.label}</Text>
					<Text style={styles.value}>{item.value}</Text>
				</View>
			))}
		</View>
	</View>
);

export default function ConfigSections() {
	const selectedSensor = useAssetStore((state) => state.selectedSensor);
	const deviceInfo = useAssetStore((state) => state.deviceInfo) as DeviceInfoPayload;

	if (!selectedSensor) {
		return (
			<View style={styles.emptyState}>
				<Text style={styles.emptyText}>Select an endpoint to view configuration details.</Text>
			</View>
		);
	}

	const viewType = deviceInfo?.viewType;
	const config = deviceInfo?.config;

	if (viewType === "current") {
		return (
			<View style={styles.currentCard}>
				<View style={styles.currentHeader}>
					<View style={styles.currentIconWrap}>
						<MaterialCommunityIcons name="lightning-bolt-outline" size={24} color="#5B21B6" />
					</View>
					<View style={styles.currentCopy}>
						<Text style={styles.currentTitle}>Current Device</Text>
						<Text style={styles.currentNote}>This current device does not have configuration.</Text>
					</View>
				</View>

				<View style={styles.grid}>
					<View style={styles.gridItem}>
						<Text style={styles.label}>MAC ID</Text>
						<Text style={styles.value}>{getMacId(selectedSensor)}</Text>
					</View>
					<View style={styles.gridItem}>
						<Text style={styles.label}>End Point</Text>
						<Text style={styles.value}>{selectedSensor?.point_name || "-"}</Text>
					</View>
					<View style={styles.gridItem}>
						<Text style={styles.label}>Mount Location</Text>
						<Text style={styles.value}>{selectedSensor?.mount_location || "-"}</Text>
					</View>
					<View style={styles.gridItem}>
						<Text style={styles.label}>Asset Name</Text>
						<Text style={styles.value}>{selectedSensor?.asset_name || "-"}</Text>
					</View>
					<View style={styles.gridItem}>
						<Text style={styles.label}>Link Status</Text>
						<Text style={styles.value}>{getLinkStatus(selectedSensor)}</Text>
					</View>
					<View style={styles.gridItem}>
						<Text style={styles.label}>Sensor Status</Text>
						<Text style={styles.value}>{getSensorStatus(selectedSensor)}</Text>
					</View>
				</View>
			</View>
		);
	}

	if (viewType === "energy") {
		const sections = buildEnergySection(config, selectedSensor);
		return <View style={styles.container}>{sections.map(renderSection)}</View>;
	}

	if (viewType === "vibration" && config) {
		const sections = buildVibrationSections(config, selectedSensor);
		return <View style={styles.container}>{sections.map(renderSection)}</View>;
	}

	return (
		<View style={styles.emptyState}>
			<Text style={styles.emptyText}>Configuration is not available for this endpoint.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingBottom: 14,
		gap: 10,
	},
	sectionCard: {
		marginHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#E9D7FE",
	},
	sectionTitle: {
		fontSize: 15,
		fontFamily: Fonts.bold,
		color: "#111827",
		marginBottom: 10,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	gridItem: {
		width: "47%",
		minHeight: 58,
		paddingHorizontal: 9,
		paddingVertical: 8,
		borderRadius: 10,
		backgroundColor: "#FCFAFF",
		borderWidth: 1,
		borderColor: "#F2E8FF",
	},
	label: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#6B7280",
		textTransform: "uppercase",
		marginBottom: 4,
	},
	value: {
		fontSize: 12,
		lineHeight: 16,
		fontFamily: Fonts.medium,
		color: "#6D28D9",
	},
	currentCard: {
		marginHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#E9D7FE",
	},
	currentHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 10,
	},
	currentIconWrap: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: "#F3E8FF",
		alignItems: "center",
		justifyContent: "center",
	},
	currentCopy: {
		flex: 1,
	},
	currentTitle: {
		fontSize: 15,
		fontFamily: Fonts.bold,
		color: "#111827",
	},
	currentNote: {
		fontSize: 12,
		lineHeight: 16,
		fontFamily: Fonts.regular,
		color: "#6B7280",
		marginTop: 4,
	},
	emptyState: {
		marginHorizontal: 16,
		marginTop: 10,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 14,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		alignItems: "center",
	},
	emptyText: {
		fontSize: 13,
		lineHeight: 18,
		fontFamily: Fonts.medium,
		color: "#6B7280",
		textAlign: "center",
	},
});

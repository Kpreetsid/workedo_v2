import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import Fonts from "@/constants/Typography";
import { useAssetStore } from "@/src/store/useAssetStore";
import { useEffect, useState } from "react";
import { getSensorConfig } from "@/src/services/asset.service";

const mockConfigData = [
	{
		title: "General Configurations",
		data: [
			{ label: "Mount Location", value: "Motor Housing" },
			{ label: "Mount Material", value: "Aluminium" },
			{ label: "Mount Type", value: "Bolt-On" },
			{ label: "Asset Type", value: "Rotary Machine" },
		],
	},
	{
		title: "Signal Processing Configurations",
		data: [
			{ label: "RPM", value: "1500" },
			{ label: "High Pass Filter Cut-Off", value: "10Hz" },
			{ label: "Low Pass Filter Cut-Off", value: "1kHz" },
		],
	},
	{
		title: "Bearing Configurations",
		data: [
			{ label: "Bearing Number", value: "SKF 6205" },
			{ label: "BPFO", value: "245" },
			{ label: "BPFI", value: "300" },
			{ label: "BSF", value: "125" },
			{ label: "FTF", value: "15" },
		],
	},
	{
		title: "Firmware Configurations",
		data: [
			{ label: "Sensitivity", value: "2.5g" },
			{ label: "Vibration Sampling Frequency (Raw Data)", value: "12800Hz" },
			{ label: "Vibration Sampling Frequency (Edge)", value: "6400Hz" },
			{ label: "Vibration No. of Samples (Raw Data)", value: "2048" },
			{ label: "Vibration No. of Samples (Edge)", value: "1024" },
			{ label: "Edge Calculation Interval (Minutes)", value: "5" },
		],
	},
	{
		title: "Edge Parameters",
		data: [
			{ label: "Acceleration RMS Horizontal(g)", value: "8" },
			{ label: "Acceleration RMS Vertical(g)", value: "12800" },
			{ label: "Vibration Sampling Frequency (Edge)", value: "12800" },
			{ label: "Velocity RMS Horizontal(mm/s)", value: "16384" },
			{ label: "Velocity RMS Vertical(mm/s)", value: "-" },
			{ label: "Velocity RMS Axial(mm/s)", value: "-" },
			{ label: "Acc. Peak to Peak Horizontal(g)", value: "4.00" },
			{ label: "Acc. Peak to Peak Vertical(g)", value: "-" },
			{ label: "Acc. Peak to Peak Axial(g)", value: "-" },
			{ label: "Temperature (‘C)", value: "-" },
			{ label: "Counter", value: "3" },
			{ label: "Edge alarm time out (Hours)", value: "-" },
		],
	},
	{
		title: "Utility",
		data: [
			{ label: "Currently tracking End-Point", value: "Not defined yet" },
			{ label: "Running Value", value: "-" },
			{ label: "Shift start time (24 Hr format)", value: "-" },
			{ label: "Total working hours", value: "-" },
			{ label: "Time Zone", value: "-" },
			{ label: "User Emails", value: "-" },
		],
	},
];

export default function ConfigSections() {
	const selectedSensor = useAssetStore((state) => state.selectedSensor);
	const { deviceInfo, setDeviceInfo } = useAssetStore((state) => state);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (selectedSensor) {
			console.log("Fetching data for:", selectedSensor.mac_id);
			if(selectedSensor.mac_id==undefined) return;
			fetchSensorData();
		}
	}, [selectedSensor]);

	const fetchSensorData = async () => {
		setLoading(true);
		const payload = {
			composite_key: selectedSensor?.composite_id,
			mount_id: selectedSensor?.id,
		}

		const res = await getSensorConfig(payload);
		console.log('sensor config = ', res);

		const mapped = mapAPItoConfigData(res?.config);
		console.log('mapped data = ', mapped);
		setDeviceInfo(mapped);
		setLoading(false);
	}

	useEffect(() => {
		console.log('deviceInfo in config = ', deviceInfo);
	}, [deviceInfo])

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

	if (!selectedSensor) {
		return (
			<View>
				<Text style={{ textAlign: "center", color: "#777" }}>
					Select an endpoint to view configuration
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.configContainer}>
			{
				loading ? <ActivityIndicator size="large" color="#742BDE" /> : (
					deviceInfo?.map((section: any, sectionIndex: number) => (
						<View key={sectionIndex} style={styles.section}>
							<Text style={styles.sectionTitle}>{section?.title}</Text>
							<View style={styles.configRow}>
								{section?.data?.map((item: any, index: number) => (
									<View key={index} style={styles.configBox}>
										<Text style={styles.configLabel}>{item?.label}</Text>
										<Text style={styles.configValue}>{item?.value}</Text>
									</View>
								))}
							</View>
						</View>
					))
				)
			}
		</View>
	);
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
	configContainer: {
		flexGrow: 1,
		paddingBottom: 10,
		justifyContent: "flex-start",
	},
	section: {
		marginHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 6,
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "#D9D9D9",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#000000",
		backgroundColor: "#FBF8FF",
		borderWidth: 0.3,
		borderColor: "#00214320",
		borderRadius: 2,
		paddingHorizontal: 5,
		paddingVertical: 3,
		alignSelf: "flex-start",
		marginBottom: 4,
	},
	configRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	configBox: {
		backgroundColor: "#F9F5FF70",
		borderLeftWidth: 0.5,
		borderColor: "#3F009A",
		padding: 5,
		marginVertical: 5,
		alignItems: "center",
		justifyContent: "center",
		maxWidth: (SCREEN_WIDTH / 3) - 28,
		flexGrow: 1,
	},
	configLabel: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#1C1C1C",
		// letterSpacing: 0.3,
		textShadowColor: "#00000025",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
	configValue: {
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#742BDE",
		textShadowColor: "#742BDE25",
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2,
	},
});

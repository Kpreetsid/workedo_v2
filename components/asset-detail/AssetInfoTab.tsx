import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Feather, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import InfoCards from "@/components/overview-screen/InfoCards";
import SelectEndpoint from "@/components/asset-detail/SelectEndpoint";
import { useLocalSearchParams } from "expo-router";
import { getAllEndpoints, getChildren, getGraphTrendData, getSingleAssetHealthHistory } from "@/src/services/asset.service";
import { Asset } from "@/src/types/asset";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import AssetFilter from "./AssetFilter";
import { useAssetStore } from "@/src/store/useAssetStore";

const dataAxial = [
	{ value: 0.05 },
	{ value: 0.07 },
	{ value: 0.09 },
	{ value: 0.03 },
	{ value: 0.08 },
	{ value: 0.06 },
	{ value: 0.07 },
];

const dataHorizontal = [
	{ value: 0.04 },
	{ value: 0.06 },
	{ value: 0.03 },
	{ value: 0.08 },
	{ value: 0.06 },
	{ value: 0.07 },
	{ value: 0.09 },
];

const dataVertical = [
	{ value: 0.03 },
	{ value: 0.05 },
	{ value: 0.04 },
	{ value: 0.06 },
	{ value: 0.07 },
	{ value: 0.05 },
	{ value: 0.06 },
];

interface AssetInfoTabProps {
	asset_data: Asset;
}

export default function AssetInfoTab({ asset_data }: AssetInfoTabProps) {
	const [activeTab, setActiveTab] = useState("Horizontal");
	const {
		endpoints,
		endpointSelected,
		assetHealth,
		selectedAxis,
		selectedSignal,
		selectedValueType,
		graphData,

		setGraphData,
		setEndpoints,
		setEndpointSelected,
		setAssetHealth,
		toggleAxis,
		clearAssetState,
	} = useAssetStore();

	const [chartSeries, setChartSeries] = useState<
		{ axis: string; points: { value: number; label: string }[] }[]
	>([]);
	const [xLabels, setXLabels] = useState<string[]>([]);

	// ✅ fixed color mapping
	const axisColors: Record<string, string> = {
		Horizontal: "#01d711", // green
		Vertical: "#ff0000",   // red
		Axial: "#1237ff",      // blue
	};

	// ✅ sort chartSeries in correct order
	const orderedSeries = ["Horizontal", "Vertical", "Axial"].map(
		(axis) => chartSeries.find((s) => s.axis === axis)
	);

	console.log('asset_data in info = ', asset_data)

	useEffect(() => {
		fetchEndpoints();

		return () => {
			clearAssetState(); // cleanup when leaving page
		};
	}, []);

	const fetchEndpoints = async () => {
		console.log('fetching endpoints');
		try {
			console.log('endpointSelected = ', endpointSelected);
			console.log('asset_data = ', asset_data);

			let payload: string[] = [asset_data?.id];
			console.log('payload for endpoints = ', payload);
			const endpointsRes = await getAllEndpoints(payload);
			console.log('res endpoints = ', endpointsRes);

			if (endpointsRes?.data?.length > 0) {
				setEndpoints(endpointsRes.data);
				setEndpointSelected(endpointsRes.data[0]);
			} else {
				setEndpointSelected(null);
				ToastAndroid.show("No endpoints created against selected asset.", ToastAndroid.SHORT);
			}
		} catch (err) {
			console.error("Error fetching endpoints:", err);
			ToastAndroid.show("Failed to load endpoints.", ToastAndroid.SHORT);
		}
	}

	useEffect(() => {
		console.log('endpoint selected = ', endpointSelected);

		endpointSelected != null ? calculateAssetHealth() : null;
	}, [endpointSelected])

	const calculateAssetHealth = async () => {
		try {
			if (endpointSelected?.composite_id) {
				const assetHealthRes = await getSingleAssetHealthHistory(endpointSelected?.asset_id);
				if (assetHealthRes) {
					setAssetHealth(assetHealthRes?.data);
				}
			} else {
				setAssetHealth({
					assetHealth: "Not Defined",
					assetScore: null,
					assetStatus: ["Not Defined", "Not Defined", "Not Defined", "Not Defined"],
					timeStamp: [],
				});
				ToastAndroid.show("No Sensor is mapped against this endpoint.", ToastAndroid.SHORT);
			}
		} catch (err) {
			console.error("Error fetching asset health:", err);
			ToastAndroid.show("Failed to fetch asset health.", ToastAndroid.SHORT);
		}
	};

	// 👇 Every time endpoint, axis, signal, or valueType changes → fetch graph data
	useEffect(() => {
		if (endpointSelected && selectedAxis.length > 0 && selectedSignal && selectedValueType) {
			fetchGraphTrendData();
		}
	}, [endpointSelected, selectedAxis, selectedSignal, selectedValueType]);

	const fetchGraphTrendData = async () => {
		try {
			if (!endpointSelected?.composite_id) return;

			const payload = {
				asset_id: asset_data?.id,
				fft_only: false,
				compositeList: [
					{
						asset_id: endpointSelected?.asset_id,
						composite_id: endpointSelected?.composite_id,
						axis: selectedAxis, // ✅ dynamic from store
						is_linked: true,
					},
				],
				function: {
					Vibration: [
						`${selectedSignal.toLowerCase()}-${selectedValueType.toLowerCase()}`
					],
					Temperature: ["temperature"],
					Acoustics: [],
					"Magnetic Flux": [],
					Current: [],
				},
				fromDate: "",
				toDate: "",
			};

			console.log("graph data payload = ", payload);

			const res = await getGraphTrendData(payload);
			console.log("graph trend data =", res);
			if (res) setGraphData(res['velocity-rms']);
		} catch (err) {
			console.error("Error fetching graph trend data:", err);
			ToastAndroid.show("Failed to load graph trend data.", ToastAndroid.SHORT);
		}
	};

	// 2) formatter for the API shape you showed
	const formatGraphData = (arr: any[]) => {
		return arr.map((item) => ({
			axis: item.axis, // Horizontal / Vertical / Axial
			points: item.data.map(([ts, amp]: [number, number]) => ({
				value: amp,
				label: new Date(ts).toLocaleTimeString("en-GB", {
					hour12: false,
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				}),
			})),
		}));
	};

	// 3) whenever graphData (your store value) changes → format for chart
	useEffect(() => {
		if (graphData && Array.isArray(graphData)) {
			const formatted = formatGraphData(graphData);
			setChartSeries(formatted);

			// optional: derive shared labels from the first dataset
			const labels = formatted[0].points.map((p: any) => p.label);
			setXLabels(labels);
		}
	}, [graphData]);

	// 4) optional: inspect final points
	useEffect(() => {
		if (chartSeries.length) {
			console.log("final chart = ", chartSeries);

			const orderedSeries = ["Horizontal", "Vertical", "Axial"].map(
				(axis) => chartSeries.find((s) => s.axis === axis)
			);
		}
	}, [chartSeries]);

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
			{/* Summary Card */}
			<View style={styles.summaryCard}>
				<View style={styles.rowBetween}>
					<View style={styles.cameraIcon}>
						<Feather name="camera" size={20} color="#201f23" />
					</View>

					<View>
						<Text style={styles.summaryTitle}>Assets Health</Text>
						{assetHealth && (
							<Text
								style={[
									styles.summaryValue,
									assetHealth.assetHealth === "Healthy" && styles.healthy,
									assetHealth.assetHealth === "Alert" && styles.alert,
									assetHealth.assetHealth === "Danger" && styles.danger,
									assetHealth.assetHealth === "Critical" && styles.critical,
									assetHealth.assetHealth === "Not Defined" && styles.not_defined,
								]}
							>
								{assetHealth?.assetScore ? assetHealth.assetScore : "-"}
							</Text>
						)}
					</View>

					<View>
						<Text style={styles.summaryTitle}>Temperature</Text>
						<View style={[styles.rowBetween, { gap: 5 }]}>
							<FontAwesome name="thermometer-half" size={15} color="#CA8A04" />
							<Text style={[styles.summaryValue, { color: "#FFB84D" }]}>39°C</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Asset Details */}
			<View style={styles.detailsRow}>
				<DetailPill icon="orcid" label="Asset ID" value={asset_data?.id} iconColor="#742bde" />
				<DetailPill icon="screwdriver-wrench" label="Asset Type" value={asset_data?.asset_type || "-"} iconColor="#FF8D54" />
				<DetailPill icon="location-dot" label="Location" value={asset_data?.locationData?.location_name || "-"} iconColor="#EE2E6B" />
			</View>

			{/* Endpoint Selector */}
			<SelectEndpoint
				endpointSelected={endpointSelected}
				endpoints={endpoints}
				asset_data={asset_data}
				onEndpointSelect={setEndpointSelected}
			/>

			{/* Axis Selection Tabs */}
			<View style={styles.modeTabs}>
				{["Horizontal", "Vertical", "Axial"].map((tab) => {
					const isActive = selectedAxis.includes(tab);
					return (
						<Pressable
							key={tab}
							style={[styles.modeTab, isActive && styles.modeTabActive]}
							onPress={() => toggleAxis(tab)}
						>
							<Text style={[styles.modeTabText, isActive && styles.modeTabTextActive]}>
								{tab}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{/* Signal / ValueType Filter */}
			<AssetFilter />

			{/* Chart */}
			<View style={styles.chartContainer}>
				<LineChart
					curved
					data={orderedSeries[0]?.points || []}
					data2={orderedSeries[1]?.points || []}
					data3={orderedSeries[2]?.points || []}
					color1={axisColors[orderedSeries[0]?.axis || "Horizontal"]}
					color2={axisColors[orderedSeries[1]?.axis || "Vertical"]}
					color3={axisColors[orderedSeries[2]?.axis || "Axial"]}
					dataPointsColor1={axisColors[orderedSeries[0]?.axis || "Horizontal"]}
					dataPointsColor2={axisColors[orderedSeries[1]?.axis || "Vertical"]}
					dataPointsColor3={axisColors[orderedSeries[2]?.axis || "Axial"]}
					thickness={2}
					hideRules={false}
					hideDataPoints={false}
					yAxisTextStyle={{ color: "#A0A0A0", fontSize: 8 }}
					xAxisLabelTextStyle={{ color: "#A0A0A0", fontSize: 8 }}
					backgroundColor="transparent"
					rulesColor="#F0F0F0"
					initialSpacing={20}
					endSpacing={20}
					noOfSections={4}
					spacing={40}
					areaChart={false}
					hideAxesAndRules={false}
					xAxisColor="#EAEAEA"
					yAxisColor="#EAEAEA"
					xAxisThickness={1}
					yAxisThickness={1}
					yAxisLabelWidth={40}
					height={180}
					xAxisLabelTexts={xLabels}
				/>


				<View style={styles.legendRow}>
					{orderedSeries.filter(Boolean).map((s: any) => (
						<View key={s.axis} style={styles.legendItem}>
							<View style={[styles.dot, { backgroundColor: axisColors[s.axis] }]} />
							<Text style={styles.legendText}>{selectedValueType}-{s.axis}</Text>
						</View>
					))}
				</View>


				{/* <View style={styles.legendRow}>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#E056FD" }]} />
						<Text style={styles.legendText}>Axial</Text>
						<Text style={styles.legendValue}>1.11</Text>
					</View>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#742BDE" }]} />
						<Text style={styles.legendText}>Horizontal</Text>
						<Text style={styles.legendValue}>3.69</Text>
					</View>
					<View style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: "#FF9D00" }]} />
						<Text style={styles.legendText}>Vertical</Text>
						<Text style={styles.legendValue}>3.69</Text>
					</View>
				</View> */}
			</View>
		</ScrollView>
	)
}

const DetailPill = ({
	icon,
	label,
	value,
	iconColor,
}: {
	icon: string;
	label: string;
	value: string;
	iconColor: string;
}) => (
	<View style={styles.detailPill}>
		<FontAwesome6 name={icon as any} size={14} color={iconColor} />
		<View style={styles.detailTextWrapper}>
			<Text style={styles.detailLabel}>{label}</Text>
			<Text
				style={styles.detailValue}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{value}
			</Text>
		</View>
	</View>
);

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	summaryCard: {
		backgroundColor: "#FEFCE8",
		borderRadius: 10,
		paddingVertical: 15,
		paddingHorizontal: 25,
		borderWidth: 1.1,
		borderColor: "#FFE000",
		marginHorizontal: 20
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		gap: 25
	},
	cameraIcon: {
		backgroundColor: "#fff",
		height: 36,
		width: 43,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
		borderColor: "#000",
		borderWidth: 0.1
	},
	summaryTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201f23"
	},
	summaryValue: {
		fontFamily: Fonts.semiBold,
		color: "#CA8A04",
		lineHeight: 18
	},

	healthy: {
		fontSize: 14,
		margin: 0,
		color: '#51FC4C'
	},
	alert: {
		color: '#F7FA4B'
	},
	danger: {
		color: '#FA8349'
	},
	critical: {
		color: '#ff181e'
	},
	not_defined: {
		color: '#B0B0B0'
	},
	detailsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		margin: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
		alignItems: "center",
		elevation: 2,
	},
	detailPill: {
		width: "30%",
		padding: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},

	detailTextWrapper: {
		flex: 1,
		flexShrink: 1, // allows truncation instead of wrapping
	},
	detailLabel: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#201f23"
	},
	detailValue: {
		fontSize: 11,
		color: "#201f23",
		fontFamily: Fonts.semiBold,
		lineHeight: 15
	},
	modeTabs: {
		flexDirection: "row",
		margin: 20,
		gap: 10,
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-around",
	},
	modeTab: {
		backgroundColor: "#fff",
		paddingVertical: 6,
		borderRadius: 5,
		borderWidth: 0.3,
		borderColor: "#00000020",
		width: (width / 3) - 30,
	},
	modeTabActive: {
		backgroundColor: "#742BDE"
	},
	modeTabText: {
		color: "#00000060",
		fontSize: 10,
		fontFamily: Fonts.regular,
		textAlign: "center",
	},
	modeTabTextActive: {
		color: "#fff",
		fontFamily: Fonts.semiBold
	},
	chartContainer: {
		marginTop: 20,
		backgroundColor: "#fff",
		marginHorizontal: 20,
		borderRadius: 10,
		paddingHorizontal: 20,
		paddingVertical: 10
	},
	legendRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 10,
		paddingVertical: 4,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4
	},
	legendText: {
		fontSize: 10,
		color: "#666"
	},
	legendValue: {
		fontSize: 10,
		fontWeight: "600",
		color: "#000",
		marginLeft: 4
	},
});

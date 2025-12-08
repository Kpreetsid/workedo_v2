import { Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Feather, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import InfoCards from "@/components/overview-screen/InfoCards";
import SelectEndpoint from "@/components/asset-detail/SelectEndpoint";
import { useLocalSearchParams } from "expo-router";
import { getAllEndpoints, getAssetData, getChildren, getGraphTrendData, getSingleAssetHealthHistory } from "@/src/services/asset.service";
import { Asset } from "@/src/types/asset";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import AssetFilter from "./SignalFilter";
import { useAssetStore } from "@/src/store/useAssetStore";
import { formatGraphData } from "@/src/utils/helper";
import AssetUserInfo from "../AssetUserInfo";
import AssignedUsersModal from "../../work-order-detail/AssignUserModal";
import AssetSummary from "./AssetSummary";
import AssetUsers from "./AssetUsers";
import EndpointSelector from "./EndpointSelector";
import AssetFilters from "./AssetFilters";
import AssetTrendChart from "./AssetTrendChart";

interface AssetInfoTabProps {
	asset_data: Asset;
}

export default function AssetInfoTab({ asset_data }: AssetInfoTabProps) {
	const [userModalVisible, setUserModalVisible] = useState(false);

	// console.log('inside info tab', asset_data);
	const [activeTab, setActiveTab] = useState("Horizontal");
	const [tooltip, setTooltip] = useState<any>(null);
	const [yMaxValue, setYMaxValue] = useState<number>(0);
	const {
		endpoints,
		endpointSelected,
		assetHealth,
		selectedAxis,
		selectedSignal,
		selectedValueType,
		graphData,

		setSelectedSignal,
		setSelectedValueType,
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

	console.log('orderedSeries = ', orderedSeries);

	// console.log('asset_data in info = ', asset_data)

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
			// console.log('asset_data = ', asset_data);

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

	// 3) whenever graphData (your store value) changes → format for chart
	useEffect(() => {
		if (graphData && Array.isArray(graphData)) {
			const formatted = formatGraphData(graphData);
			setChartSeries(formatted);

			const points = formatted[0].points;

			// X-axis labels: show every 15th point
			const thinnedLabels = points
				.map((p: any, index: number) => (index % 15 === 0 ? p.fullDate : null))
				.filter(Boolean);

			setXLabels(thinnedLabels);

			// Y-axis: get max across ALL existing axes
			const allValues = formatted.flatMap((series: any) =>
				series.points.map((p: any) => p.value)
			);

			const rawMax = Math.max(...allValues);
			const yMax = Math.ceil(rawMax);

			setYMaxValue(yMax);
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

	useEffect(() => {
		console.log('xLabels = ', xLabels);
	}, [xLabels])

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
			<AssetSummary asset={asset_data} assetHealth={assetHealth} />
			<AssetUsers users={asset_data?.userList || []} />

			{/* Endpoint Selector */}
			<EndpointSelector
				endpoints={endpoints}
				endpointSelected={endpointSelected}
				asset={asset_data}
				onSelect={setEndpointSelected}
			/>

			<AssetFilters
				selectedAxis={selectedAxis}
				toggleAxis={toggleAxis}
				selectedSignal={selectedSignal}
				selectedValueType={selectedValueType}
				setSelectedSignal={setSelectedSignal}
				setSelectedValueType={setSelectedValueType}
			/>

			<AssetTrendChart
				chartSeries={chartSeries}
				xLabels={xLabels}
				yMaxValue={yMaxValue}
				selectedValueType={selectedValueType}
			/>

		</ScrollView >
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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

import { Dimensions, FlatList, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAssetChildren, getAllEndpoints, getAssetData, getChildren, getGraphTrendData, getSingleAssetHealthHistory } from "@/src/services/asset.service";
import { Asset } from "@/src/types/asset";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { useAssetStore } from "@/src/store/useAssetStore";
import { formatGraphData } from "@/src/utils/helper";
import AssetSummary from "./AssetSummary";
import AssetUsers from "./AssetUsers";
import EndpointSelector from "./EndpointSelector";
import AssetFilters from "./AssetFilters";
import AssetDataChart from "./AssetDataChart";
import { useGestureLock } from "@/src/store/useGestureLock";
import { useTrendSocket } from "@/hooks/useTrendSocket";

interface AssetInfoTabProps {
	asset_data: Asset;
	composite_idFromParams?: string;
	refreshing: boolean;
	onRefresh: () => void;
}

export default function AssetInfoTab({ asset_data, composite_idFromParams, refreshing, onRefresh }: AssetInfoTabProps) {
	console.log('composite_idFromParams on asset infotab = ', composite_idFromParams);
	const graphBufferRef = useRef<any[]>([]);
	const [fftEnabled, setFftEnabled] = useState(false);
	const [childs, setChilds] = useState<any[]>([]);
	const [temperatureValue, setTemperatureValue] = useState<number | null>(null);

	const gestureLocked = useGestureLock((s) => s.locked);

	const [graphLoading, setGraphLoading] = useState(false);

	const [userModalVisible, setUserModalVisible] = useState(false);

	const [activeTab, setActiveTab] = useState("Horizontal");
	const [tooltip, setTooltip] = useState<any>(null);
	const [yMaxValue, setYMaxValue] = useState<number>(0);
	const [graphData, setGraphData] = useState<any[]>([]);
	const {
		endpoints,
		endpointSelected,
		assetHealth,
		selectedAxis,
		selectedSignal,
		selectedValueType,

		setSelectedSignal,
		setSelectedValueType,
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
		Vertical: "#1237ff",   // red
		Axial: "#ff0000",      // blue
	};

	// ✅ sort chartSeries in correct order
	const orderedSeries = ["Horizontal", "Vertical", "Axial"].map(
		(axis) => chartSeries.find((s) => s.axis === axis)
	);

	useEffect(() => {
		fetchiChilds();

		return () => {
			clearAssetState(); // cleanup when leaving page
			setChartSeries([])
			setXLabels([])
			setYMaxValue(0)
		};
	}, []);

	const fetchiChilds = async () => {
		try {
			const res = await fetchAssetChildren(asset_data?.id);
			console.log('res fetch children = ', res)
			if (res.status) {
				console.log('res assets children = ', res?.data);
				setChilds(res?.data);
				fetchEndpoints(res?.data);
			}
		} catch (err: any) {

			console.error("Login failed:", err);
		}
	}

	useEffect(() => {
		if (selectedAxis) {
			console.log('in changing selected axis = ', selectedAxis)
		}
	}, [selectedAxis])

	const fetchEndpoints = async (childs: any[]) => {

		try {
			let payload: string[] = [...childs.map((child: any) => child.id)];
			// let payload: string[] = [asset_data?.id]; // instead of only sending parent asset id, send parent and child asset id now because new api is introduced to fetch both parent and child asset ids.
			console.log('payload for endpoints = ', payload);
			const endpointsRes = await getAllEndpoints(payload);
			console.log('res endpoints = ', endpointsRes);

			if (endpointsRes?.data?.length > 0) {
				setEndpoints(endpointsRes.data);

				if (composite_idFromParams) {
					// find endpoint with sensor_location matching sensor_location
					const endpoint = endpointsRes.data.find((endpoint: any) => (endpoint.composite_id && endpoint.composite_id) === composite_idFromParams);
					console.log('composite_idFromParams from behind = ', composite_idFromParams)
					console.log('found endpoint = ', endpoint);
					setEndpointSelected(endpoint);
				} else {
					setEndpointSelected(endpointsRes.data[0]);
				}
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
			setGraphLoading(true);     // 🔥 start loader
			// fetchGraphTrendData();
			return;
		}

		// Clear graph when filters are incomplete/deselected
		setGraphLoading(false);
		setGraphData([]);
		setChartSeries([]);
		setXLabels([]);
		setYMaxValue(0);
	}, [endpointSelected, selectedAxis, selectedSignal, selectedValueType]);


	// ---------------------------
	// SOCKET PAYLOAD (DECLARATIVE)
	// ---------------------------
	const graphKey = `${selectedSignal?.toLowerCase()}-${selectedValueType?.toLowerCase()}`;

	const trendPayload = useMemo(() => {
		if (
			!endpointSelected?.composite_id ||
			!selectedAxis.length ||
			!selectedSignal ||
			!selectedValueType
		)
			return null;

		return {
			asset_id: asset_data?.id,
			fft_only: fftEnabled,
			compositeList: [
				{
					asset_id: endpointSelected.asset_id,
					composite_id: endpointSelected.composite_id,
					axis: selectedAxis,
					is_linked: false,
				},
			],
			function: {
				Vibration: [graphKey],
				Temperature: ["temperature"],
				Acoustics: [],
				"Magnetic Flux": [],
				Current: [],
			},
			fromDate: "",
			toDate: "",
		};
	}, [
		asset_data?.id,
		endpointSelected?.asset_id,
		endpointSelected?.composite_id,
		selectedAxis,
		selectedSignal,
		selectedValueType,
		fftEnabled
	]);

	// ---------------------------
	// SOCKET CONNECTION
	// ---------------------------
	useTrendSocket({
		payload: trendPayload,
		enabled: !!trendPayload,
		onStatus: (status) => {
			console.log('status 123 = ', status)
			// if (status === "connected") setGraphLoading(true);
		},

		onData: (message) => {
			if (!message?.data || !Array.isArray(message.data)) return;

			if (message.metric === "temperature") {
				if (message.data.length === 0) {
					setTemperatureValue(null);
					setGraphLoading(false);
					return;
				}

				const points = Array.isArray(message.data[0]?.data)
					? message.data[0].data
					: [];
				const lastPoint = points[points.length - 1];
				const latestValue = Array.isArray(lastPoint) ? lastPoint[1] : null;

				setTemperatureValue(
					typeof latestValue === "number" ? latestValue : null
				);
				setGraphLoading(false);
				return;
			}

			if (message.data.length === 0) {
				setGraphLoading(false);
				setGraphData([]);
				return;
			}
			// push each axis payload into buffer
			message.data.forEach((series: any) => {
				graphBufferRef.current.push(series);
			});

			// flush ONLY when backend says we're done
			if (
				message.chunk_info?.is_final_chunk &&
				message.chunk_info?.is_final_series
			) {
				const finalGraphData = [...graphBufferRef.current];
				graphBufferRef.current = [];

				setGraphLoading(false);
				setGraphData(finalGraphData);
			}
		},
	});

	useEffect(() => {
		if (trendPayload) {
			setGraphLoading(true);
			graphBufferRef.current = []; // reset buffer for new request
		}
	}, [trendPayload]);

	// ---------------------------
	// FORMAT GRAPH DATA
	// ---------------------------
	useEffect(() => {
		if (!Array.isArray(graphData) || !graphData.length) {
			setChartSeries([]);
			return;
		}

		const formatted = formatGraphData(graphData);
		setChartSeries(formatted);

		const points = formatted[0]?.points || [];
		setXLabels(
			points
				.map((p: any, i: number) => (i % 15 === 0 ? p.fullDate : null))
				.filter(Boolean)
		);

		const allValues = formatted.flatMap((s: any) =>
			s.points.map((p: any) => p.value)
		);
		setYMaxValue(Math.max(...allValues));
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
	}, [xLabels])

	return (
		<ScrollView
			scrollEnabled={!gestureLocked}
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 50 }}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<AssetSummary asset={asset_data} assetHealth={assetHealth} temperature={temperatureValue} />
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

			{/* <AssetTrendChart
				chartSeries={chartSeries}
				xLabels={xLabels}
				yMaxValue={yMaxValue}
				selectedValueType={selectedValueType}
				loading={graphLoading}
			/> */}

			<View style={styles.fftToggleRow}>
				<Text style={styles.fftLabel}>FFT</Text>

				<TouchableOpacity
					onPress={() => setFftEnabled((prev) => !prev)}
					style={[
						styles.fftToggle,
						fftEnabled && styles.fftToggleActive,
					]}
				>
					<Text style={styles.fftToggleText}>
						{fftEnabled ? "ON" : "OFF"}
					</Text>
				</TouchableOpacity>
			</View>


			<AssetDataChart
				chartSeries={orderedSeries.filter(Boolean)}
				xLabels={xLabels}
				yMaxValue={yMaxValue}
				loading={graphLoading}
				asset_data={asset_data}
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
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	fftToggleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 20,
		marginHorizontal: 30,
		marginTop: 15,
	},

	fftLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "#333",
	},

	fftToggle: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 14,
		backgroundColor: "#ddd",
	},

	fftToggleActive: {
		backgroundColor: "#01d711",
	},

	fftToggleText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#000",
	},

});

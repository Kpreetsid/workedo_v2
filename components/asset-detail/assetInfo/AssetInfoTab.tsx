import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import Fonts from "@/constants/Typography";
import { endpoints } from "@/src/api/endpoints";
import {
	fetchAssetChildren,
	getAllEndpoints,
	getGraphTrendData,
	getSingleAssetHealthHistory,
} from "@/src/services/asset.service";
import { Asset } from "@/src/types/asset";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { useAssetStore } from "@/src/store/useAssetStore";
import { formatGraphData } from "@/src/utils/helper";
import AssetTrendChart from "./AssetTrendChart";

interface AssetInfoTabProps {
	asset_data: Asset;
	composite_idFromParams?: string;
	refreshing: boolean;
	onRefresh: () => void;
}

type FeatureId =
	| "velocity-rms"
	| "acceleration-rms"
	| "acceleration-peak_to_peak"
	| "temperature";

type TrendPoint = {
	value: number;
	label: string;
	fullDate?: string;
	timestamp?: string;
	rawTimestamp?: number;
	flag?: boolean;
};

type TrendSeries = {
	axis: string;
	unit?: string;
	points: TrendPoint[];
};

type FeatureDefinition = {
	id: FeatureId;
	label: string;
	shortLabel: string;
	helper: string;
	accent: string;
};

const FEATURE_OPTIONS: FeatureDefinition[] = [
	{
		id: "velocity-rms",
		label: "Velocity RMS",
		shortLabel: "Velocity",
		helper: "Overall RMS vibration trend",
		accent: "#2563EB",
	},
	{
		id: "acceleration-rms",
		label: "Acceleration RMS",
		shortLabel: "Accel RMS",
		helper: "Impact-sensitive RMS trend",
		accent: "#16A34A",
	},
	{
		id: "acceleration-peak_to_peak",
		label: "Acceleration Peak to Peak",
		shortLabel: "Accel P2P",
		helper: "Peak-to-peak acceleration trend",
		accent: "#DC2626",
	},
	{
		id: "temperature",
		label: "Temperature",
		shortLabel: "Temp",
		helper: "Sensor temperature trend",
		accent: "#F97316",
	},
];

const AXIS_OPTIONS = ["Horizontal", "Vertical", "Axial"];
const AXIS_COLORS: Record<string, string> = {
	Horizontal: "#16A34A",
	Vertical: "#2563EB",
	Axial: "#DC2626",
};
const FALLBACK_IMAGE_URI =
	"https://new.presageinsights.ai/cmms/assets/images/Asset_page/Pumps.png";
const FEATURE_SIGNAL_MAP: Record<
	Exclude<FeatureId, "temperature">,
	{ signal: string; valueType: string }
> = {
	"velocity-rms": { signal: "Velocity", valueType: "Rms" },
	"acceleration-rms": { signal: "Acceleration", valueType: "Rms" },
	"acceleration-peak_to_peak": {
		signal: "Acceleration",
		valueType: "Peak_to_peak",
	},
};

function buildFunctionPayload(featureId: FeatureId) {
	return {
		Vibration: featureId === "temperature" ? [] : [featureId],
		Temperature: featureId === "temperature" ? ["temperature"] : [],
		Acoustics: [],
		"Magnetic Flux": [],
		Current: [],
	};
}

function titleCase(value: string) {
	return value
		.replace(/[_-]/g, " ")
		.split(" ")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");
}

function normalizeAxisLabel(axis?: string, fallback?: string) {
	const value = (axis || fallback || "Series").toLowerCase();
	if (value.includes("horizontal")) return "Horizontal";
	if (value.includes("vertical")) return "Vertical";
	if (value.includes("axial")) return "Axial";
	if (value.includes("temperature")) return "Temperature";
	return titleCase(axis || fallback || "Series");
}

function isTrendSeriesArray(value: any): value is any[] {
	return (
		Array.isArray(value) &&
		value.every((item) => item && typeof item === "object" && Array.isArray(item.data))
	);
}

function extractTrendSeries(response: any, featureId: FeatureId) {
	const candidates = [
		response?.[featureId],
		response?.data?.[featureId],
		response?.result?.[featureId],
		response?.metric === featureId ? response?.data : null,
		Array.isArray(response?.data) ? response.data : null,
		Array.isArray(response) ? response : null,
	];

	for (const candidate of candidates) {
		if (isTrendSeriesArray(candidate)) {
			return candidate;
		}
	}

	if (response && typeof response === "object") {
		for (const value of Object.values(response)) {
			if (isTrendSeriesArray(value)) {
				return value;
			}
		}
	}

	return [];
}

function formatMetricValue(value: number | null | undefined) {
	if (typeof value !== "number" || Number.isNaN(value)) return "N/A";
	if (Math.abs(value) >= 100) return value.toFixed(0);
	if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
	return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function getHealthTone(assetHealth?: string) {
	switch ((assetHealth || "").toLowerCase()) {
		case "healthy":
			return { backgroundColor: "#DCFCE7", textColor: "#166534" };
		case "alert":
			return { backgroundColor: "#FEF3C7", textColor: "#92400E" };
		case "danger":
			return { backgroundColor: "#FEE2E2", textColor: "#B91C1C" };
		case "critical":
			return { backgroundColor: "#EDE9FE", textColor: "#6D28D9" };
		default:
			return { backgroundColor: "#E2E8F0", textColor: "#475569" };
	}
}

function orderAxes(axes: string[]) {
	return AXIS_OPTIONS.filter((axis) => axes.includes(axis));
}

function buildChartModel(rawSeries: any[]) {
	const formatted = formatGraphData(
		rawSeries.map((series: any, index: number) => ({
			...series,
			axis: normalizeAxisLabel(series.axis, series.name || `Series ${index + 1}`),
		}))
	).map((series: any) => {
		const totalPoints = series.points.length;
		const interval = totalPoints > 5 ? Math.ceil(totalPoints / 5) : 1;
		return {
			...series,
			points: series.points.map((point: TrendPoint, index: number) => ({
				...point,
				label:
					index === 0 ||
					index === totalPoints - 1 ||
					index % interval === 0
						? point.label
						: "",
			})),
		};
	});

	const values = formatted.flatMap((series: TrendSeries) =>
		series.points.map((point) => point.value)
	);

	return {
		series: formatted as TrendSeries[],
		maxValue: values.length ? Math.max(...values) : 0,
	};
}

export default function AssetInfoTab({
	asset_data,
	composite_idFromParams,
	refreshing,
	onRefresh,
}: AssetInfoTabProps) {
	const [endpointsList, setEndpointsList] = useState<AssetEndpoint[]>([]);
	const [endpointSelected, setEndpointSelected] = useState<AssetEndpoint | null>(null);
	const [assetHealth, setAssetHealth] = useState<any>(null);
	const [temperatureSnapshot, setTemperatureSnapshot] = useState<number | null>(null);
	const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureId>("velocity-rms");
	const [selectedAxes, setSelectedAxes] = useState<string[]>(AXIS_OPTIONS);
	const [chartSeries, setChartSeries] = useState<TrendSeries[]>([]);
	const [graphLoading, setGraphLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [graphError, setGraphError] = useState<string | null>(null);
	const [fftEnabled, setFftEnabled] = useState(false);
	const [yMaxValue, setYMaxValue] = useState(0);
	const setAssetEndpointStore = useAssetStore((state) => state.setEndpointSelected);
	const setSelectedAxisStore = useAssetStore((state) => state.setSelectedAxis);
	const setSelectedSignalStore = useAssetStore((state) => state.setSelectedSignal);
	const setSelectedValueTypeStore = useAssetStore(
		(state) => state.setSelectedValueType
	);

	const selectedFeature =
		FEATURE_OPTIONS.find((feature) => feature.id === selectedFeatureId) ||
		FEATURE_OPTIONS[0];
	const timezone =
		asset_data?.asset_timezone ||
		asset_data?.org_timezone ||
		Intl.DateTimeFormat().resolvedOptions().timeZone ||
		"Asia/Kolkata";
	const showAxisFilters = selectedFeatureId !== "temperature";
	const fftAvailable = showAxisFilters;
	const imageUri = useMemo(() => {
		if (!asset_data?.image_path) {
			return FALLBACK_IMAGE_URI;
		}
		return `${endpoints.baseURL}assets/${asset_data.image_path}`;
	}, [asset_data?.image_path]);
	const healthTone = getHealthTone(assetHealth?.assetHealth);

	const requestMetricSeries = useCallback(
		async (endpoint: AssetEndpoint, featureId: FeatureId, axes: string[]) => {
			const payload = {
				asset_id: asset_data?.id,
				timezone,
				fft_only: fftEnabled && featureId !== "temperature",
				compositeList: [
					{
						asset_id: endpoint.asset_id,
						composite_id: endpoint.composite_id,
						axis: axes,
						is_linked: endpoint.is_linked ?? false,
					},
				],
				function: buildFunctionPayload(featureId),
				fromDate: "",
				toDate: "",
			};

			const response = await getGraphTrendData(payload);
			return extractTrendSeries(response, featureId);
		},
		[asset_data?.id, fftEnabled, timezone]
	);

	const loadEndpointContext = useCallback(async () => {
		setPageLoading(true);
		setGraphError(null);

		try {
			let children: any[] = [];
			try {
				const childrenResponse = await fetchAssetChildren(asset_data?.id);
				children =
					childrenResponse?.status && Array.isArray(childrenResponse?.data)
						? childrenResponse.data
						: [];
			} catch (error) {
				children = [];
			}

			const assetIds = Array.from(
				new Set([asset_data?.id, ...children.map((child: any) => child.id)].filter(Boolean))
			);
			const endpointsResponse = await getAllEndpoints(assetIds as string[]);
			const availableEndpoints = Array.isArray(endpointsResponse?.data)
				? endpointsResponse.data
				: [];

			setEndpointsList(availableEndpoints);

			if (!availableEndpoints.length) {
				setEndpointSelected(null);
				setGraphError("No endpoints are mapped to this asset yet.");
				return;
			}

			const preferredEndpoint = composite_idFromParams
				? availableEndpoints.find(
						(endpoint: AssetEndpoint) => endpoint.composite_id === composite_idFromParams
					)
				: null;
			setEndpointSelected(preferredEndpoint || availableEndpoints[0]);
		} catch (error) {
			console.error("Error loading asset endpoint context:", error);
			setGraphError("Unable to load endpoint information for this asset.");
		} finally {
			setPageLoading(false);
		}
	}, [asset_data?.id, composite_idFromParams]);

	useEffect(() => {
		loadEndpointContext();
	}, [loadEndpointContext]);

	useEffect(() => {
		if (refreshing) {
			loadEndpointContext();
		}
	}, [refreshing, loadEndpointContext]);

	useEffect(() => {
		setAssetEndpointStore(endpointSelected);
	}, [endpointSelected, setAssetEndpointStore]);

	useEffect(() => {
		setSelectedAxisStore(showAxisFilters ? selectedAxes : AXIS_OPTIONS);
	}, [selectedAxes, setSelectedAxisStore, showAxisFilters]);

	useEffect(() => {
		if (selectedFeatureId === "temperature") {
			if (fftEnabled) {
				setFftEnabled(false);
			}
			return;
		}

		const vibrationConfig =
			FEATURE_SIGNAL_MAP[selectedFeatureId as Exclude<FeatureId, "temperature">];
		if (!vibrationConfig) return;

		setSelectedSignalStore(vibrationConfig.signal);
		setSelectedValueTypeStore(vibrationConfig.valueType);
	}, [
		fftEnabled,
		selectedFeatureId,
		setSelectedSignalStore,
		setSelectedValueTypeStore,
	]);

	useEffect(() => {
		let cancelled = false;

		async function loadHeroMetrics() {
			if (!endpointSelected?.asset_id || !endpointSelected?.composite_id) {
				if (!cancelled) {
					setAssetHealth(null);
					setTemperatureSnapshot(null);
				}
				return;
			}

			try {
				const [assetHealthResponse, temperatureSeries] = await Promise.all([
					getSingleAssetHealthHistory(endpointSelected.asset_id).catch(() => null),
					requestMetricSeries(endpointSelected, "temperature", AXIS_OPTIONS).catch(() => []),
				]);

				if (cancelled) return;

				setAssetHealth(assetHealthResponse?.data || null);
				const { series } = buildChartModel(temperatureSeries);
				const latestPoint = series[0]?.points?.[series[0].points.length - 1];
				setTemperatureSnapshot(
					typeof latestPoint?.value === "number" ? latestPoint.value : null
				);
			} catch (error) {
				if (!cancelled) {
					console.error("Error loading asset hero metrics:", error);
				}
			}
		}

		loadHeroMetrics();
		return () => {
			cancelled = true;
		};
	}, [endpointSelected?.asset_id, endpointSelected?.composite_id, requestMetricSeries]);

	useEffect(() => {
		let cancelled = false;

		async function loadTrendData() {
			if (!endpointSelected?.composite_id) {
				setChartSeries([]);
				setYMaxValue(0);
				setGraphError("Select an endpoint to view trend data.");
				return;
			}

			if (showAxisFilters && selectedAxes.length === 0) {
				setChartSeries([]);
				setYMaxValue(0);
				setGraphError("Pick at least one axis to view vibration trends.");
				return;
			}

			setGraphLoading(true);
			setGraphError(null);

			try {
				const rawSeries = await requestMetricSeries(
					endpointSelected,
					selectedFeatureId,
					showAxisFilters ? selectedAxes : AXIS_OPTIONS
				);

				if (cancelled) return;

				if (!rawSeries.length) {
					setChartSeries([]);
					setYMaxValue(0);
					setGraphError(
						`No ${selectedFeature.label.toLowerCase()} data found for the selected endpoint.`
					);
					return;
				}

				const { series, maxValue } = buildChartModel(rawSeries);
				setChartSeries(series);
				setYMaxValue(maxValue);

				if (selectedFeatureId === "temperature") {
					const latestPoint = series[0]?.points?.[series[0].points.length - 1];
					setTemperatureSnapshot(
						typeof latestPoint?.value === "number" ? latestPoint.value : null
					);
				}
			} catch (error) {
				if (!cancelled) {
					console.error("Error loading asset trend data:", error);
					setChartSeries([]);
					setYMaxValue(0);
					setGraphError(
						`Unable to load ${selectedFeature.label.toLowerCase()} for this endpoint.`
					);
				}
			} finally {
				if (!cancelled) {
					setGraphLoading(false);
				}
			}
		}

		loadTrendData();
		return () => {
			cancelled = true;
		};
	}, [
		endpointSelected?.composite_id,
		requestMetricSeries,
		selectedAxes,
		selectedFeature.label,
		selectedFeatureId,
		showAxisFilters,
	]);

	const toggleAxis = (axis: string) => {
		setSelectedAxes((current) => {
			if (current.includes(axis)) {
				if (current.length === 1) {
					return current;
				}
				return current.filter((value) => value !== axis);
			}
			return orderAxes([...current, axis]);
		});
	};

	const handleRefresh = () => {
		onRefresh();
		loadEndpointContext();
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
			refreshControl={
				<RefreshControl
					refreshing={refreshing || pageLoading}
					onRefresh={handleRefresh}
				/>
			}
		>
			<View style={styles.heroCard}>
				<View style={styles.heroHeader}>
					<View style={styles.heroTextWrap}>
						<Text style={styles.kicker}>Live Asset Story</Text>
						<Text style={styles.assetName}>{asset_data?.asset_name}</Text>
						<Text style={styles.assetMeta}>
							{asset_data?.asset_type || "Unknown type"}
							{asset_data?.locationId?.location_name
								? ` • ${asset_data.locationId.location_name}`
								: ""}
						</Text>
					</View>

					<Image source={{ uri: imageUri }} style={styles.assetImage} />
				</View>

				<View style={styles.scoreStrip}>
					<View style={styles.scoreCard}>
						<Text style={styles.scoreLabel}>Health</Text>
						<View
							style={[
								styles.healthBadge,
								{ backgroundColor: healthTone.backgroundColor },
							]}
						>
							<Text
								style={[
									styles.healthBadgeText,
									{ color: healthTone.textColor },
								]}
							>
								{assetHealth?.assetHealth || "Not Defined"}
							</Text>
						</View>
					</View>

					<View style={styles.scoreCard}>
						<Text style={styles.scoreLabel}>Score</Text>
						<Text style={styles.scoreValue}>
							{assetHealth?.assetScore ? `${assetHealth.assetScore}` : "N/A"}
						</Text>
					</View>

					<View style={styles.scoreCard}>
						<Text style={styles.scoreLabel}>Temperature</Text>
						<Text style={styles.scoreValueWarm}>
							{temperatureSnapshot !== null
								? `${formatMetricValue(temperatureSnapshot)} °C`
								: "N/A"}
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.endpointCard}>
				<View style={styles.sectionTitleRow}>
					<Text style={styles.sectionTitle}>Endpoints</Text>
					<Text style={styles.sectionHint}>{endpointsList.length} available</Text>
				</View>

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.endpointChipRow}
				>
					{endpointsList.map((endpoint) => {
						const active =
							endpointSelected?.composite_id === endpoint.composite_id;
						return (
							<Pressable
								key={endpoint.composite_id}
								onPress={() => setEndpointSelected(endpoint)}
								style={[
									styles.endpointChip,
									active && styles.endpointChipActive,
								]}
							>
								<Text
									style={[
										styles.endpointChipTitle,
										active && styles.endpointChipTitleActive,
									]}
								>
									{endpoint.point_name}
								</Text>
								<Text
									style={[
										styles.endpointChipSubtitle,
										active && styles.endpointChipSubtitleActive,
									]}
								>
									{endpoint.mount_location}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
			</View>

			<View style={styles.analysisSection}>
				<View style={styles.sectionTitleRow}>
					<Text style={styles.sectionTitle}>Trend Cockpit</Text>
					<Text style={styles.sectionHint}>4 fixed trends</Text>
				</View>

				<View style={styles.featureRow}>
					{FEATURE_OPTIONS.map((feature) => {
						const active = feature.id === selectedFeatureId;
						return (
							<TouchableOpacity
								key={feature.id}
								onPress={() => setSelectedFeatureId(feature.id)}
								style={[
									styles.featureChip,
									active && {
										backgroundColor: feature.accent,
										borderColor: feature.accent,
									},
								]}
							>
								<Text
									style={[
										styles.featureChipText,
										active && styles.featureChipTextActive,
									]}
								>
									{feature.shortLabel}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<Text style={styles.featureHelper}>{selectedFeature.helper}</Text>

				{showAxisFilters ? (
					<View style={styles.axisRow}>
						{AXIS_OPTIONS.map((axis) => {
							const active = selectedAxes.includes(axis);
							return (
								<TouchableOpacity
									key={axis}
									onPress={() => toggleAxis(axis)}
									style={[
										styles.axisChip,
										active && {
											backgroundColor: AXIS_COLORS[axis],
											borderColor: AXIS_COLORS[axis],
										},
									]}
								>
									<Text
										style={[
											styles.axisChipText,
											active && styles.axisChipTextActive,
										]}
									>
										{axis}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				) : null}

				<View style={styles.fftRow}>
					<Text style={styles.fftLabel}>FFT Drilldown</Text>
					<TouchableOpacity
						disabled={!fftAvailable}
						onPress={() => setFftEnabled((current) => !current)}
						style={[
							styles.fftToggle,
							fftEnabled && fftAvailable && styles.fftToggleActive,
							!fftAvailable && styles.fftToggleDisabled,
						]}
					>
						<Text
							style={[
								styles.fftToggleText,
								fftEnabled && fftAvailable && styles.fftToggleTextActive,
							]}
						>
							{fftEnabled && fftAvailable ? "ON" : "OFF"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			<AssetTrendChart
				chartSeries={chartSeries}
				yMaxValue={yMaxValue}
				loading={graphLoading}
				title={selectedFeature.label}
				assetData={asset_data}
				fftEnabled={fftEnabled && fftAvailable}
				subtitle={
					endpointSelected
						? `${endpointSelected.point_name} • ${endpointSelected.mount_location}`
						: "Select an endpoint to inspect trends"
				}
				emptyMessage={graphError || undefined}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F4F7FB",
	},
	contentContainer: {
		paddingBottom: 40,
		gap: 16,
	},
	heroCard: {
		marginHorizontal: 20,
		marginTop: 12,
		borderRadius: 28,
		padding: 18,
		backgroundColor: "#0F172A",
	},
	heroHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
	},
	heroTextWrap: {
		flex: 1,
		gap: 6,
	},
	kicker: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#93C5FD",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	assetName: {
		fontSize: 22,
		fontFamily: Fonts.semiBold,
		color: "#FFFFFF",
	},
	assetMeta: {
		fontSize: 12,
		fontFamily: Fonts.medium,
		color: "#CBD5E1",
	},
	assetImage: {
		width: 88,
		height: 88,
		borderRadius: 24,
		backgroundColor: "#FFFFFF",
	},
	scoreStrip: {
		marginTop: 18,
		flexDirection: "row",
		gap: 10,
	},
	scoreCard: {
		flex: 1,
		backgroundColor: "#1E293B",
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingVertical: 12,
		gap: 6,
	},
	scoreLabel: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#94A3B8",
	},
	scoreValue: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#FFFFFF",
	},
	scoreValueWarm: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#FDBA74",
	},
	healthBadge: {
		alignSelf: "flex-start",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	healthBadgeText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
	},
	endpointCard: {
		marginHorizontal: 20,
		backgroundColor: "#FFFFFF",
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingVertical: 18,
	},
	sectionTitleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	sectionHint: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#64748B",
	},
	endpointChipRow: {
		marginTop: 12,
		gap: 10,
		paddingRight: 18,
	},
	endpointChip: {
		minWidth: 130,
		borderRadius: 18,
		paddingHorizontal: 14,
		paddingVertical: 12,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	endpointChipActive: {
		backgroundColor: "#742BDE",
		borderColor: "#742BDE",
	},
	endpointChipTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	endpointChipTitleActive: {
		color: "#FFFFFF",
	},
	endpointChipSubtitle: {
		marginTop: 4,
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#64748B",
	},
	endpointChipSubtitleActive: {
		color: "#E9D5FF",
	},
	analysisSection: {
		marginHorizontal: 20,
		backgroundColor: "#FFFFFF",
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingVertical: 18,
	},
	featureRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 18,
	},
	featureChip: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		backgroundColor: "#FFFFFF",
	},
	featureChipText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#334155",
	},
	featureChipTextActive: {
		color: "#FFFFFF",
	},
	featureHelper: {
		marginTop: 10,
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#64748B",
	},
	axisRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 16,
	},
	axisChip: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#CBD5E1",
		backgroundColor: "#F8FAFC",
	},
	axisChipText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#334155",
	},
	axisChipTextActive: {
		color: "#FFFFFF",
	},
	fftRow: {
		marginTop: 18,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	fftLabel: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	fftToggle: {
		minWidth: 68,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#D8B4FE",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
	},
	fftToggleActive: {
		backgroundColor: "#742BDE",
		borderColor: "#742BDE",
	},
	fftToggleDisabled: {
		opacity: 0.45,
	},
	fftToggleText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#742BDE",
	},
	fftToggleTextActive: {
		color: "#FFFFFF",
	},
});

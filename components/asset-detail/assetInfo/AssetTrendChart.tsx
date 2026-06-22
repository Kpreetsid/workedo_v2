import React, { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Dimensions,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Asset } from "@/src/types/asset";
import ChartDetailModal from "./ChartDetailModal";

type TrendPoint = {
	value: number;
	label: string;
	flag?: boolean;
	timestamp?: string;
	rawTimestamp?: number;
	fullDate?: string;
};

type ChartSeries = {
	axis: string;
	unit?: string;
	points: TrendPoint[];
};

type AssetTrendChartProps = {
	chartSeries: ChartSeries[];
	yMaxValue: number;
	loading: boolean;
	title: string;
	subtitle?: string;
	emptyMessage?: string;
	assetData: Asset;
	fftEnabled: boolean;
};

const CHART_WIDTH = Dimensions.get("window").width - 92;
const CHART_HEIGHT = 250;
const INITIAL_SPACING = 12;
const END_SPACING = 18;
const FFT_TOOLTIP_WIDTH = 136;
const FFT_TOOLTIP_HEIGHT = 88;
const FFT_TOUCH_TARGET = 18;
const FFT_VISIBLE_DOT = 4;
const AXIS_COLORS: Record<string, string> = {
	Horizontal: "#16A34A",
	Vertical: "#2563EB",
	Axial: "#DC2626",
	Temperature: "#F97316",
};
const FALLBACK_COLORS = ["#742BDE", "#16A34A", "#2563EB"];
const PREFERRED_ORDER = ["Horizontal", "Vertical", "Axial"];

function getSeriesColor(axis: string, index: number) {
	return AXIS_COLORS[axis] || FALLBACK_COLORS[index] || "#742BDE";
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function getChartBounds(chartSeries: ChartSeries[], fallbackMaxValue: number) {
	const values = chartSeries.flatMap((series) =>
		series.points
			.map((point) => point.value)
			.filter((value) => Number.isFinite(value))
	);

	if (!values.length) {
		return {
			yMax: Math.max(5, fallbackMaxValue || 0),
			mostNegativeValue: 0,
		};
	}

	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const range = maxValue - minValue;

	if (range === 0) {
		const padding = Math.max(Math.abs(maxValue) * 0.16, 0.25);
		return {
			yMax: maxValue + padding,
			mostNegativeValue: minValue < 0 ? Math.abs(minValue - padding) : 0,
		};
	}

	const upperPadding = Math.max(range * 0.14, Math.abs(maxValue) * 0.05, 0.08);
	const lowerPadding = Math.max(range * 0.08, 0.04);
	const derivedMin = minValue >= 0 ? Math.max(0, minValue - lowerPadding) : minValue - lowerPadding;

	return {
		yMax: maxValue + upperPadding,
		mostNegativeValue: derivedMin < 0 ? Math.abs(derivedMin) : 0,
	};
}

function buildSeriesPoints(
	series: ChartSeries,
	color: string
) {
	return series.points.map((point) => ({
		value: point.value,
		label: point.label,
		hideDataPoint: true,
		dataPointRadius: 0,
		dataPointWidth: 0,
		dataPointHeight: 0,
		dataPointColor: color,
	}));
}

export default function AssetTrendChart({
	chartSeries,
	yMaxValue,
	loading,
	title,
	subtitle,
	emptyMessage,
	assetData,
	fftEnabled,
}: AssetTrendChartProps) {
	const [detailModalVisible, setDetailModalVisible] = useState(false);
	const [selectedPoint, setSelectedPoint] = useState<any>(null);

	const orderedSeries = useMemo(() => {
		const orderedPreferred = PREFERRED_ORDER.map((axis) =>
			chartSeries.find((series) => series.axis === axis)
		).filter(Boolean) as ChartSeries[];
		const customSeries = chartSeries.filter(
			(series) => !PREFERRED_ORDER.includes(series.axis)
		);
		return [...orderedPreferred, ...customSeries].slice(0, 3);
	}, [chartSeries]);

	const validSeries = useMemo(
		() => orderedSeries.filter((series) => Array.isArray(series.points) && series.points.length),
		[orderedSeries]
	);
	const chartBounds = useMemo(
		() => getChartBounds(validSeries, yMaxValue),
		[validSeries, yMaxValue]
	);
	const maxPointCount = useMemo(
		() =>
			validSeries.reduce(
				(maxCount, series) => Math.max(maxCount, series.points.length),
				0
			),
		[validSeries]
	);
	const chartSpacing = useMemo(() => {
		if (maxPointCount <= 1) return 40;
		return (CHART_WIDTH - INITIAL_SPACING - END_SPACING) / (maxPointCount - 1);
	}, [maxPointCount]);
	const showEmptyState = !loading && validSeries.length === 0;

	const primarySeries = validSeries[0];
	const secondarySeries = validSeries[1];
	const tertiarySeries = validSeries[2];

	const handleSelectPoint = (payload: any) => {
		if (!payload?.timestamp && !payload?.rawTimestamp) return;
		setSelectedPoint(payload);
	};

	const selectedPointTooltipPosition = useMemo(() => {
		if (!selectedPoint) return null;

		const totalRange = chartBounds.yMax + chartBounds.mostNegativeValue;
		const normalizedY =
			totalRange > 0
				? (selectedPoint.value + chartBounds.mostNegativeValue) / totalRange
				: 0.5;

		const totalPoints = Math.max(
			2,
			Number(selectedPoint.totalPoints) || maxPointCount || 2
		);
		const pointIndex = clamp(
			Number(selectedPoint.pointIndex) || 0,
			0,
			totalPoints - 1
		);
		const pointX = INITIAL_SPACING + chartSpacing * pointIndex;
		const pointY = CHART_HEIGHT - normalizedY * CHART_HEIGHT;

		return {
			left: clamp(pointX - FFT_TOOLTIP_WIDTH / 2, 6, CHART_WIDTH - FFT_TOOLTIP_WIDTH - 6),
			top: clamp(pointY - FFT_TOOLTIP_HEIGHT - 12, 8, CHART_HEIGHT - FFT_TOOLTIP_HEIGHT - 8),
		};
	}, [chartBounds.mostNegativeValue, chartBounds.yMax, chartSpacing, maxPointCount, selectedPoint]);

	const openDetailModal = () => {
		if (!selectedPoint) return;
		setDetailModalVisible(true);
	};

	useEffect(() => {
		if (!fftEnabled || loading) {
			setSelectedPoint(null);
		}
	}, [fftEnabled, loading]);

	const primaryData = primarySeries
		? buildSeriesPoints(
				primarySeries,
				getSeriesColor(primarySeries.axis, 0)
		  )
		: [];
	const secondaryData = secondarySeries
		? buildSeriesPoints(
				secondarySeries,
				getSeriesColor(secondarySeries.axis, 1)
		  )
		: [];
	const tertiaryData = tertiarySeries
		? buildSeriesPoints(
				tertiarySeries,
				getSeriesColor(tertiarySeries.axis, 2)
		  )
		: [];

	return (
		<View style={styles.card}>
			<View style={styles.headerRow}>
				<View style={styles.headerTextWrap}>
					<Text style={styles.title}>{title}</Text>
					{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
				</View>
				{primarySeries?.unit ? (
					<View style={styles.unitBadge}>
						<Text style={styles.unitText}>{primarySeries.unit}</Text>
					</View>
				) : null}
			</View>

			{showEmptyState ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyTitle}>No trend data available</Text>
					<Text style={styles.emptyText}>
						{emptyMessage ||
							"Trend points will appear here once this endpoint has readings."}
					</Text>
				</View>
			) : (
				<View style={styles.chartWrap}>
					<View style={styles.chartArea}>
						<LineChart
							data={primaryData}
							data2={secondaryData}
							data3={tertiaryData}
							color1={getSeriesColor(primarySeries?.axis || "Horizontal", 0)}
							color2={getSeriesColor(secondarySeries?.axis || "Vertical", 1)}
							color3={getSeriesColor(tertiarySeries?.axis || "Axial", 2)}
							thickness1={1.5}
							thickness2={1.5}
							thickness3={1.5}
							width={CHART_WIDTH}
							height={CHART_HEIGHT}
							adjustToWidth
							initialSpacing={INITIAL_SPACING}
							endSpacing={END_SPACING}
							spacing={chartSpacing}
							xAxisColor="#E5E7EB"
							yAxisColor="#E5E7EB"
							xAxisThickness={1}
							yAxisThickness={0}
							rulesColor="#EEF2FF"
							hideRules={false}
							yAxisTextStyle={styles.axisText}
							xAxisLabelTextStyle={styles.axisText}
							maxValue={chartBounds.yMax}
							mostNegativeValue={chartBounds.mostNegativeValue}
							noOfSections={4}
							hideDataPoints
							hideDataPoints1
							hideDataPoints2
							hideDataPoints3
						/>

						{fftEnabled
							? validSeries.map((series, seriesIndex) => {
									const seriesColor = getSeriesColor(series.axis, seriesIndex);
									return series.points.map((point, pointIndex) => {
										const totalRange = chartBounds.yMax + chartBounds.mostNegativeValue;
										const normalizedY =
											totalRange > 0
												? (point.value + chartBounds.mostNegativeValue) / totalRange
												: 0.5;
										const pointX = INITIAL_SPACING + chartSpacing * pointIndex;
										const pointY = CHART_HEIGHT - normalizedY * CHART_HEIGHT;
										const payload = {
											axis: series.axis,
											color: seriesColor,
											value: point.value,
											timestamp: point.timestamp || point.fullDate,
											rawTimestamp: point.rawTimestamp,
											flag: point.flag,
											pointIndex,
											totalPoints: series.points.length,
										};

										return (
											<Pressable
												key={`${series.axis}-${pointIndex}-${point.rawTimestamp ?? point.timestamp ?? point.value}`}
												hitSlop={6}
												onPress={() => handleSelectPoint(payload)}
												style={[
													styles.overlayPointTarget,
													{
														left: pointX - FFT_TOUCH_TARGET / 2,
														top: pointY - FFT_TOUCH_TARGET / 2,
													},
												]}
											/>
										);
									});
							  })
							: null}

						{fftEnabled && selectedPoint && selectedPointTooltipPosition && !detailModalVisible ? (
							<View
								style={[
									styles.fftTooltip,
									{
										left: selectedPointTooltipPosition.left,
										top: selectedPointTooltipPosition.top,
										borderColor: selectedPoint.color || "#CBD5E1",
									},
								]}
							>
								<View style={styles.fftTooltipHeader}>
									<View style={styles.fftTooltipMeta}>
										<View
											style={[
												styles.fftTooltipDot,
												{ backgroundColor: selectedPoint.color || "#742BDE" },
											]}
										/>
										<Text style={styles.fftTooltipAxis}>{selectedPoint.axis}</Text>
									</View>
									<Pressable onPress={() => setSelectedPoint(null)} hitSlop={8}>
										<Text style={styles.fftTooltipClose}>×</Text>
									</Pressable>
								</View>
								<Text style={styles.fftTooltipCaption}>FFT point selected</Text>
								<TouchableOpacity style={styles.fftTooltipButton} onPress={openDetailModal}>
									<Text style={styles.fftTooltipButtonText}>View Trend</Text>
								</TouchableOpacity>
							</View>
						) : null}
					</View>

					<View style={styles.legendRow}>
						{validSeries.map((series, index) => (
							<View key={`${series.axis}-${index}`} style={styles.legendItem}>
								<View
									style={[
										styles.legendDot,
										{ backgroundColor: getSeriesColor(series.axis, index) },
									]}
								/>
								<Text style={styles.legendText}>{series.axis}</Text>
							</View>
						))}
					</View>
				</View>
			)}

			{loading ? (
				<View style={styles.loaderOverlay}>
					<ActivityIndicator size="large" color="#742BDE" />
				</View>
			) : null}

			<ChartDetailModal
				visible={detailModalVisible}
				onClose={() => setDetailModalVisible(false)}
				selectedPoint={selectedPoint}
				asset_data={assetData}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 24,
		paddingHorizontal: 18,
		paddingVertical: 18,
		marginTop: 16,
		marginHorizontal: 20,
		shadowColor: "#0F172A",
		shadowOpacity: 0.06,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 6 },
		elevation: 3,
		position: "relative",
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: 12,
	},
	headerTextWrap: {
		flex: 1,
		gap: 4,
	},
	title: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	subtitle: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#64748B",
	},
	unitBadge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "#F5F3FF",
	},
	unitText: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#6D28D9",
		textTransform: "uppercase",
	},
	chartWrap: {
		marginTop: 18,
	},
	chartArea: {
		width: CHART_WIDTH,
		height: CHART_HEIGHT,
		position: "relative",
	},
	overlayPointTarget: {
		position: "absolute",
		width: FFT_TOUCH_TARGET,
		height: FFT_TOUCH_TARGET,
		zIndex: 4,
		backgroundColor: "transparent",
	},
	legendRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 14,
		marginTop: 14,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendDot: {
		width: 10,
		height: 10,
		borderRadius: 999,
	},
	legendText: {
		fontSize: 11,
		fontFamily: Fonts.medium,
		color: "#334155",
	},
	axisText: {
		fontSize: 9,
		color: "#94A3B8",
		fontFamily: Fonts.regular,
	},
	emptyState: {
		paddingVertical: 34,
		paddingHorizontal: 12,
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	emptyTitle: {
		fontSize: 14,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	emptyText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#64748B",
		textAlign: "center",
		lineHeight: 18,
	},
	loaderOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255,255,255,0.72)",
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	fftTooltip: {
		position: "absolute",
		width: FFT_TOOLTIP_WIDTH,
		minHeight: FFT_TOOLTIP_HEIGHT,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 10,
		shadowColor: "#0F172A",
		shadowOpacity: 0.12,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 5,
	},
	fftTooltipHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	fftTooltipMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	fftTooltipDot: {
		width: 8,
		height: 8,
		borderRadius: 999,
	},
	fftTooltipAxis: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#0F172A",
	},
	fftTooltipClose: {
		fontSize: 18,
		lineHeight: 18,
		color: "#94A3B8",
		fontFamily: Fonts.medium,
	},
	fftTooltipCaption: {
		marginTop: 6,
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#64748B",
	},
	fftTooltipButton: {
		marginTop: 10,
		borderRadius: 12,
		backgroundColor: "#742BDE",
		paddingVertical: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	fftTooltipButtonText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#FFFFFF",
	},
});

import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get("window").width - 60;

type ChartSeries = {
	axis: string;
	points: { value: number; label: string; fullDate?: string }[];
};

type AssetTrendChartProps = {
	chartSeries: ChartSeries[];
	xLabels: string[];
	yMaxValue: number;
	selectedValueType: string;
};

export default function AssetTrendChart({
	chartSeries,
	xLabels,
	yMaxValue,
	selectedValueType,
}: AssetTrendChartProps) {

	// -------------------------------------
	//  Tooltip state (local to chart)
	// -------------------------------------
	const [tooltip, setTooltip] = useState<any>(null);

	// -------------------------------------
	// Axis Colors (hard-coded as requested)
	// -------------------------------------
	const axisColors: Record<string, string> = {
		Horizontal: "#01d711", // green
		Vertical: "#ff0000",   // red
		Axial: "#1237ff",      // blue
	};

	// -------------------------------------
	// Ensure correct ordering for LineChart
	// -------------------------------------
	const orderedSeries = ["Horizontal", "Vertical", "Axial"].map(
		(axis) => chartSeries.find((s) => s.axis === axis)
	);

	const totalPoints = orderedSeries[0]?.points?.length || 0;
	const dynamicSpacing = totalPoints > 0 ? SCREEN_WIDTH / totalPoints : 40;

	// Limit spacing so it doesn't become too small
	const spacingValue = Math.max(dynamicSpacing, 6);


	return (
		<View style={{ position: "relative", marginTop: 20 }}>

			{/* ----------------------------- */}
			{/*            TOOLTIP            */}
			{/* ----------------------------- */}
			{tooltip && (
				<View style={styles.tooltip}>
					<Text style={styles.tooltipLabel}>{tooltip.fullDate}</Text>

					<View style={styles.tooltipRow}>
						<View
							style={[
								styles.tooltipDot,
								{ backgroundColor: "red" },
							]}
						/>
						<Text style={styles.tooltipText}>
							{tooltip.value}
						</Text>
					</View>
				</View>
			)}

			{/* ----------------------------- */}
			{/*              CHART            */}
			{/* ----------------------------- */}
			<View style={styles.chartContainer}>
				<LineChart
					curved

					data={orderedSeries[0]?.points || []}
					data2={orderedSeries[1]?.points || []}
					data3={orderedSeries[2]?.points || []}

					color1={axisColors[orderedSeries[0]?.axis || "Horizontal"]}
					color2={axisColors[orderedSeries[1]?.axis || "Vertical"]}
					color3={axisColors[orderedSeries[2]?.axis || "Axial"]}

					dataPointsHeight1={6}
					dataPointsWidth1={6}
					dataPointsColor1={axisColors[orderedSeries[0]?.axis || "Horizontal"]}

					dataPointsHeight2={6}
					dataPointsWidth2={6}
					dataPointsColor2={axisColors[orderedSeries[1]?.axis || "Vertical"]}

					dataPointsHeight3={6}
					dataPointsWidth3={6}
					dataPointsColor3={axisColors[orderedSeries[2]?.axis || "Axial"]}

					thickness={1}
					hideRules={false}

					yAxisTextStyle={{ color: "#A0A0A0", fontSize: 9 }}
					xAxisLabelTextStyle={{ color: "#A0A0A0", fontSize: 9 }}

					backgroundColor="transparent"
					rulesColor="#F0F0F0"

					// width={SCREEN_WIDTH}
					// adjustToWidth={true}

					// initialSpacing={0}
					// endSpacing={0}
					// spacing={35}

					initialSpacing={0}
					endSpacing={0}
					// spacing={spacingValue}

					areaChart={false}
					hideAxesAndRules={false}
					xAxisColor="#EAEAEA"
					yAxisColor="#EAEAEA"
					xAxisThickness={0}
					yAxisThickness={0}
					yAxisLabelWidth={10}

					xAxisLabelTexts={xLabels}

					maxValue={yMaxValue}
					noOfSections={yMaxValue}

					focusEnabled={true}
					focusedDataPointShape={"circle"}
					focusedDataPointColor={axisColors[orderedSeries[0]?.axis || "Horizontal"]}
					focusedDataPointRadius={6}

					onFocus={(data: any) => setTooltip(data)}
				/>

				{/* ----------------------------- */}
				{/*            LEGEND             */}
				{/* ----------------------------- */}
				<View style={styles.legendRow}>
					{orderedSeries.filter(Boolean).map((s: any) => (
						<View key={s.axis} style={styles.legendItem}>
							<View
								style={[
									styles.legendDot,
									{ backgroundColor: axisColors[s.axis] },
								]}
							/>
							<Text style={styles.legendText}>
								{selectedValueType}-{s.axis}
							</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	chartContainer: {
		backgroundColor: "#fff",
		marginHorizontal: 20,
		borderRadius: 10,
		paddingHorizontal: 20,
		paddingVertical: 10,
	},

	tooltip: {
		position: "absolute",
		top: 100,
		left: "50%",
		transform: [{ translateX: -100 }],
		backgroundColor: "#fff",
		padding: 10,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
		width: 200,
		zIndex: 999,
	},
	tooltipLabel: {
		color: "#333",
		fontSize: 12,
	},
	tooltipRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 4,
	},
	tooltipDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	tooltipText: {
		color: "#333",
		fontSize: 12,
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
		gap: 4,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendText: {
		fontSize: 10,
		color: "#666",
	},
});

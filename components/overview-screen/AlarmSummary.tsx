import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { useEffect, useState, useMemo } from "react";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { alarmsSummary } from "@/src/services/alarms.service";

type ChartDataType = {
	timestamps: string[];
	critical: number[];
	alert: number[];
	danger: number[];
};
export default function AlarmSummary() {
	const [showCritical, setShowCritical] = useState(true);
	const [showAlert, setShowAlert] = useState(true);
	const [showDanger, setShowDanger] = useState(true);
	const [tooltip, setTooltip] = useState<any>(null);

	const [loading, setLoading] = useState(false);

	const { childAssets } = useOverviewStore();
	const [chartScale, setChartScale] = useState({
		maxValue: 0,
		noOfSections: 0,
	});
	const [chartData, setChartData] = useState<ChartDataType>({
		timestamps: [],
		critical: [],
		alert: [],
		danger: [],
	});

	const fetchAlarmHistorySummary = async () => {
		const payload = {
			asset_list: childAssets.map((item) => item.id),
		};
		console.log("payload for alarms = ", payload);

		try {
			const res = await alarmsSummary(payload);
			console.log("res = ", res);

			const monthlyCount = res?.monthlyCount ?? [];

			const months = res?.timestamp ?? [];

			const critical = res?.series?.find((item: any) => item.name === "Critical")?.data ?? [];
			const alert = res?.series?.find((item: any) => item.name === "Alert")?.data ?? [];
			const danger = res?.series?.find((item: any) => item.name === "Danger")?.data ?? [];

			// 1️⃣ Find the true maximum across all series
			const rawMax = Math.max(...alert, ...critical, ...danger, 0);
			console.log('rawMax 1 = ', rawMax);

			// 2️⃣ Round it up to a “nice” number (nearest multiple of 5 or 10)
			// const roundedMax =
			// 	rawMax <= 50
			// 		? Math.ceil(rawMax / 5) * 5
			// 		: Math.ceil(rawMax / 10) * 10

			const roundedMax = rawMax;

			console.log('round max - ', roundedMax);


			// 3️⃣ Pick a dynamic number of Y sections (aim for 4–6 lines)
			const dynamicSections = roundedMax <= 10 ? roundedMax : roundedMax <= 50 ? 5 : 6;

			console.log('dynamicSections - ', dynamicSections);

			// Store or pass them to your chart
			setChartScale({
				maxValue: roundedMax,
				noOfSections: dynamicSections,
			});

			console.log('maxValue = ', critical, roundedMax, dynamicSections)

			setChartData({
				timestamps: months,
				critical: critical,
				alert: alert,
				danger: danger,
			});
			setLoading(false)
		} catch (error) {
			console.log("error = ", error);
			setLoading(false)
		}
	};

	useEffect(() => {
		setLoading(true)
		if (childAssets.length === 0) return;
		fetchAlarmHistorySummary();
	}, [childAssets]);

	useEffect(() => {
		console.log('chart scale - ', chartScale);
	}, [chartScale])

	const formatLabel = (i: number, timestamps: string[], gap = 5) => {
		// If it’s not the “gap” index – return empty label
		if (i % gap !== 0) return "";

		const [month, year] = timestamps[i]?.split("-") ?? ["", ""];
		const shortMonth = month.slice(0, 3);
		const shortYear = year.slice(2);

		return `${shortMonth}-${shortYear}`;
	};


	// ✅ Format chart data (e.g. "Sep-23")
	const criticalData = useMemo(() => {
		return chartData.critical.map((value, i) => ({
			index: i,
			value,
			label: formatLabel(i, chartData.timestamps, 5)
		}));
	}, [chartData]);

	const alertData = useMemo(() => {
		return chartData.alert.map((value, i) => ({
			index: i,
			value,
			label: formatLabel(i, chartData.timestamps, 5)
		}));
	}, [chartData]);

	const dangerData = useMemo(() => {
		return chartData.danger.map((value, i) => ({
			index: i,
			value,
			label: formatLabel(i, chartData.timestamps, 5)
		}));
	}, [chartData]);


	useEffect(() => {
		console.log('criticalData = ', criticalData)
		console.log('alertData = ', alertData)
		console.log('dangerData = ', dangerData)
	}, [criticalData, alertData, dangerData])

	return (
		<View style={styles.container}>
			<Text style={styles.chartTitle}>Alarm Summary</Text>

			<TouchableWithoutFeedback onPress={() => setTooltip(null)}>
				<View style={{ position: 'relative' }}>
					{tooltip && (
						<View style={styles.tooltipContainer}>

							{/* DATE HEADING */}
							<Text style={styles.tooltipTitle}>
								{tooltip?.fullDate}
							</Text>

							{/* ALERT ROW */}
							{tooltip?.alert !== undefined && (
								<View style={styles.tooltipRow}>
									<View style={[styles.tooltipDot, { backgroundColor: "#FF9800" }]} />
									<Text style={styles.tooltipLabel}>Alert</Text>
									<Text style={styles.tooltipValue}>{tooltip.alert}</Text>
								</View>
							)}

							{/* DANGER ROW */}
							{tooltip?.danger !== undefined && (
								<View style={styles.tooltipRow}>
									<View style={[styles.tooltipDot, { backgroundColor: "#FFEB3B" }]} />
									<Text style={styles.tooltipLabel}>Danger</Text>
									<Text style={styles.tooltipValue}>{tooltip.danger}</Text>
								</View>
							)}

							{/* CRITICAL ROW */}
							{tooltip?.critical !== undefined && (
								<View style={styles.tooltipRow}>
									<View style={[styles.tooltipDot, { backgroundColor: "#E53935" }]} />
									<Text style={styles.tooltipLabel}>Critical</Text>
									<Text style={styles.tooltipValue}>{tooltip.critical}</Text>
								</View>
							)}

						</View>
					)}

					{
						loading ? <View style={[styles.chart, { height: 300, justifyContent: 'center', alignItems: 'center' }]}>
							<ActivityIndicator size="large" />
						</View>
							:

							<View style={[styles.chart, { height: criticalData.length > 0 || alertData.length > 0 || dangerData.length > 0 ? 'auto' : 300 }]}>
								{
									criticalData.length > 0 || alertData.length > 0 || dangerData.length > 0 ? (
										<LineChart
											curved
											curvature={0.25}
											thickness={2.5}
											hideRules={false}
											hideDataPoints={false}
											isAnimated={false}
											animateOnDataChange
											animationDuration={1200}

											data={showCritical ? criticalData : []}
											data2={showAlert ? alertData : []}
											data3={showDanger ? dangerData : []}

											color1={showCritical ? "#E53935" : "#ccc"}
											color2={showAlert ? "#FF9800" : "#ccc"}
											color3={showDanger ? "#FFEB3B" : "#ccc"}

											dataPointsHeight1={6}
											dataPointsWidth1={6}
											dataPointsColor1={showCritical ? "#E53935" : "#ccc"}

											dataPointsHeight2={6}
											dataPointsWidth2={6}
											dataPointsColor2={showAlert ? "#FF9800" : "#ccc"}

											dataPointsHeight3={6}
											dataPointsWidth3={6}
											dataPointsColor3={showDanger ? "#FFEB3B" : "#ccc"}

											startFillColor1="rgba(229,57,53,0.25)"
											startOpacity={0.3}
											endOpacity={0.05}
											spacing={35}
											yAxisColor="rgba(0,0,0,0.1)"
											xAxisColor="rgba(0,0,0,0.1)"
											yAxisTextStyle={{ color: "#888", fontSize: 10 }}
											xAxisLabelTextStyle={{ color: "#888", fontSize: 10 }}
											maxValue={chartScale.maxValue}      // ✅ dynamic top value
											noOfSections={chartScale.noOfSections} // ✅ dynamic sections
											yAxisLabelWidth={30}
											backgroundColor="#fff"

											focusEnabled={true}
											focusedDataPointShape={"circle"}
											focusedDataPointColor="#E53935"
											focusedDataPointRadius={6}
											onFocus={(point: any) => {
												console.log('point = ', point)
												const idx = point.index;

												setTooltip({
													fullDate: chartData.timestamps[idx],
													alert: chartData.alert[idx],
													danger: chartData.danger[idx],
													critical: chartData.critical[idx],
													x: point.x ?? 150,
													y: point.y ?? 30,
												});
											}}


										/>
									)
										:
										<View style={styles.noDataContainer}>
											<Text style={styles.noDataText}>No Alarm Data found for selected location</Text>
										</View>
								}


							</View>
					}


				</View>

			</TouchableWithoutFeedback>



			<View style={styles.legendContainer}>

				<TouchableOpacity
					style={styles.legendItem}
					onPress={() => setShowAlert(!showAlert)}
				>
					<View style={[
						styles.legendDot,
						{ backgroundColor: showAlert ? "#FF9800" : "#ccc" }
					]} />
					<Text style={[
						styles.legendText,
						{ color: showAlert ? "#444" : "#bbb" }
					]}>Alert</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.legendItem}
					onPress={() => setShowCritical(!showCritical)}
				>
					<View style={[
						styles.legendDot,
						{ backgroundColor: showCritical ? "#E53935" : "#ccc" }
					]} />
					<Text style={[
						styles.legendText,
						{ color: showCritical ? "#444" : "#bbb" }
					]}>Critical</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.legendItem}
					onPress={() => setShowDanger(!showDanger)}
				>
					<View style={[
						styles.legendDot,
						{ backgroundColor: showDanger ? "#FFEB3B" : "#ccc" }
					]} />
					<Text style={[
						styles.legendText,
						{ color: showDanger ? "#444" : "#bbb" }
					]}>Danger</Text>
				</TouchableOpacity>

			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20
	},
	chartTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 12,
	},
	chart: {
		backgroundColor: "#fff",
		borderRadius: 15,
		padding: 10,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		position: "relative",
		overflow: 'hidden'
	},
	legendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 10,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 10,
	},
	legendDot: {
		height: 8,
		width: 8,
		borderRadius: 4,
		marginRight: 6,
	},
	legendText: {
		fontSize: 12,
		color: "#444",
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noDataText: {
		fontSize: 12,
		color: "#000069",
		fontFamily: Fonts.bold,
		textAlign: "center",
		marginTop: 20,
	},
	tooltipContainer: {
		position: "absolute",
		top: 60,
		left: "50%",
		transform: [{ translateX: -100 }], // centers 200px width
		width: 200,
		backgroundColor: "#fff",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 14,

		// Shadow like web
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		elevation: 5,

		zIndex: 9999,
	},

	tooltipTitle: {
		fontSize: 14,
		color: "#444",
		fontWeight: "600",
		marginBottom: 8,
	},

	tooltipRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 6,
	},

	tooltipDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 8,
	},

	tooltipLabel: {
		fontSize: 13,
		color: "#555",
		flex: 1,               // pushes value to the right
	},

	tooltipValue: {
		fontSize: 13,
		fontWeight: "700",
		color: "#444",
	},

})
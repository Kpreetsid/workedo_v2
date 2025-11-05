import { View, Text, StyleSheet } from "react-native";
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

			// 2️⃣ Round it up to a “nice” number (nearest multiple of 5 or 10)
			const roundedMax =
				rawMax <= 50
					? Math.ceil(rawMax / 5) * 5
					: Math.ceil(rawMax / 10) * 10
			// 3️⃣ Pick a dynamic number of Y sections (aim for 4–6 lines)
			const dynamicSections =
				roundedMax <= 10 ? 5 : roundedMax <= 50 ? 5 : 6;

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
		} catch (error) {
			console.log("error = ", error);
		}
	};

	useEffect(() => {
		if (childAssets.length === 0) return;
		fetchAlarmHistorySummary();
	}, [childAssets]);

	// ✅ Format chart data (e.g. "Sep-23")
	const criticalData = useMemo(() => {
		console.log('chart data = ', chartData)
		if (chartData.critical.length === 0) return [];
		return chartData.critical.map((value, i) => {
			const [month, year] = chartData.timestamps[i]?.split("-") ?? ["", ""];
			const shortMonth = month.slice(0, 3);
			const shortYear = year.slice(2);
			return {
				value: value === 0 ? 0 : value,
				label: `${shortMonth}-${shortYear}`,
			};
		});
	}, [chartData]);

	const alertData = useMemo(() => {
		if (chartData.alert.length === 0) return [];
		return chartData.alert.map((value, i) => {
			const [month, year] = chartData.timestamps[i]?.split("-") ?? ["", ""];
			const shortMonth = month.slice(0, 3);
			const shortYear = year.slice(2);
			return {
				value: value === 0 ? 0 : value,
				label: `${shortMonth}-${shortYear}`,
			};
		});
	}, [chartData]);

	const dangerData = useMemo(() => {
		if (chartData.danger.length === 0) return [];
		return chartData.danger.map((value, i) => {
			const [month, year] = chartData.timestamps[i]?.split("-") ?? ["", ""];
			const shortMonth = month.slice(0, 3);
			const shortYear = year.slice(2);
			return {
				value: value === 0 ? 0 : value,
				label: `${shortMonth}-${shortYear}`,
			};
		});
	}, [chartData]);

	useEffect(() => {
		console.log('criticalData = ', criticalData)
		console.log('alertData = ', alertData)
		console.log('dangerData = ', dangerData)
	}, [criticalData, alertData, dangerData])

	return (
		<View style={styles.container}>
			<Text style={styles.chartTitle}>Alarm Summary</Text>

			<View style={[styles.chart, { height: criticalData.length > 0 && alertData.length > 0 && dangerData.length > 0 ? 'auto' : 300 }]}>
				{
					criticalData.length > 0 && alertData.length > 0 && dangerData.length > 0 ? (
						<LineChart
							curved
							curvature={0.25}
							thickness={2.5}
							// areaChart
							hideRules={false}
							hideDataPoints={false}
							isAnimated={false}
							animateOnDataChange
							animationDuration={1200}
							data={criticalData}
							data2={alertData}
							data3={dangerData}
							color1="#E53935"
							color2="#FF9800"
							color3="#FFEB3B"
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
						/>
					)
						:
						<View style={styles.noDataContainer}>
							<Text style={styles.noDataText}>No Alarm Data found for selected location</Text>
						</View>
				}


			</View>

			<View style={styles.legendContainer}>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
					<Text style={styles.legendText}>Alert</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#E53935" }]} />
					<Text style={styles.legendText}>Critical</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#FFEB3B" }]} />
					<Text style={styles.legendText}>Danger</Text>
				</View>
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
	}
})
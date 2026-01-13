import Fonts from "@/constants/Typography";
import { plannedUnplanned } from "@/src/services/cmms.service";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { G } from "react-native-svg";
// import { LineChart, lineDataItem } from "react-native-gifted-charts";
import { WebView } from "react-native-webview";

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlannedVsUnplanned() {
	const webViewRef = useRef<WebView>(null);
	const [chartPayload, setChartPayload] = useState<any>(null);


	const [noData, setNoData] = useState(false)
	const childAssets = useCMMSStore((state) => state.childAssets);
	// console.log('child assets in planned unplanned = ', childAssets);

	const [workOrderData, setWorkOrderData] = useState([]);
	const [preventiveData, setPreventiveData] = useState([]);
	// const [hasPreventive, setHasPreventive] = useState(false);
	const [maxY, setMaxY] = useState(10); // fallback default
	const [spacingValue, setSpacingValue] = useState(40);

	const { startDate, endDate } = useDateRangeStore();

	useEffect(() => {
		if (childAssets.length > 0) {
			fetchPlannedUnplanned();
		}
	}, [childAssets, startDate])

	async function fetchPlannedUnplanned() {
		const startTimePart = "T19:00:00.000Z";
		const timePart = "T14:01:18.788Z";
		try {
			const childAssetsFormatted = childAssets.map((i) => i.id).join(",");


			let finalPayload: any = {};
			// prepare for payload
			if (startDate) {
				finalPayload.startDate = moment(startDate, "YYYY-MM-DD")
					.subtract(1, "day")
					.format("YYYY-MM-DD") + startTimePart;
			} else {
				finalPayload.startDate = moment().subtract(2, "months").format("YYYY-MM-DD") + startTimePart;
			}

			if (endDate) {
				finalPayload.endDate = endDate + timePart;
			} else {
				finalPayload.endDate = moment().format("YYYY-MM-DD") + timePart;
			}

			finalPayload.assetIds = childAssetsFormatted

			// console.log('final payload = ', finalPayload);

			const res = await plannedUnplanned(
				finalPayload.startDate,
				finalPayload.endDate,
				childAssetsFormatted
			);


			if (res?.status) {
				const input = res.data;
				console.log('res data = ', res?.data)

				const work = input.date.map((date: string, index: number) => ({
					value: input["Work Order"][index],
					label: date,
				}));

				const prev = input.date.map((date: string, index: number) => ({
					value: input["Preventive"][index],
					label: date,
				}));

				// const work = input.date.map((date: string, index: number) => ({
				// 	value: input["Work Order"][index] - 1,
				// 	label: date,
				// }));

				// const prev = input.date.map((date: string, index: number) => ({
				// 	value: input["Preventive"][index] - 1,
				// 	label: date,
				// }));

				console.log('work = ', work)
				console.log('prev = ', prev)

				// console.log('work daiofnosdnfod', work)
				setWorkOrderData(work as any)
				setPreventiveData(prev as any);


				// Show preventive only if it has >=1 non-zero value
				// setHasPreventive(prev.some((x: any) => x.value > 0));

				// ------------------------------
				// CALCULATE MAX-Y
				// ------------------------------
				const computedMax = Math.max(
					...work.map((i: any) => i.value),
					...prev.map((i: any) => i.value)
				);
				const maxVertical = computedMax === 0 ? 1 : computedMax;
				setMaxY(maxVertical);

				// ------------------------------
				// CALCULATE SPACING BASED ON POINT COUNT
				// ------------------------------
				const totalPoints = work.length;
				// console.log('totalpo = ', totalPoints)
				const intervals = Math.max(totalPoints - 1, 1);
				// console.log('intervals = ', intervals)

				// leave 40px padding (20px left, 20px right)
				const usableWidth = SCREEN_WIDTH - 40;

				// spacing for LineChart
				const spacing = (usableWidth / intervals) - (100 / intervals);
				// console.log('spacing = ', spacing)

				setSpacingValue(spacing);

				const labels = input.date;
				const workValues = work.map((i: any) => i.value);
				// const preventiveValues = hasPreventive
				// 	? prev.map((i: any) => i.value)
				// 	: null;

				const preventiveValues = prev.map((i: any) => i.value);

				setChartPayload({
					labels,
					workData: workValues,
					preventiveData: preventiveValues,
					maxVertical,
				});
			}
		} catch (e: any) {
			// console.log("fetch error = ", e);

			if (!e.status) {
				if (e.message === "No data found") {
					setWorkOrderData([]);

					// Force blank grey donut
					// const blankPie = [
					// 	{
					// 		value: 0,
					// 		label: ""
					// 	},
					// ] as any;

					// setWorkOrderData(blankPie);  // what the graph draws
					setNoData(true);              // enable overlay

					return;
				}
			}
		}
	}

	useEffect(() => {
		if (chartPayload && webViewRef.current) {
			webViewRef.current.postMessage(
				JSON.stringify(chartPayload)
			);
		}
	}, [chartPayload]);

	const chartUrl = "file:///android_asset/charts/PlannedUnplannedChart.html";

	return (
		<View style={styles.container}>
			<Text style={styles.cardTitle}>Planned vs Unplanned</Text>

			<View style={[styles.chartWrapper, workOrderData.length === 0 ? {
				minHeight: 250
			} : { height: 'auto' }]}>

				{workOrderData.length === 0 && (
					<View style={styles.noDataOverlay}>
						<Text style={styles.noDataText}>
							No work orders created for this location.
						</Text>
					</View>
				)}

				{workOrderData.length > 0 && (
					<WebView
						ref={webViewRef}
						source={require("../../assets/charts/PlannedUnplannedChart.html")}
						// source={{ uri: chartUrl }}
						originWhitelist={["*"]}
						javaScriptEnabled
						domStorageEnabled
						scrollEnabled={false}
						style={{ height: 260, width: "100%" }}
					/>
				)}

			</View>

		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 0
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 12,
	},
	chartWrapper: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: 15,
		padding: 15,
		elevation: 1,
		overflow: "hidden",
	},
	yAxisText: {
		color: "#718EBF",
		fontSize: 10,
	},
	xAxisText: {
		color: "#718EBF",
		fontSize: 10,
		marginTop: 6,
	},
	noDataOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.1)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 999,
		borderRadius: 15, // match your card radius
	},

	noDataText: {
		color: "#000069",
		fontSize: 15,
		fontFamily: Fonts.semiBold,
		textAlign: "center",
		paddingHorizontal: 20,
	},
})
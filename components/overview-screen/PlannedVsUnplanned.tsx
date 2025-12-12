import Fonts from "@/constants/Typography";
import { plannedUnplanned } from "@/src/services/cmms.service";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PlannedVsUnplanned() {
	const [noData, setNoData] = useState(false)
	const childAssets = useCMMSStore((state) => state.childAssets);
	console.log('child assets in planned unplanned = ', childAssets);

	const [workOrderData, setWorkOrderData] = useState([]);
	const [preventiveData, setPreventiveData] = useState([]);
	const [hasPreventive, setHasPreventive] = useState(false);
	const [maxY, setMaxY] = useState(10); // fallback default
	const [spacingValue, setSpacingValue] = useState(40);

	useEffect(() => {
		fetchPlannedUnplanned();
	}, [childAssets])

	async function fetchPlannedUnplanned() {
		try {
			const childAssetsFormatted = childAssets.map((i) => i.id).join(",");

			const res = await plannedUnplanned(
				"2025-10-11T19:00:00.000Z",
				"2025-12-12T10:40:53.984Z",
				childAssetsFormatted
			);

			if (res?.status) {
				const input = res.data;

				const work = input.date.map((date: string, index: number) => ({
					value: input["Work Order"][index],
					label: date,
				}));

				const prev = input.date.map((date: string, index: number) => ({
					value: input["Preventive"][index],
					label: date,
				}));

				console.log('work daiofnosdnfod', work)
				setWorkOrderData(work as any)
				setPreventiveData(prev as any);

				// Show preventive only if it has >=1 non-zero value
				setHasPreventive(prev.some((x: any) => x.value > 0));

				// ------------------------------
				// CALCULATE MAX-Y
				// ------------------------------
				const computedMax = Math.max(
					...work.map((i: any) => i.value),
					...prev.map((i: any) => i.value)
				);
				setMaxY(computedMax === 0 ? 1 : computedMax);

				// ------------------------------
				// CALCULATE SPACING BASED ON POINT COUNT
				// ------------------------------
				const totalPoints = work.length;
				console.log('totalpo = ', totalPoints)
				const intervals = Math.max(totalPoints - 1, 1);
				console.log('intervals = ', intervals)

				// leave 40px padding (20px left, 20px right)
				const usableWidth = SCREEN_WIDTH - 40;

				// spacing for LineChart
				const spacing = (usableWidth / intervals) - (100 / intervals);
				console.log('spacing = ', spacing)

				setSpacingValue(spacing);
			}
		} catch (e: any) {
			console.log("fetch error = ", e);

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
					<LineChart
						data={workOrderData}
						data2={hasPreventive ? preventiveData : undefined}
						curved
						thickness={3}
						thickness2={3}
						color="#742BDE"
						color2="#24b7d8"
						hideDataPoints={false}
						startFillColor="transparent"
						endFillColor="transparent"
						yAxisTextStyle={styles.yAxisText}
						xAxisLabelTextStyle={styles.xAxisText}
						noOfSections={8}
						yAxisColor="#DFE5EE"
						xAxisColor="#DFE5EE"
						rulesColor="#F0F0F0"



						// 👇 force chart to fill width for 2 points
						initialSpacing={0}
						endSpacing={0}

						// 👇 dynamic spacing applied here
						adjustToWidth={true}
						spacing={spacingValue}

						// 👇 custom dynamic max Y-axis
						maxValue={maxY}

						showYAxisIndices
						showXAxisIndices
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
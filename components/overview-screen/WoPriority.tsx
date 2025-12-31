import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useEffect, useState } from "react";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { woPriority } from "@/src/services/cmms.service";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import moment from "moment";

export default function WoPriority() {
	const [hidden, setHidden] = useState<string[]>([]);
	const [noData, setNoData] = useState(false)

	const [rawPieData, setRawPieData] = useState([]);
	const [chartDataFinal, setChartDataFinal] = useState([]);


	const childAssets = useCMMSStore((state) => state.childAssets);
	// console.log('child assets in wo status = ', childAssets);

	const { startDate, endDate } = useDateRangeStore();

	useEffect(() => {
		if(childAssets.length > 0) {
			fetchWoPriority();
		}
	}, [childAssets, startDate])

	// 🎨 Color mapping for each health type
	const colorMap: Record<string, string> = {
		"High": "#24b7d8",
		"Medium": "#264de0",
		"Low": "#46e4c9",
		"None": "#adeaff",
	};

	async function fetchWoPriority() {
		const startTimePart = "T19:00:00.000Z";
		const timePart = "T14:01:18.788Z";
		try {
			const childAssetsFormatted = (childAssets.map((item) => item.id)).join(",")
			// console.log('payload = ', childAssetsFormatted);


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


			const res = await woPriority(
				finalPayload.startDate,
				finalPayload.endDate,
				childAssetsFormatted
			);
			// console.log('res = ', res);
			if (res?.status) {

				// 🎨 Color mapping for each health type
				const colorMap: Record<string, string> = {
					"High": "#24b7d8",
					"Medium": "#264de0",
					"Low": "#46e4c9",
					"None": "#adeaff",
				};

				const breakup = res?.data;

				// 1) Convert breakup to pie chart format
				const pieDataRaw = breakup.map((item: any) => ({
					value: item.value,
					color: colorMap[item.key],
					text: item.key,
				}));

				setRawPieData(pieDataRaw);

				// 2) Filter hidden segments
				const chartDataRaw = pieDataRaw.filter(
					(item: any) => !hidden.includes(item.text)
				);
				// console.log('chart data raw = ', chartDataRaw)
				setChartDataFinal(chartDataRaw);
			}
		} catch (e: any) {
			// console.log('e in priority = ', e);

			if (!e.status) {
				if (e.message === "No data found") {
					setChartDataFinal([]);

					// Force blank grey donut
					const blankPie = [
						{
							value: 1,
							color: "#B0B0B0",
							text: "",
						},
					] as any;

					setChartDataFinal(blankPie);  // what the graph draws
					setRawPieData([]);            // hide legend completely
					setHidden([]);                // reset legend hidden state
					setNoData(true);              // enable overlay

					return;
				}
			}
		}
	}

	useEffect(() => {
		if (!chartDataFinal.length) return;

		const updated = chartDataFinal.map((item: any) => ({
			...item,
			hidden: hidden.includes(item.text)
		}));

		// Filter visually hidden items
		setChartDataFinal(prev =>
			prev.filter((item: any) => !hidden.includes(item.text))
		);
	}, [hidden]);


	useEffect(() => {
		const filtered = rawPieData.filter(
			(item: any) => !hidden.includes(item.text)
		);

		setChartDataFinal(filtered);
	}, [rawPieData, hidden]);

	useEffect(() => {
		if (chartDataFinal) {
			// console.log('this is chart data final = ', chartDataFinal);
		}
	}, [chartDataFinal])

	return (
		<View style={styles.container}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Wo - Priority</Text>
			</View>

			<View style={styles.chartWrapper}>

				{chartDataFinal.length === 0 && (
					<View style={styles.noDataOverlay}>
						<Text style={styles.noDataText}>
							No WO priority found for selected location.
						</Text>
					</View>
				)}

				{
					chartDataFinal.length > 0 ?
						<PieChart
							data={chartDataFinal}
							donut
							radius={85}
							innerRadius={50}
							innerCircleColor="#FFFFFF"
							focusOnPress={false}
							showText={false}
							strokeWidth={8}
							strokeColor="#FFFFFF"
							backgroundColor="transparent"
							isAnimated
						/>
						:
						<PieChart
							data={[{
								text: "",
								value: 1,
								color: "#B0B0B0"
							}]}
							donut
							radius={85}
							innerRadius={50}
							innerCircleColor="#FFFFFF"
							focusOnPress={false}
							showText={false}
							strokeWidth={8}
							strokeColor="#FFFFFF"
							backgroundColor="transparent"
							isAnimated
						/>
				}


				<View>
					{rawPieData.map((item: any, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => {
								setHidden(prev =>
									prev.includes(item.text)
										? prev.filter(v => v !== item.text) // unhide
										: [...prev, item.text]              // hide
								);
							}}
							style={styles.legendRow}
						>
							<View
								style={[
									styles.legendColor,
									{
										backgroundColor: item.color,
										opacity: hidden.includes(item.text) ? 0.3 : 1
									}
								]}
							/>

							<Text
								style={[
									styles.legendText,
									{
										opacity: hidden.includes(item.text) ? 0.4 : 1
									}
								]}
							>
								{item.text} ({item.value})
							</Text>
						</TouchableOpacity>
					))}
				</View>


			</View>
		</View>
	);
}

type LegendProps = {
	color: string;
	label: string;
	count: number;
};

function LegendItem({ color, label, count }: LegendProps) {
	return (
		<View style={styles.legendItem}>
			<View style={[styles.dot, { backgroundColor: color }]} />
			<Text style={styles.legendText}>
				{label} <Text>{count}</Text>
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 0
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	badge: {
		borderWidth: 1,
		borderColor: "#E1E8EE",
		borderRadius: 8,
		width: 112,
		height: 28,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "space-evenly",
		flexDirection: "row",
	},
	badgeText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#201F23",
	},
	chartWrapper: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#fff",
		borderRadius: 15,
		padding: 20,
		elevation: 1,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 4,
	},
	dot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 10,
	},
	legendText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#45515C",
	},

	legendHeader: {
		fontSize: 13,
		fontFamily: Fonts.medium,
		color: "#374151",
		marginBottom: 15,
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	legendColor: {
		width: 12,
		height: 12,
		borderRadius: 50,
		marginRight: 8,
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
});
import { StyleSheet, TouchableOpacity, View, Text, Pressable } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useEffect, useState } from "react";
import { woStatus } from "@/src/services/cmms.service";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import moment from "moment";
import { collectSelectedAssetIdsWithChildren, type SelectableTreeNode } from "@/src/utils/assetSelection";

const chartData: pieDataItem[] = [
	{ value: 3, color: "#00B227" }, { value: 3, color: "#DEDEDE" }, { value: 3, color: "#FFC107" }, { value: 3, color: "#5552FE" },
];

export default function WoStatus() {
	const [hidden, setHidden] = useState<string[]>([]);
	const [noData, setNoData] = useState(false)

	const [selectedSlice, setSelectedSlice] = useState<{
		text: string;
		value: number;
		color: string;
	} | null>(null);

	const [rawPieData, setRawPieData] = useState([]);
	const [chartDataFinal, setChartDataFinal] = useState([]);

	const childAssets = useCMMSStore((state) => state.childAssets);
	const selectedAssets = useCMMSStore((state) => state.selectedAssets);
	const startDate = useDateRangeStore((state) => state.startDate);
	const endDate = useDateRangeStore((state) => state.endDate);
	const rangeVersion = useDateRangeStore((state) => state.rangeVersion);

	useEffect(() => {
		console.log(' in wo status = ', selectedAssets, startDate)
		if (selectedAssets.length > 0 && childAssets.length > 0) {
			fetchWoStatus();
			return;
		}

		setRawPieData([]);
		setChartDataFinal([]);
		setHidden([]);
		setSelectedSlice(null);
		setNoData(false);
	}, [selectedAssets, childAssets, startDate, endDate, rangeVersion])

	// 🎨 Color mapping for each health type
	const colorMap: Record<string, string> = {
		"Open": "#24b7d8",
		"On-Hold": "#264de0",
		"In-Progress": "#46e4c9",
		"Completed": "#adeaff",
	};

	async function fetchWoStatus() {
		const startTimePart = "T19:00:00.000Z";
		const timePart = "T18:00:00.00Z";
		try {
			const selectedAssetsWithChildren = collectSelectedAssetIdsWithChildren(
				childAssets as SelectableTreeNode[],
				selectedAssets
			);
			const selectedAssetsFormatted = selectedAssetsWithChildren.join(",")
			if (!selectedAssetsFormatted) {
				setRawPieData([]);
				setChartDataFinal([]);
				setHidden([]);
				setSelectedSlice(null);
				setNoData(false);
				return;
			}

			let finalPayload: any = {};
			// prepare for payload
			if (startDate) {
				finalPayload.startDate = moment(startDate, "YYYY-MM-DD")
					.subtract(1, "day")
					.format("YYYY-MM-DD") + startTimePart;
			} else {
				finalPayload.startDate = moment().subtract(1, "week").format("YYYY-MM-DD") + startTimePart;
			}

			if (endDate) {
				finalPayload.endDate = endDate + timePart;
			} else {
				finalPayload.endDate = moment().format("YYYY-MM-DD") + timePart;
			}

			finalPayload.assetIds = selectedAssetsFormatted

			console.log('final payload wo status = ', finalPayload);

			const res = await woStatus(
				finalPayload.startDate,
				finalPayload.endDate,
				selectedAssetsFormatted
			);
			console.log('wo status res = ', res);
			if (res?.status && Array.isArray(res?.data) && res?.data.length > 0) {

				// 🎨 Color mapping for each health type
				const colorMap: Record<string, string> = {
					"Open": "#24b7d8",
					"On-Hold": "#264de0",
					"In-Progress": "#46e4c9",
					"Completed": "#adeaff",
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
				setNoData(false);
				return;
			}

			setRawPieData([]);
			setChartDataFinal([]);
			setHidden([]);
			setSelectedSlice(null);
			setNoData(true);
		} catch (e: any) {
			// console.log('e in status = ', e);

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

			setRawPieData([]);
			setChartDataFinal([]);
			setHidden([]);
			setSelectedSlice(null);
			setNoData(true);
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

	// STEP 2: inject onPress into pie data
	const pieDataWithPress = chartDataFinal.map((item: any) => ({
		...item,
		onPress: () => {
			setSelectedSlice(prev =>
				prev?.text === item.text
					? null
					: {
						text: item.text,
						value: item.value,
						color: item.color,
					}
			);
		},
	}));

	const pieDataForRender =
		chartDataFinal.length > 0
			? pieDataWithPress
			: [
				{
					text: "",
					value: 1,
					color: "#B0B0B0",
				},
			];


	return (
		<View style={styles.container}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Wo - Status</Text>

				{/* <TouchableOpacity style={styles.badge} activeOpacity={0.8}>
					<Calender />
					<Text style={styles.badgeText}>Monthly</Text>
					<DropDownIcon />
				</TouchableOpacity> */}
			</View>

			<Pressable
				onPress={() => setSelectedSlice(null)}
				style={styles.chartWrapper}
			>

				{chartDataFinal.length === 0 && (
					<View style={styles.noDataOverlay}>
						<Text style={styles.noDataText}>
							No WO status found for selected location.
						</Text>
					</View>
				)}

				<View
					style={{
						width: 170, // radius * 2
						height: 170,
						position: "relative",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<PieChart
						data={pieDataForRender}
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

					{selectedSlice && chartDataFinal.length > 0 && (
						<View style={styles.centerOverlay}>
							<View
								style={[
									styles.centerDot,
									{ backgroundColor: selectedSlice.color },
								]}
							/>
							<Text style={styles.centerLabel}>{selectedSlice.text}</Text>
							<Text style={styles.centerValue}>{selectedSlice.value}</Text>
						</View>
					)}
				</View>


				{/* {
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
				} */}


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


			</Pressable>
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
		borderRadius: 20,
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
	centerOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		pointerEvents: "none", // 🔑 don't block slice taps
	},

	centerDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginBottom: 6,
	},

	centerLabel: {
		fontSize: 12,
		fontFamily: Fonts.medium,
		color: "#6B7280",
	},

	centerValue: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},

});

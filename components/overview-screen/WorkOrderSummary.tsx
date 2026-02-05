import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { monthlyCount } from "@/src/services/cmms.service";
import moment from "moment";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";

const screenWidth = Dimensions.get("window").width;

export default function WorkOrderSummary() {
	const [selectedBar, setSelectedBar] = useState<number | null>(null);

	const childAssets = useCMMSStore((state) => state.childAssets);
	// console.log('child assets in wo status = ', childAssets);

	const [woSummaryData, setWOSummaryData] = useState<any>(null);
	const startDate = useDateRangeStore((state)=>state.startDate);
	const endDate = useDateRangeStore((state)=>state.endDate);
	const rangeVersion = useDateRangeStore((state)=>state.rangeVersion);

	useEffect(() => {
		if (childAssets.length > 0) {
			fetchSummary();
			return;
		}

		setWOSummaryData(null);
		setSelectedBar(null);
	}, [childAssets, startDate, endDate, rangeVersion])

	const transformToBarData = (input: any) => {
		return input.map((item: any) => ({
			value: item.count,
			date: `${item.id}`,
		}));
	};

	async function fetchSummary() {
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


			const res = await monthlyCount(
				finalPayload.startDate,
				finalPayload.endDate,
				childAssetsFormatted
			);
			if (res?.status && Array.isArray(res?.data) && res?.data.length > 0) {
				console.log('res WO SUMMARY = ', res?.data);

				const barData = transformToBarData(res?.data);
				// console.log('barData ', barData);

				setWOSummaryData(barData)
				return;
			}

			setWOSummaryData(null);
			setSelectedBar(null);
		} catch (e) {
			// console.log('e in status = ', e);
			setWOSummaryData(null);
			setSelectedBar(null);
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Work Order Summary</Text>
				{/* <TouchableOpacity style={styles.badge} activeOpacity={0.8}>
					<Calender />
					<Text style={styles.badgeText}>Monthly</Text>
					<DropDownIcon />
				</TouchableOpacity> */}
			</View>

			<View style={styles.card}>
				{selectedBar !== null && (
					<Pressable style={styles.overlay} onPress={() => setSelectedBar(null)} />
				)}

				{woSummaryData ? (
					<BarChart
						data={woSummaryData.map((bar: any, i: any) => ({
							value: bar.value,
							label: bar.id, // "2025-11"
							frontColor: "#be3aff",
							onPress: () => setSelectedBar(i),
						}))}

						// GRAPH LOOK
						barWidth={30}
						barBorderRadius={6}
						isAnimated
						spacing={20}
						initialSpacing={10}
						endSpacing={10}

						// AXES
						yAxisThickness={1}
						xAxisThickness={1}
						yAxisColor="#DFE5EE"
						xAxisColor="#DFE5EE"
						yAxisTextStyle={styles.yAxisText}

						// ⭐ ADD X-AXIS LABELS HERE
						xAxisLabelTexts={woSummaryData.map((item: any) => {
							// console.log('item = ', item)
							return item.date
						})}
						xAxisLabelTextStyle={styles.axisLabel}

						// LABELS
						// showYAxisIndices
						// showXAxisIndices
						hideRules={false}
						rulesColor="#DFE5EE"

						// MAKE MAX Y VALUE DYNAMIC
						maxValue={Math.max(...woSummaryData.map((i: any) => i.value))}
						noOfSections={4}

						width={screenWidth - 40}
					/>
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>
							No work orders summary found for this location.
						</Text>
					</View>
				)}

				{selectedBar !== null && (
					<View
						style={[
							styles.tooltip,
							{ left: 20 + selectedBar * (35 + 30) - 10 }
						]}
					>
						<Text style={styles.tooltipDate}>
							{woSummaryData[selectedBar].date}
						</Text>

						<View style={styles.tooltipRow}>
							<View style={styles.tooltipDot} />
							<Text style={styles.tooltipValue}>
								{woSummaryData[selectedBar].value}
							</Text>
						</View>
					</View>
				)}

			</View>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
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
	card: {
		backgroundColor: "#fff",
		borderRadius: 15,
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		position: "relative",
		overflow: 'hidden'
	},
	emptyState: {
		minHeight: 220,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		color: "#000069",
		fontSize: 15,
		fontFamily: Fonts.semiBold,
		textAlign: "center",
	},
	axisLabel: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#718EBF",
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		zIndex: 5,
	},
	tooltip: {
		position: "absolute",
		bottom: 140,
		backgroundColor: "#EFF2FC",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
		zIndex: 10,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 10
	},
	legendTitle: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#45515C",
		textAlign: "center",
		textAlignVertical: "center"
	},
	legendText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#45515C",
	},
	yAxisText: {
		color: '#999',
		fontSize: 14
	},

	tooltipDate: {
		fontSize: 12,
		fontFamily: Fonts.medium,
		color: "#333",
		marginBottom: 6,
	},

	tooltipRow: {
		flexDirection: "row",
		alignItems: "center",
	},

	tooltipDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#742BDE",
		marginRight: 6,
	},

	tooltipValue: {
		fontSize: 14,
		fontFamily: Fonts.semiBold,
		color: "#333",
	},
});

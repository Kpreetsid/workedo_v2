import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { useOverviewStore } from "@/src/store/useOverviewStore";

const screenWidth = Dimensions.get("window").width;
const radius = screenWidth * 0.22;
const gap = radius * 0.08; // gap proportional to radius for consistent spacing
const arcPadding = 1.5;
const pieDataRaw = [
	{ value: 6, color: "#74FD70", text: "Healthy" },
	{ value: 5, color: "#F9FB6F", text: "Alert" },
	{ value: 2, color: "#FB9C6D", text: "Danger" },
	{ value: 1, color: "#EF4444", text: "Critical" },
	{ value: 3, color: "#B0B0B0", text: "Not Detected" },
];

export default function AssetHealthStatus() {
	const assetKPIHistory = useOverviewStore((state) => state.assetKPIHistory);

	const [selectedSlice, setSelectedSlice] = React.useState<{
		text: string;
		value: number;
		color: string;
	} | null>(null);

	// console.log('asset kpi history in health status = ', assetKPIHistory)
	const [hidden, setHidden] = React.useState<string[]>([]);

	// ✅ Local derived breakup state
	const [breakup, setBreakup] = React.useState<
		{ name: string; value: number }[]
	>([]);

	// 🔒 Sync only when KPI becomes available
	React.useEffect(() => {
		if (!assetKPIHistory) return;

		setBreakup(assetKPIHistory.top_level_asset.health_breakup_percentage);
	}, [assetKPIHistory]);

	const screenWidth = Dimensions.get("window").width;
	const radius = screenWidth * 0.22;
	const gap = radius * 0.04;
	const arcPadding = 1.5;

	// 🎨 Color mapping for each health type
	const colorMap: Record<string, string> = {
		Healthy: "#74FD70",
		Alert: "#F9FB6F",
		Danger: "#FB9C6D",
		Critical: "#EF4444",
		"Not Defined": "#B0B0B0",
	};

	// 🛑 If breakup not ready yet → render UI shell only
	if (!breakup.length) {
		return (
			<View style={styles.container}>
				<Text style={styles.cardTitle}>Asset Health Status</Text>
				<View style={styles.card} />
			</View>
		);
	}

	const pieDataRaw = breakup.map(item => ({
		value: item.value,
		color: colorMap[item.name],
		text: item.name,
	}));

	// 2) Filter only for the chart
	const chartDataRaw = pieDataRaw.filter(item => !hidden.includes(item.text));

	// 3) If empty → show one grey slice
	// let finalChartData = chartDataRaw.length > 0
	// 	? chartDataRaw
	// 	: [{
	// 		text: "Not Defined",
	// 		value: 1,
	// 		color: "#B0B0B0"
	// 	}];

	const finalChartData = chartDataRaw.length > 0
		? chartDataRaw.map(item => ({
			...item,
			onPress: () => {
				setSelectedSlice(item);
			},
		}))
		: [{
			text: "Not Defined",
			value: 1,
			color: "#B0B0B0",
			onPress: () => {
				setSelectedSlice({
					text: "Not Defined",
					value: 0,
					color: "#B0B0B0",
				});
			},
		}];


	console.log('finalChartData = ', finalChartData);

	// 🧮 Compute total for normalization
	const total = finalChartData.reduce((sum, s) => sum + s.value, 0) || 1;

	let startAngle = -90;

	// 🌀 Calculate arc offsets (same as before)
	const pieData = finalChartData.map(slice => {
		const sliceAngle = (slice.value / total) * 360 - arcPadding;
		const midAngle = startAngle + sliceAngle / 2;
		const rad = (midAngle * Math.PI) / 180;

		const shiftX = Math.cos(rad) * gap;
		const shiftY = Math.sin(rad) * gap;

		startAngle += sliceAngle + arcPadding;

		return {
			value: slice.value,
			color: slice.color,
			shiftX,
			shiftY,
			strokeColor: "#fff",
		};
	});

	return (
		<View style={styles.container}>
			<Text style={styles.cardTitle}>Asset Health Status</Text>

			<Pressable
				onPress={() => setSelectedSlice(null)}
				style={styles.card}
			>

				<View style={styles.pieRow}>
					<View
						style={{
							width: radius * 2,
							height: radius * 2,
							justifyContent: "center",
							alignItems: "center",
							position: "relative",
						}}
					>
						{finalChartData.length > 0 && <PieChart
							isAnimated
							data={finalChartData}

							innerRadius={50}
							innerCircleColor="#FFFFFF"
							focusOnPress={false}
							strokeWidth={2}
							strokeColor="#FFFFFF"
							backgroundColor="#fff"

							radius={radius}
							donut={true}
							showText={false}
							sectionAutoFocus={false}
						/>}


						{selectedSlice && (
							<View style={styles.centerOverlay}>
								<View
									style={[
										styles.selectedDot,
										{ backgroundColor: selectedSlice.color },
									]}
								/>
								<Text style={styles.centerText}>
									{selectedSlice.text}
								</Text>
								<Text style={styles.centerValue}>
									{selectedSlice.value}
								</Text>
							</View>
						)}

					</View>




					<View style={styles.pieLegend}>
						<Text style={styles.legendHeader}>See Details</Text>

						{breakup.map((item, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => {
									setHidden(prev =>
										prev.includes(item.name)
											? prev.filter(v => v !== item.name)   // unhide
											: [...prev, item.name]                  // hide
									);
								}}
								style={styles.legendRow}
							>
								<View
									style={[
										styles.legendColor,
										{
											backgroundColor: colorMap[item.name],
											opacity: hidden.includes(item.name) ? 0.3 : 1
										}
									]}
								/>
								<Text
									style={[
										styles.legendText,
										{ opacity: hidden.includes(item.name) ? 0.4 : 1 }
									]}
								>
									{item.name} ({item.value})
								</Text>
							</TouchableOpacity>
						))}
					</View>


				</View>
			</Pressable>
		</View >
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	cardTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 12,
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
	},
	pieRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	pieLegend: {
		marginLeft: 16,
		justifyContent: "center",
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
		borderRadius: 6,
		marginRight: 8,
	},
	legendText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#45515C",
	},
	selectedInfo: {
		position: 'absolute',
		top: 25,
		left: 25,
		transform: [{ translateX: 25 }, { translateY: 25 }],
		marginTop: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	centerOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		pointerEvents: "none", // 👈 IMPORTANT: allow pie clicks
	},

	centerText: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 4,
		fontFamily: Fonts.medium,
	},

	centerValue: {
		fontSize: 18,
		color: "#111",
		fontFamily: Fonts.bold,
	},

	selectedDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginBottom: 6,
	},


});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { useOverviewStore } from "@/src/state/app/useOverviewStore";

// const gap = radius * 0.08; // gap proportional to radius for consistent spacing
// const arcPadding = 1.5;
export default function AssetHealthStatusPieChart() {
	const assetKPIHistory = useOverviewStore((state) => state.assetKPIHistory);
	const [hidden, setHidden] = React.useState<string[]>([]);

	// 🧠 Fallback to empty array if data isn't available yet
	const breakup = assetKPIHistory?.top_level_asset?.health_breakup_percentage ?? [];

	// 🎨 Color mapping for each health type
	const colorMap: Record<string, string> = {
		Healthy: "#74FD70",
		Alert: "#F9FB6F",
		Danger: "#FB9C6D",
		Critical: "#EF4444",
		"Not Defined": "#B0B0B0",
	};


	const pieDataRaw = breakup.map((item: any) => ({
		value: item.value,
		color: colorMap[item.name] || "#000",
		text: item.name,
	}));

	// 2) Filter only for the chart
	const chartDataRaw = pieDataRaw.filter((item: any) => !hidden.includes(item.text));

	return (
		<View style={styles.container}>
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Asset Health Status</Text>
			</View>

			<View style={styles.chartWrapper}>

				{
					chartDataRaw.length > 0 ?
						<PieChart
							data={chartDataRaw}
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
								text: "Not Defined",
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
					{breakup.map((item: any, index: number) => (
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
		borderRadius: 6,
		marginRight: 8,
	},
});

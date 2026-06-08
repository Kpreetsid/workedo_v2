import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { assetHealthStatus } from "@/src/services/asset.service";
import WebView from "react-native-webview";
import { LOCAL_CHART_WEBVIEW_PROPS } from "@/src/utils/localChartWebView";

// Define series colors
const COLORS: any = {
	Healthy: "#22C55E",
	Alert: "#FACC15",
	Danger: "#F97316",
	Critical: "#EF4444",
};

const screenWidth = Dimensions.get("window").width;

export default function AssetHealth() {
	const webViewRef = useRef<WebView>(null);
	const [groupBy, setGroupBy] = useState<"month" | "week">("month");
	const [showDropdown, setShowDropdown] = useState(false);

	const [barData, setBarData] = useState<any[]>([]);
	const [maxValue, setMaxValue] = useState<number>(0);
	const { childAssets } = useOverviewStore();

	const [loading, setLoading] = useState<boolean>(false);
	const [rawSeries, setRawSeries] = useState<any>(null);

	const [enabledSeries, setEnabledSeries] = useState<any>({
		Healthy: true,
		Alert: true,
		Danger: true,
		Critical: true,
	});

	const [selectedMonth, setSelectedMonth] = useState<any>(null); // NEW

	const BAR_WIDTH = 15;

	const BAR_SPACING = groupBy === "week" ? 6 : 3;
	const GROUP_GAPS = groupBy === "week" ? 1 : 2;


	// ----------------------------- FETCH ------------------------------------
	const fetchAssetHealth = async () => {
		try {
			const payload = {
				asset_list: childAssets.map((item) => item.id),
				group_by: groupBy,
			};

			console.log("payload = ", payload);

			const res = await assetHealthStatus(payload);
			const data = res?.data;
			console.log('data = ', data)

			setRawSeries(data);
			setBarData(buildBarData(data, enabledSeries));
			setLoading(false);
		} catch (err) {
			// console.log("asset health error =", err);
			setLoading(false);
		}
	};

	// ----------------------------- BUILD BAR DATA ---------------------------
	function buildBarData(api: any, enabledSeries: any) {
		const timestamps = api.timestamp ?? [];
		const series = api.series ?? [];

		const healthy = series.find((s: any) => s.name === "Healthy")?.data ?? [];
		const alert = series.find((s: any) => s.name === "Alert")?.data ?? [];
		const danger = series.find((s: any) => s.name === "Danger")?.data ?? [];
		const critical = series.find((s: any) => s.name === "Critical")?.data ?? [];

		// const shortLabel = (ts: string) => ts.split("-")[0];

		const formatLabel = (ts: string, index: number) => {
			if (groupBy === "month") {
				// e.g. "Oct-2025" → "Oct"
				return ts.split("-")[0];
			}

			// WEEKLY:
			// Show label only every 2 weeks to avoid clutter
			if (index % 2 !== 0) return "";

			// "01-07 Oct" → "01-07"
			return ts.split(" ")[0];
		};

		let output: any[] = [];

		for (let i = 0; i < timestamps.length; i++) {
			// const label = shortLabel(timestamps[i]);
			const label = formatLabel(timestamps[i], i);

			if (enabledSeries.Healthy) {
				output.push({
					value: healthy[i],
					label,
					monthIndex: i,
					health: "Healthy",
					spacing: 2,
					labelWidth: 30,
					labelTextStyle: { color: "gray" },
					frontColor: COLORS.Healthy,
				});
			}

			if (enabledSeries.Alert) {
				output.push({
					value: alert[i],
					monthIndex: i,
					health: "Alert",
					frontColor: COLORS.Alert,
				});
			}

			if (enabledSeries.Danger) {
				output.push({
					value: danger[i],
					monthIndex: i,
					health: "Danger",
					frontColor: COLORS.Danger,
				});
			}

			if (enabledSeries.Critical) {
				output.push({
					value: critical[i],
					monthIndex: i,
					health: "Critical",
					frontColor: COLORS.Critical,
				});
			}

			// GAPS
			for (let k = 0; k < GROUP_GAPS; k++) {
				output.push({
					value: 0,
					monthIndex: i,
					health: "Gap",
					frontColor: "rgba(0,0,0,0)",
				});
			}
		}


		return output;
	}

	// ------------------------------ TOGGLE LEGEND --------------------------
	function toggleSeries(type: "Healthy" | "Alert" | "Danger" | "Critical") {
		setEnabledSeries((prev: any) => {
			const updated = { ...prev, [type]: !prev[type] };

			if (rawSeries) {
				setBarData(buildBarData(rawSeries, updated));
				setSelectedMonth(null); // Close popup on filter change
			}

			return updated;
		});
	}

	// --------------------------- BAR CLICK HANDLER -----------------------
	const handleBarPress = (item: any) => {
		if (!rawSeries) return;
		if (item.health === "Gap") return;

		const monthIndex = item.monthIndex;

		const ts = rawSeries.timestamp[monthIndex]; // "Apr-2025"
		const [month, year] = ts.split("-");

		const series = rawSeries.series;

		const totals = {
			Healthy: series.find((s: any) => s.name === "Healthy")?.data[monthIndex] ?? 0,
			Alert: series.find((s: any) => s.name === "Alert")?.data[monthIndex] ?? 0,
			Danger: series.find((s: any) => s.name === "Danger")?.data[monthIndex] ?? 0,
			Critical: series.find((s: any) => s.name === "Critical")?.data[monthIndex] ?? 0,
		};

		// Find all bars for this month
		const monthBars = barData.filter((b) => b.monthIndex === monthIndex);
		const firstIndex = barData.indexOf(monthBars[0]);
		const lastIndex = barData.indexOf(monthBars[monthBars.length - 1]);
		const centerIndex = Math.floor((firstIndex + lastIndex) / 2);

		const positionX = centerIndex * (BAR_WIDTH + BAR_SPACING) + 30;

		setSelectedMonth({
			index: monthIndex,
			label: `${month} ${year}`,
			totals,
			positionX,
		});
	};

	// ------------------------------- EFFECTS -------------------------------
	useEffect(() => {
		setLoading(true);
		if (childAssets.length === 0) {
			setBarData([]);
			return;
		}

		fetchAssetHealth();
	}, [childAssets, groupBy]);

	useEffect(() => {
		if (barData.length > 0) {
			const maxValue = Math.max(...barData.map((item: any) => item.value));
			setMaxValue(maxValue);
		}
	}, [barData]);

	// ------------------------------ Y-AXIS LOGIC ---------------------------
	const yAxisInfo = useMemo(() => {
		if (!maxValue) return { sections: 4, labels: ["0"] };

		const sections = 4;
		const step = maxValue / sections;
		const labels = Array.from({ length: sections + 1 }, (_, i) =>
			(step * i).toFixed(1)
		);

		return { sections, labels };
	}, [maxValue]);

	// -----------------------------------------------------------------------
	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Asset Health</Text>
				<View style={{ position: "relative" }}>
					<TouchableOpacity
						style={styles.badge}
						activeOpacity={0.8}
						onPress={() => setShowDropdown((v) => !v)}
					>
						<Calender />
						<Text style={styles.badgeText}>
							{groupBy === "month" ? "Monthly" : "Weekly"}
						</Text>
						<DropDownIcon />
					</TouchableOpacity>

					{showDropdown && (
						<View style={styles.dropdown}>
							{[
								{ label: "Monthly", value: "month" },
								{ label: "Weekly", value: "week" },
							].map((opt) => (
								<Pressable
									key={opt.value}
									style={styles.dropdownItem}
									onPress={() => {
										setGroupBy(opt.value as "month" | "week");
										setSelectedMonth(null); // reset popup
										setShowDropdown(false);
									}}
								>
									<Text
										style={[
											styles.dropdownText,
											groupBy === opt.value && styles.dropdownActive,
										]}
									>
										{opt.label}
									</Text>
								</Pressable>
							))}
						</View>
					)}
				</View>

			</View>

			{/* Chart */}
			<View style={styles.card}>
				{selectedMonth && (
					<Pressable
						style={styles.overlay}
						onPress={() => setSelectedMonth(null)}
					/>
				)}


				{
					loading ?
						<View style={[{ height: 250, justifyContent: 'center', alignItems: 'center' }]}>
							<ActivityIndicator size="large" />
						</View>
						:
						<WebView
							ref={webViewRef}
							source={require("../../assets/charts/AssetHealthBar.html")}
							{...LOCAL_CHART_WEBVIEW_PROPS}
							javaScriptEnabled
							domStorageEnabled
							scrollEnabled={false}
							style={{ height: 260, width: "100%" }}
							onLoad={() => {
								webViewRef.current?.postMessage(JSON.stringify(rawSeries));
							}}
						/>
					// <BarChart
					// 	data={barData}
					// 	barWidth={BAR_WIDTH}
					// 	spacing={BAR_SPACING}
					// 	width={groupBy === "week" ? screenWidth + 200 : screenWidth}
					// 	barBorderRadius={4}
					// 	isAnimated
					// 	yAxisLabelWidth={25}
					// 	yAxisColor="rgba(0,0,0,0.1)"
					// 	xAxisColor="rgba(0,0,0,0.1)"
					// 	yAxisTextStyle={{ color: "#999", fontSize: 10 }}
					// 	xAxisLabelTextStyle={styles.axisLabel}
					// 	maxValue={maxValue}
					// 	noOfSections={yAxisInfo.sections}
					// 	yAxisLabelTexts={yAxisInfo.labels}
					// 	onPress={handleBarPress}
					// />


				}


				{/* Popup */}
				{selectedMonth && (
					<View
						style={[
							styles.popup,
							{ left: '50%', transform: [{ translateX: -50 }], },
						]}
					>
						<Text style={styles.popupTitle}>
							{selectedMonth.label}
						</Text>

						{Object.entries(selectedMonth.totals).map(
							([key, value]: any) => (
								<View key={key} style={styles.popupRow}>
									<View
										style={[
											styles.popupDot,
											{ backgroundColor: COLORS[key] },
										]}
									/>
									<Text style={styles.popupKey}>{key}</Text>
									<Text style={styles.popupValue}>{value}</Text>
								</View>
							)
						)}
					</View>
				)}
			</View>

			{/* Legends */}
			<View style={styles.legendContainer}>
				{["Healthy", "Alert", "Danger", "Critical"].map((type: any) => (
					<TouchableOpacity
						key={type}
						onPress={() => toggleSeries(type)}
						style={styles.legendItem}
					>
						<View
							style={[
								styles.legendDot,
								{ backgroundColor: enabledSeries[type] ? COLORS[type] : "rgba(0,0,0,0.2)", }
							]
							}
						/>
						<Text
							style={[
								styles.legendText,
								{
									opacity: enabledSeries[type] ? 1 : 0.3,
								},
							]}
						>
							{type}
						</Text>
					</TouchableOpacity>
				))}
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
		padding: 12,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
		minWidth: 120,
		zIndex: 10,
	},
	// legendContainer: {
	// 	flexDirection: "row",
	// 	justifyContent: "center",
	// 	marginTop: 10,
	// },
	// legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
	// legendDot: { height: 8, width: 8, borderRadius: 4, marginRight: 4 },
	// legendTitle: {
	// 	fontSize: 12,
	// 	fontFamily: Fonts.regular,
	// 	marginBottom: 6,
	// 	color: "#45515C",
	// },
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	legendColor: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 6,
	},
	// legendText: {
	// 	fontSize: 10,
	// 	fontFamily: Fonts.regular,
	// 	color: "#45515C",
	// },

	/* POPUP */
	popup: {
		position: "absolute",
		bottom: 140,
		backgroundColor: "#EFF2FC",
		borderRadius: 10,
		padding: 12,
		width: 140,
		zIndex: 10,
		shadowColor: "#000",
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 6,
	},
	popupTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 13,
		marginBottom: 8,
		color: "#2D3748",
	},
	popupRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	popupDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 6,
	},
	popupKey: {
		flex: 1,
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#45515C",
	},
	popupValue: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#2D3748",
	},

	legendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 8,
	},
	legendDot: {
		height: 10,
		width: 10,
		borderRadius: 5,
		marginRight: 4,
	},
	legendText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#45515C",
	},
	dropdown: {
		position: "absolute",
		top: 36,
		right: 0,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		zIndex: 50,
		width: 120,
		elevation: 6,
	},

	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 12,
	},

	dropdownText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#201F23",
	},

	dropdownActive: {
		fontFamily: Fonts.semiBold,
		color: "#2563EB",
	},

});

import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { alarmsSummary } from "@/src/services/alarms.service";
import WebView from "react-native-webview";
import Fonts from "@/constants/Typography";
import { collectSelectedAssetIdsWithChildren, type SelectableTreeNode } from "@/src/utils/assetSelection";
import { LOCAL_CHART_WEBVIEW_PROPS } from "@/src/utils/localChartWebView";

type ChartDataType = {
	timestamps: string[];
	critical: number[];
	alert: number[];
	danger: number[];
};

type ChartScaleType = {
	minValue: number;
	maxValue: number;
	noOfSections: number;
};

const chartUrl = "file:///android_asset/charts/asset-health.html";
const outsideChartTapScript = `
	(function () {
		function bindOutsideTapClear() {
			const canvas = document.getElementById("alarmChart");
			if (!canvas || typeof chart === "undefined" || !chart) {
				return false;
			}

			canvas.onclick = function (evt) {
				const points = chart.getElementsAtEventForMode(
					evt,
					"nearest",
					{ intersect: true },
					false
				);

				if (!points || points.length === 0) {
					chart.setActiveElements([]);
					if (chart.tooltip) {
						chart.tooltip.setActiveElements([], { x: 0, y: 0 });
					}
					chart.update();
				}
			};

			return true;
		}

		if (!bindOutsideTapClear()) {
			let attempts = 0;
			const timer = setInterval(function () {
				attempts += 1;
				if (bindOutsideTapClear() || attempts > 20) {
					clearInterval(timer);
				}
			}, 80);
		}
	})();
	true;
`;

export default function AlarmSummary() {
	const webRef = useRef<WebView>(null);

	const [loading, setLoading] = useState(false);
	const [showCritical, setShowCritical] = useState(true);
	const [showAlert, setShowAlert] = useState(true);
	const [showDanger, setShowDanger] = useState(true);

	const childAssets = useOverviewStore((state) => state.childAssets);
	const selectedAssets = useOverviewStore((state) => state.selectedAssets);

	const [chartData, setChartData] = useState<ChartDataType>({
		timestamps: [],
		critical: [],
		alert: [],
		danger: [],
	});

	const [chartScale, setChartScale] = useState<ChartScaleType>({
		minValue: 0,
		maxValue: 1,
		noOfSections: 1,
	});

	const fetchAlarmHistorySummary = async () => {
		if (!childAssets.length || !selectedAssets.length) {
			setChartData({
				timestamps: [],
				critical: [],
				alert: [],
				danger: [],
			});
			setChartScale({
				minValue: 0,
				maxValue: 1,
				noOfSections: 1,
			});
			return;
		}

		try {
			setLoading(true);

			const payload = {
				asset_list: collectSelectedAssetIdsWithChildren(
					childAssets as SelectableTreeNode[],
					selectedAssets
				),
			};
			console.log('alarm payload = ', payload);
			if (!payload.asset_list.length) {
				setChartData({
					timestamps: [],
					critical: [],
					alert: [],
					danger: [],
				});
				setChartScale({
					minValue: 0,
					maxValue: 1,
					noOfSections: 1,
				});
				return;
			}

			const res = await alarmsSummary(payload);
			if (!res?.data?.length) return;

			const data = res?.data?.[0];

			const timestamps = data?.timestamp ?? [];
			const critical = data?.series?.find((i: any) => i.name === "Critical")?.data ?? [];
			const alert = data?.series?.find((i: any) => i.name === "Alert")?.data ?? [];
			const danger = data?.series?.find((i: any) => i.name === "Danger")?.data ?? [];

			const values = [...critical, ...alert, ...danger];
			const hasData = timestamps.length > 0 && values.length > 0;

			if (!hasData) {
				setChartData({
					timestamps: [],
					critical: [],
					alert: [],
					danger: [],
				});
				setChartScale({
					minValue: 0,
					maxValue: 1,
					noOfSections: 1,
				});
				return;
			}

			const rawMax = Math.max(...values, 0);
			const rawMin = Math.min(...values, 0);

			const maxValue = rawMax === 0 ? 1 : rawMax;
			const minValue = rawMin < 0 ? rawMin : 0;

			const range = maxValue - minValue;
			const noOfSections = range <= 10 ? Math.max(range, 1) : range <= 50 ? 5 : 6;

			setChartScale({
				minValue,
				maxValue,
				noOfSections,
			});

			setChartData({
				timestamps,
				critical,
				alert,
				danger,
			});
		} catch (e) {
			// optional: console.log(e)
		} finally {
			setLoading(false);
		}
	};

	const buildWebPayload = () => ({
		...chartData,
		...chartScale,
		showCritical,
		showAlert,
		showDanger,
	});

	const applyOutsideTapBehavior = () => {
		webRef.current?.injectJavaScript(outsideChartTapScript);
	};

	useEffect(() => {
		if (!webRef.current) return;
		if (!chartData.timestamps.length) return;


		webRef.current.postMessage(JSON.stringify(buildWebPayload()));
		applyOutsideTapBehavior();
	}, [chartData, chartScale, showCritical, showAlert, showDanger]);

	useEffect(() => {
		fetchAlarmHistorySummary();
	}, [childAssets, selectedAssets]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Alarm Summary</Text>

			{loading ? (
				<View style={styles.loader}>
					<ActivityIndicator size="large" />
				</View>
			) : !chartData.timestamps.length ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>
						No Alarm Data found for selected location
					</Text>
				</View>
			) : (
				<View style={styles.webviewContainer}>
					<WebView
						ref={webRef}
						// source={require("../../assets/charts/asset-health.html")}
						source={{ uri: chartUrl }}
						{...LOCAL_CHART_WEBVIEW_PROPS}
						javaScriptEnabled
						domStorageEnabled
						onLoadEnd={() => {
							webRef.current?.postMessage(JSON.stringify(buildWebPayload()));
							applyOutsideTapBehavior();
						}}
					/>
				</View>
			)}

			{chartData.timestamps.length > 0 && (
				<View style={styles.legendContainer}>
					<Legend label="Alert" color="#FFEB3B" active={showAlert} onPress={() => setShowAlert(!showAlert)} />
					<Legend label="Critical" color="#E53935" active={showCritical} onPress={() => setShowCritical(!showCritical)} />
					<Legend label="Danger" color="#FF9800" active={showDanger} onPress={() => setShowDanger(!showDanger)} />
				</View>
			)}
		</View>
	);
}

function Legend({ label, color, active, onPress }: any) {
	return (
		<TouchableOpacity style={styles.legendItem} onPress={onPress}>
			<View style={[styles.legendDot, { backgroundColor: active ? color : "#ccc" }]} />
			<Text style={[styles.legendText, { color: active ? "#444" : "#bbb" }]}>{label}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		marginBottom: 8,
		color: "#201F23",
	},
	loader: {
		height: 320,
		justifyContent: "center",
		alignItems: "center",
	},
	webviewContainer: {
		height: 320,
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: "#fff",
	},
	emptyState: {
		height: 320,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	emptyText: {
		fontSize: 13,
		fontFamily: Fonts.bold,
		color: "#000069",
		textAlign: "center",
	},
	legendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 12,
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
	},
});

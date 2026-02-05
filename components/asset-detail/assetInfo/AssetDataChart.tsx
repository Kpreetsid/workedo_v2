import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Modal, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { useGestureLock } from "@/src/store/useGestureLock";
import ChartDetailModal from "./ChartDetailModal";
import { useFocusEffect } from "expo-router";

import * as ScreenOrientation from 'expo-screen-orientation';

export default function AssetDataChart({
	chartSeries,
	xLabels,
	yMaxValue,
	loading,
	asset_data
}: any) {
	const [detailModalVisible, setDetailModalVisible] = useState(false);
	const [selectedPoint, setSelectedPoint] = useState<any>(null);

	const ref = useRef<WebView>(null);
	const initializedRef = useRef(false);
	const [webReady, setWebReady] = useState(false);

	const lock = useGestureLock((s) => s.lock);
	const unlock = useGestureLock((s) => s.unlock);

	// console.log('chart series in assets data chart =  = ', chartSeries)
	console.log('chart series = ', chartSeries.map((s: any) => ({ axis: s.axis, unit: s.unit })));

	// ✅ SAFELY sanitize once (no hooks involved)
	const validSeries = Array.isArray(chartSeries)
		? chartSeries.filter(
			(s: any) => s && Array.isArray(s.points) && s.points.length > 0
		)
		: [];

	const showEmpty = Array.isArray(chartSeries) && chartSeries.length === 0;

	// ✅ HOOKS MUST ALWAYS RUN
	useEffect(() => {
		if (!webReady) return;
		if (validSeries.length === 0) {
			ref.current?.postMessage(JSON.stringify([]));
			return;
		}

		const allValues = validSeries.flatMap((s: any) =>
			s.points.map((p: any) => p.value)
		);

		const derivedMin = Math.min(...allValues);
		const maxX =
			Math.max(...validSeries.map((s: any) => s.points.length)) - 1;

		const yUnit = validSeries[0]?.unit ?? "";

		const payload = {
			type: initializedRef.current ? "UPDATE" : "INIT",
			yMax: yMaxValue,
			yMin: derivedMin,
			maxX,
			xLabels,
			// 🔴 MUST EXIST ON INIT
			yUnit,
			series: validSeries.map((s: any) => ({
				axis: s.axis,
				color:
					s.axis === "Horizontal"
						? "#01d711"
						: s.axis === "Vertical"
							? "#1237ff"
							: "#ff0000",
				points: s.points.map((p: any) => ({
					y: p.value,
					fullDate: p.fullDate,
					flag: p.flag
				})),
			})),
		};

		console.log('payload for asset data chart = ', payload)

		ref.current?.postMessage(JSON.stringify(payload));
		initializedRef.current = true;
	}, [webReady, validSeries, xLabels, yMaxValue]);

	useFocusEffect(
		useCallback(() => { }, [
			ScreenOrientation.lockAsync(
				ScreenOrientation.OrientationLock.PORTRAIT
			)
		])
	);

	const chartUrl = "file:///android_asset/charts/chart.html";

	return (
		<View style={styles.wrapper}>
			{/* WebView ALWAYS mounted */}
			<WebView
				ref={ref}
				originWhitelist={["*"]}
				source={require("../../../assets/charts/chart.html")}
				// source={{ uri: chartUrl }}

				javaScriptEnabled={true}
				domStorageEnabled={true}
				allowFileAccess={true}
				allowFileAccessFromFileURLs={true}
				allowUniversalAccessFromFileURLs={true}

				webviewDebuggingEnabled
				onLoadEnd={() => setWebReady(true)}
				onMessage={(e) => {
					const data = e.nativeEvent.data;

					try {
						const message = JSON.parse(data);

						if (message.type === "POINT_TAP") {
							console.log("POINT_TAP:", message.payload);
						}

						if (message.type === "VIEW_DETAILS") {
							console.log("VIEW_DETAILS:", message.payload);
							setSelectedPoint(message.payload);
							setDetailModalVisible(true);
						}

					} catch {
						// ignore non-JSON messages
					}
				}}

			/>

			{/* Loader overlay */}
			{loading && !showEmpty && (
				<View style={styles.overlay}>
					<ActivityIndicator size="large" />
				</View>
			)}

			{/* Empty state overlay */}
			{(showEmpty || (!loading && validSeries.length === 0)) && (
				<View style={styles.overlay}>
					<Text style={styles.emptyText}>No data found for chart.</Text>
				</View>
			)}

			<ChartDetailModal
				visible={detailModalVisible}
				onClose={() => setDetailModalVisible(false)}
				asset_data={asset_data}
				selectedPoint={selectedPoint}
			/>


		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		height: 220,
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "#fff",
	},

	emptyContainer: {
		height: 300,
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 10,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},

	emptyText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1a237e",
		textAlign: "center",
	},
	loaderContainer: {
		height: 220,
		justifyContent: "center",
		alignItems: "center",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.8)",
	}, modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},

	modalContainer: {
		height: "90%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		padding: 16,
	},

	modalTitle: {
		fontSize: 16,
		fontWeight: "700",
	},

	modalClose: {
		marginTop: 20,
		alignSelf: "center",
	},


});

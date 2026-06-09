import { useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Pressable,
	ActivityIndicator,
} from "react-native";
import WebView from "react-native-webview";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import { useOverviewStore } from "@/src/state/app/useOverviewStore";
import { assetHealthStatus } from "@/src/services/asset.service";
import { LOCAL_CHART_WEBVIEW_PROPS } from "@/src/utils/localChartWebView";

/* ================= COLORS ================= */
// const COLORS: any = {
// 	Healthy: "#22C55E",
// 	Alert: "#FACC15",
// 	Danger: "#F97316",
// 	Critical: "#EF4444",
// };

const chartURL = 'file:///android_asset/charts/AssetHealthBar.html'

export default function AssetHealth() {
	const webViewRef = useRef<WebView>(null);

	/* ================= STATE ================= */
	const [groupBy, setGroupBy] = useState<"month" | "week">("month");
	const [showDropdown, setShowDropdown] = useState(false);
	const [loading, setLoading] = useState(false);
	const [webReady, setWebReady] = useState(false); // ✅ IMPORTANT

	const selectedAssets = useOverviewStore((s)=>s.selectedAssets);
	const [rawSeries, setRawSeries] = useState<any>(null);

	/* ================= FETCH DATA ================= */
	const fetchAssetHealth = async () => {
		try {
			setLoading(true);

			const payload = {
				asset_list: selectedAssets,
				group_by: groupBy,
			};
			const res = await assetHealthStatus(payload);
			setRawSeries(res?.data ?? null);
			setLoading(false);
		} catch (e) {
			setLoading(false);
		}
	};

	/* ================= FETCH TRIGGER ================= */
	useEffect(() => {
		if (selectedAssets.length === 0) {
			setRawSeries(null);
			return;
		}
		fetchAssetHealth();
	}, [selectedAssets, groupBy]);

	/* ================= BUILD PAYLOAD FOR WEBVIEW ================= */
	const chartPayload = useMemo(() => {
		if (!rawSeries) return null;

		return {
			groupBy,
			labels: rawSeries.timestamp,
			Healthy:
				rawSeries.series.find((s: any) => s.name === "Healthy")?.data ?? [],
			Alert:
				rawSeries.series.find((s: any) => s.name === "Alert")?.data ?? [],
			Danger:
				rawSeries.series.find((s: any) => s.name === "Danger")?.data ?? [],
			Critical:
				rawSeries.series.find((s: any) => s.name === "Critical")?.data ?? [],
		};
	}, [rawSeries, groupBy]);

	/* ================= SEND DATA TO WEBVIEW (SAFE) ================= */
	useEffect(() => {
		if (!webReady) return;
		if (!chartPayload) return;

		webViewRef.current?.postMessage(JSON.stringify(chartPayload));
	}, [chartPayload, webReady]);

	useEffect(() => {
		setWebReady(false);
	}, [groupBy]);

	/* ================= UI ================= */
	return (
		<View style={styles.container}>
			{/* HEADER */}
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Asset Health</Text>

				{/* DROPDOWN */}
				<View style={{ position: "relative" }}>
					<TouchableOpacity
						style={styles.badge}
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

			{/* CHART */}
			<View style={styles.card}>
				{loading ? (
					<View style={styles.loader}>
						<ActivityIndicator size="large" />
					</View>
				) : !chartPayload ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyText}>
							No Asset Health Data found for selected location.
						</Text>
					</View>
				) : (
					<WebView
						key={groupBy} // 🔥 FORCE REMOUNT ON MONTH/WEEK CHANGE
						ref={webViewRef}
						source={{ uri: chartURL }}
						// source={require("@/assets/charts/AssetHealthBar.html")}
						{...LOCAL_CHART_WEBVIEW_PROPS}
						javaScriptEnabled
						domStorageEnabled
						scrollEnabled={false}
						style={{ height: 260, width: "100%" }}
						onLoadEnd={() => setWebReady(true)}
					/>
				)}
			</View>
		</View>
	);
}

/* ================= STYLES ================= */
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
		backgroundColor: "#FFFFFF",
		borderRadius: 15,
		padding: 20,
		elevation: 3,
	},
	loader: {
		height: 260,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyState: {
		height: 260,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		fontSize: 13,
		fontFamily: Fonts.bold,
		color: "#000069",
		textAlign: "center",
	},
	dropdown: {
		position: "absolute",
		top: 36,
		right: 0,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E1E8EE",
		width: 120,
		zIndex: 50,
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

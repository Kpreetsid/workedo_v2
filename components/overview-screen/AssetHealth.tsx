import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { assetHealthStatus } from "@/src/services/asset.service";

// Define series colors
const COLORS = {
	Healthy: "#22C55E",
	Alert: "#FACC15",
	Danger: "#F97316",
	Critical: "#EF4444",
};

const screenWidth = Dimensions.get("window").width;

export default function AssetHealth() {
	const [selectedBar, setSelectedBar] = useState<number | null>(null);
	const [barData, setBarData] = useState<any[]>([]);
	const { childAssets } = useOverviewStore();

	const fetchAssetHealth = async () => {
		const payload = {
			asset_list: childAssets.map((item) => item.id),
			group_by: "month",
		};

		try {
			const res = await assetHealthStatus(payload);
			console.log("res health status =", res);

			const timestamps: string[] = res?.data?.timestamp ?? [];
			const healthy = res?.data?.series?.find((s: any) => s.name === "Healthy")?.data ?? [];
			const alert = res?.data?.series?.find((s: any) => s.name === "Alert")?.data ?? [];
			const danger = res?.data?.series?.find((s: any) => s.name === "Danger")?.data ?? [];
			const critical = res?.data?.series?.find((s: any) => s.name === "Critical")?.data ?? [];

			// helper: label like "Aug" or "Aug-25"
			const shortLabel = (full: string) => {
				const [m, y] = (full ?? "").split("-");
				if (!m || !y) return full ?? "";
				return `${m.slice(0, 3)}`;            // use 'Aug' only
				// return `${m.slice(0,3)}-${y.slice(2)}`; // or 'Aug-25' if you prefer
			};

			// ✅ flat array: [H, A, D, C] for month 0, then [H, A, D, C] for month 1, ...
			const flat: { value: number; label: string; frontColor: string }[] = [];
			const COLORS = { Healthy: "#22C55E", Alert: "#FACC15", Danger: "#F97316", Critical: "#EF4444" };

			for (let i = 0; i < timestamps.length; i++) {
				const label = shortLabel(timestamps[i]);
				flat.push({ value: healthy[i] || 0, label, frontColor: COLORS.Healthy });
				flat.push({ value: alert[i] || 0, label, frontColor: COLORS.Alert });
				flat.push({ value: danger[i] || 0, label, frontColor: COLORS.Danger });
				flat.push({ value: critical[i] || 0, label, frontColor: COLORS.Critical });
			}

			setBarData(flat);
		} catch (error) {
			console.log("error =", error);
		}
	};

	useEffect(() => {
		if (childAssets.length === 0) return;
		fetchAssetHealth();
	}, [childAssets]);

	// ✅ Dynamic Y-axis scaling
	const maxValue = useMemo(() => {
		console.log("barData = ", barData);
		const allVals = barData.flatMap((b: any) =>
			b.value
		);
		const rawMax = Math.max(...allVals, 0);
		return rawMax <= 10
			? 10
			: rawMax <= 50
				? Math.ceil(rawMax / 5) * 5
				: Math.ceil(rawMax / 10) * 10;
	}, [barData]);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.cardHeader}>
				<Text style={styles.cardTitle}>Asset Health</Text>
				<TouchableOpacity style={styles.badge} activeOpacity={0.8}>
					<Calender />
					<Text style={styles.badgeText}>Monthly</Text>
					<DropDownIcon />
				</TouchableOpacity>
			</View>

			{/* Chart */}
			<View style={styles.card}>
				{selectedBar !== null && (
					<Pressable style={styles.overlay} onPress={() => setSelectedBar(null)} />
				)}

				<BarChart
					data={barData}
					barWidth={15}
					barBorderRadius={4}
					spacing={3}
					isAnimated
					hideRules
					yAxisLabelWidth={25}
					yAxisColor="rgba(0,0,0,0.1)"
					xAxisColor="rgba(0,0,0,0.1)"
					xAxisLabelTextStyle={styles.axisLabel}
					yAxisTextStyle={{ color: "#999", fontSize: 10 }}
					maxValue={maxValue}
					noOfSections={5}
				/>


				{/* Floating Tooltip */}
				{selectedBar !== null && (
					<View style={[styles.tooltip, { left: 25 + selectedBar * (30 + 20) }]}>
						<Text style={styles.legendTitle}>{barData[selectedBar].label}</Text>
						{barData[selectedBar].stacks.map((stack: any, idx: number) => (
							<View key={idx} style={styles.legendRow}>
								<View
									style={[styles.legendColor, { backgroundColor: stack.color }]}
								/>
								<Text style={styles.legendText}>
									{stack.label}: {stack.value}
								</Text>
							</View>
						))}
					</View>
				)}
			</View>

			{/* Legends */}
			<View style={styles.legendContainer}>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
					<Text style={styles.legendText}>Healthy</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#FACC15" }]} />
					<Text style={styles.legendText}>Alert</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
					<Text style={styles.legendText}>Danger</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
					<Text style={styles.legendText}>Critical</Text>
				</View>
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
	legendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
	legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: 8 },
	legendDot: { height: 8, width: 8, borderRadius: 4, marginRight: 4 },
	legendTitle: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		marginBottom: 6,
		color: "#45515C",
	},
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
	legendText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#45515C",
	},
});

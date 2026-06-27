import { ScrollView, Text, View, StyleSheet, Pressable } from "react-native";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function InfoCards() {
	const router = useRouter();
	const assetKPIHistory = useOverviewStore((state) => state.assetKPIHistory);
	// console.log("assetKPIHistory", assetKPIHistory);

	// ✅ Local derived state (single source of truth for UI)
	const emptyStats = {
		Critical: 0,
		Danger: 0,
		Alert: 0,
		Healthy: 0,
		NotDefined: 0,
		openAlarms: 0,
		total_live_sensors: 0,
	};
	const [stats, setStats] = useState(emptyStats);

	useEffect(() => {
		if (!assetKPIHistory) {
			setStats(emptyStats);
			return;
		}

		const top = assetKPIHistory.top_level_asset;

		setStats({
			Critical: top.Critical,
			Danger: top.Danger,
			Alert: top.Alert,
			Healthy: top.Healthy,
			NotDefined: top["Not Defined"],
			openAlarms: top.openAlarms,
			total_live_sensors: top.total_live_sensors,
		});
	}, [assetKPIHistory]);

	const infoCardsData = [
		{
			id: 1,
			title: `Assets\nMonitored`,
			value:
				stats.Alert +
				stats.Critical +
				stats.Danger +
				stats.Healthy +
				stats.NotDefined,
			color: "#3b82f6",
		},
			{
				id: 2,
				title: `Assets in\nDanger Zone`,
				value: stats.Danger,
				color: "#F97316",
			},
		{
			id: 3,
			title: `Assets in\nCritical Zone`,
			value: stats.Critical,
			color: "#DC3545",
		},
			{
				id: 4,
				title: `Un-Addressed\nAlarms`,
				value: stats.openAlarms,
				color: "#FFC107",
			},
		{
			id: 5,
			title: `Total End\nPoints`,
			value: stats.total_live_sensors,
			color: "#212529",
		},
	];

	const handlePress = async (card_id: number) => {
		if (card_id === 4 || card_id === 5) return;
		if (card_id === 1 && (stats.Alert +
			stats.Critical +
			stats.Danger +
			stats.Healthy +
			stats.NotDefined === 0)) {
			return;
		}

		if(card_id === 2 && stats.Danger === 0) return;

		if(card_id === 3 && stats.Critical === 0) return;

		router.push({
			pathname: "/assets",
			params: {
				comingFrom: "overview",
				card_id: card_id,
				initialIndex: "1" // must be string
			}
		});
	}

	return (
		<ScrollView horizontal contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false}>
			{infoCardsData.map((card) => {
				return (
					<Pressable
						key={card.id}
						style={({ pressed }) => [
							styles.card,
							{ borderColor: card.color },
							pressed && { backgroundColor: "#fadb7d" },
						]}
						onPress={() => handlePress(card.id)}
					>
						<View style={styles.topRow}>
							<AssetStatus />
							<Text
								style={styles.cardLabel}
								numberOfLines={2}
								adjustsFontSizeToFit
							>
								{card.title}
							</Text>
						</View>

						<Text style={[styles.cardValue, { color: card.color }]}>
							{card.value}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		marginTop: 20,
		paddingHorizontal: 20,
		alignItems: "center",
		gap: 20,
	},
	card: {
		borderRadius: 10,
		padding: 8,
		width: 150,
		height: 85,
		backgroundColor: "#fff",
		borderWidth: 0.1,
		justifyContent: "space-between",
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 20
	},
	cardLabel: {
		color: "#201F23",
		fontSize: 12,
		fontFamily: Fonts.light,
		flexShrink: 1,
	},
	cardValue: {
		fontSize: 16,
		fontFamily: Fonts.regular,
		alignSelf: "flex-end",
	},
})

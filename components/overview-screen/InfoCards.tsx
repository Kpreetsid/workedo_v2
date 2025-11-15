import { ScrollView, Text, View, StyleSheet } from "react-native";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useOverviewStore } from "@/src/store/useOverviewStore";

export default function InfoCards() {
	const { assetKPIHistory } = useOverviewStore();
	console.log("assetKPIHistory", assetKPIHistory);

	const Critical = assetKPIHistory?.Critical ?? 0;
	const Danger = assetKPIHistory?.Danger ?? 0;
	const Alert = assetKPIHistory?.Alert ?? 0;
	const Healthy = assetKPIHistory?.Healthy ?? 0;
	const NotDefined = assetKPIHistory?.["Not Defined"] ?? 0;
	const openAlarms = assetKPIHistory?.openAlarms ?? 0;
	const total_live_sensors = assetKPIHistory?.["total_live_sensors"] ?? 0;

	const infoCardsData = [
		{
			id: 1,
			title: `Assets\nMonitored`,
			value: Alert + Critical + Danger + Healthy + NotDefined,
			color: "#3b82f6",
		},
		{
			id: 2,
			title: `Assets in\nDanger Zone`,
			value: Danger,
			color: "#FFC107",
		},
		{
			id: 3,
			title: `Assets in\nCritical Zone`,
			value: Critical,
			color: "#DC3545",
		},
		{
			id: 4,
			title: `Un-Addressed\nAlarms`,
			value: openAlarms,
			color: "#16CCF1",
		},
		{
			id: 5,
			title: `Total End\nPoints`,
			value: total_live_sensors,
			color: "#212529",
		},
	];

	return (
		<ScrollView horizontal contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false}>
			{infoCardsData.map((card) => (
				<View
					key={card.id}
					style={[styles.card, { borderColor: card.color }]}
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
				</View>
			))}
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

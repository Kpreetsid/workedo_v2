import { ScrollView, Text, View, StyleSheet } from "react-native";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

export default function CMMSInfoCards() {

	return (
		<ScrollView horizontal contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false} nestedScrollEnabled>
			{InfoCardsData.map(card => (
				<View key={card.id} style={[styles.card, { borderColor: card.color }]}>
					<View style={styles.topRow}>
						<AssetStatus />
						<Text style={styles.cardLabel} numberOfLines={2} adjustsFontSizeToFit>{card.title}</Text>
					</View>
					<Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
				</View>
			))}
		</ScrollView>
	)
}

    const InfoCardsData = [
    {id:1, title: `On Time\nCompletion Rate`, value: 0, color: "#3b82f6"},
    {id:2, title: `Work Order\nOverdue`, value: 0, color: "#FFC107"},
    {id:3, title: `Pending\Work Requests`, value: 1, color: "#DC3545"},
    {id:4, title: `Planned vs\nUnplanned`, value: 1, color: "#16CCF1"},
];

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
		width: 187,
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

import { ScrollView, Text, View, StyleSheet } from "react-native";
import infoCardsData from "../../constants/InfoCardsData";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

export default function InfoCards() {
	return (
		<ScrollView horizontal contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false}>
			{infoCardsData.map(card => (
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

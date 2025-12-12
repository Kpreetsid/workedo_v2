import { ScrollView, Text, View, StyleSheet } from "react-native";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useEffect, useState } from "react";
import { woSummary } from "@/src/services/cmms.service";

export default function CMMSInfoCards() {
	const childAssets = useCMMSStore((state) => state.childAssets);
	// console.log('child assets in wo status = ', childAssets);

	const [woInfoCards, setWOInfoCards] = useState<any>(null);

	useEffect(() => {
		fetchInfoCards();
	}, [childAssets])

	async function fetchInfoCards() {
		try {
			const childAssetsFormatted = (childAssets.map((item) => item.id)).join(",")
			// console.log('payload = ', childAssetsFormatted);

			const res = await woSummary(
				'2025-10-11T19:00:00.000Z',
				'2025-12-12T10:40:53.984Z',
				childAssetsFormatted
			);
			if (res?.status) {
				// console.log('res WO info cards = ', res?.data);
				setWOInfoCards(res?.data)
			}
		} catch (e) {
			// console.log('e in status = ', e);
		}
	}

	return (
		<ScrollView horizontal contentContainerStyle={styles.container} showsHorizontalScrollIndicator={false} nestedScrollEnabled>
			{InfoCardsData.map(card => (
				<View key={card.id} style={[styles.card, { borderColor: card.color }]}>
					<View style={styles.topRow}>
						<AssetStatus />
						<Text style={styles.cardLabel} numberOfLines={2} adjustsFontSizeToFit>{card.title}</Text>
					</View>
					<Text style={[styles.cardValue, { color: card.color }]}>
						{
							card.id === 1 ? woInfoCards?.completion_rate :
							card.id === 2 ? woInfoCards?.overdue_WO :
							card.id === 3 ? woInfoCards?.work_request_count :
							card.id === 4 ? woInfoCards?.planned_unplanned_ratio : null
						}
					</Text>
				</View>
			))}
		</ScrollView>
	)
}

const InfoCardsData = [
	{ id: 1, title: `On Time\nCompletion Rate`, value: 0, color: "#3b82f6" },
	{ id: 2, title: `Work Order\nOverdue`, value: 0, color: "#FFC107" },
	{ id: 3, title: `Pending\Work Requests`, value: 1, color: "#DC3545" },
	{ id: 4, title: `Planned vs\nUnplanned`, value: 1, color: "#16CCF1" },
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

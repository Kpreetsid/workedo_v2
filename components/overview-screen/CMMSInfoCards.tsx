import { ScrollView, Text, View, StyleSheet } from "react-native";
import { AssetStatus } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { useCMMSStore } from "@/src/store/useCMMSStore";
import { useEffect, useState } from "react";
import { woSummary } from "@/src/services/cmms.service";
import { useDateRangeStore } from "@/src/store/useDateRangeStore";
import moment from "moment";
import { collectSelectedAssetIdsWithChildren, type SelectableTreeNode } from "@/src/utils/assetSelection";

export default function CMMSInfoCards() {
	const childAssets = useCMMSStore((state) => state.childAssets);
	const selectedAssets = useCMMSStore((state) => state.selectedAssets);
	// console.log('selected assets in wo status = ', selectedAssets);

	const [woInfoCards, setWOInfoCards] = useState<any>(null);
	const { startDate, endDate, rangeVersion } = useDateRangeStore();

	useEffect(() => {
		// console.log('because of start date - ', startDate, selectedAssets);
		if (selectedAssets.length > 0 && childAssets.length > 0) {
			fetchInfoCards();
			return;
		}

		setWOInfoCards(null);
	}, [selectedAssets, childAssets, startDate, endDate, rangeVersion])

	async function fetchInfoCards() {
		const startTimePart = "T11:00:00.946Z";
		const timePart = "T13:39:00.946Z";
		try {
			const selectedAssetsWithChildren = collectSelectedAssetIdsWithChildren(
				childAssets as SelectableTreeNode[],
				selectedAssets
			);
			const selectedAssetsFormatted = selectedAssetsWithChildren.join(",");
			if (!selectedAssetsFormatted) {
				setWOInfoCards(null);
				return;
			}

			let finalPayload: any = {};
			// prepare for payload
			if (startDate) {
				finalPayload.startDate = moment(startDate, "YYYY-MM-DD").format("YYYY-MM-DD") + startTimePart;
			} else {
				finalPayload.startDate = moment().subtract(1, "week").format("YYYY-MM-DD") + startTimePart;
			}

			if (endDate) {
				finalPayload.endDate = endDate + timePart;
			} else {
				finalPayload.endDate = moment().format("YYYY-MM-DD") + timePart;
			}

			finalPayload.assetIds = selectedAssetsFormatted

			console.log('final payload info cards = ', finalPayload);

			const res = await woSummary(finalPayload);
			if (res?.status && res?.data) {
				console.log('res WO info cards = ', res?.data);
				setWOInfoCards(res?.data)
				return;
			}

			setWOInfoCards(null);
		} catch (e) {
			// console.log('e in status = ', e);
			setWOInfoCards(null);
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
	{ id: 3, title: `Pending\nWork Requests`, value: 1, color: "#DC3545" },
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

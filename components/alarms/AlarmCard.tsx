import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { AlarmItem } from '@/src/types/alarm';
import Fonts from '@/constants/Typography';
import moment from 'moment';
import { useRouter } from 'expo-router';

const AlarmCard = ({ item }: { item: AlarmItem }) => {
	const router = useRouter();

	return (
		<Pressable key={item.id}
			style={({ pressed }) => [
				styles.card,
				pressed && { backgroundColor: "#fadb7d" },
			]}
			onPress={() => {
				console.log('item clicked = ', item);
				router.push({
					pathname: "/assetDetail",
					params: { id: item.asset_id },
				});
			}}>
			<View style={styles.cardHeader}>
				<View>
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
						<View>
							<Text style={styles.assetTitle}>{item.asset_name}</Text>
							<Text style={styles.assetSubtitle}>
								{item.signal_type} - {item.trend_type}
							</Text>
						</View>

						<View style={[styles.statusTag, item.priority === "Critical" ? styles.dangerTag : styles.resolvedTag]}>
							<View style={[styles.statusDot, { backgroundColor: item.priority === "Critical" ? "#FF5C5C" : "#4CAF50" }]} />
							<Text style={[styles.statusText, { color: item.priority === "Critical" ? "#FF5C5C" : "#4CAF50" }]}>
								{item.priority}
							</Text>
						</View>
					</View>

					<View style={[styles.row, { width: "100%" }]}>
						<View>
							<Text style={styles.smallLabel}>Set Threshold</Text>
							<Text style={styles.value}>{item.threshold_value}</Text>
						</View>
						<View>
							<Text style={styles.smallLabel}>Observed Value</Text>
							<Text style={styles.value}>{item.observed_value}</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<Text style={[styles.assetSubtitle, { marginTop: 5 }]}>
					{item.sensor_location}
				</Text>

				<Text style={styles.timestamp}>{moment(item.timestamp).format("MMM DD, YYYY, h:mm:ss")}</Text>
			</View>
		</Pressable>
	);
}

export default AlarmCard;

const styles = StyleSheet.create({

	card: {
		backgroundColor: "#D9D9D915",
		borderRadius: 14,
		padding: 16,
		marginBottom: 12,
		marginHorizontal: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#D9D9D9",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		flexShrink: 1,
	},
	assetTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 2,
	},
	assetSubtitle: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#666",
	},
	statusTag: {
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 3,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	dangerTag: {
		backgroundColor: "rgba(255, 92, 92, 0.1)",
	},
	resolvedTag: {
		backgroundColor: "rgba(76, 175, 80, 0.1)",
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		marginRight: 4,
	},
	statusText: {
		fontSize: 11,
		fontFamily: Fonts.medium,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
		flexShrink: 1,
	},
	smallLabel: {
		fontSize: 11,
		color: "#A0A0A0",
		fontFamily: Fonts.regular,
	},
	value: {
		fontSize: 10,
		color: "#201F23",
		fontFamily: Fonts.medium,
		marginTop: 2,
	},
	timestamp: {
		alignSelf: "flex-end",
		fontSize: 9,
		color: "#999",
		fontFamily: Fonts.light,
	},
})
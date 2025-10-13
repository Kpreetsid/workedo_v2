import { Pressable, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Fonts from "../../constants/Typography";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { useAssetStore } from "@/src/store/useAssetStore";

export default function EndpointCards() {
	const endpoints = useAssetStore<AssetEndpoint[]>((state) => state.endpoints);
	const selectedSensor = useAssetStore((state) => state.selectedSensor);
	const setSelectedSensor = useAssetStore((state) => state.setSelectedSensor);

	const handleSelect = (ep: AssetEndpoint) => {
		setSelectedSensor(ep);
	};

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow} nestedScrollEnabled>
			{endpoints.map((ep) => {
				const isSelected = selectedSensor?.id === ep.id;
				return (
					<Pressable key={ep.id} onPress={() => handleSelect(ep)}>
						<View
							style={[
								styles.card,
								isSelected && {
									borderColor: "#5552FE",
									borderWidth: 2,
									shadowColor: "#5552FE",
									shadowOpacity: 0.3,
								},
							]}
						>
							<View style={styles.cardHeader}>
								<Text style={styles.cardMac}>{ep.mac_id}</Text>
								<Pressable onPress={() => console.log("Card menu")} style={styles.cardMenu}>
									<Fontisto name="more-v-a" size={15} color="#201F23" />
								</Pressable>
							</View>

							<View>
								<View style={styles.kindRow}>
									<View
										style={[
											styles.kindDot,
											ep.online === "True" ? styles.greenDot : styles.redDot,
										]}
									/>
									<Text style={styles.kindText}>
										{ep.online === "True" ? "Online" : "Offline"}
									</Text>
								</View>
							</View>

							<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
								<View>
									<Text style={styles.cardTitle}>End Point</Text>
									<Text style={styles.cardSub}>{ep.mount_location}</Text>
								</View>

								<View style={{ width: 1, backgroundColor: "#5552FE30", height: "70%" }} />

								<View>
									<Text style={styles.cardTitle}>Mount Direction</Text>
									<Text style={styles.cardSub}>{ep.mount_direction}</Text>
								</View>
							</View>

							<View style={styles.cardFooter}>
								<TouchableOpacity
									style={styles.iconBtn}
									onPress={() => console.log("Settings pressed")}
								>
									<MaterialCommunityIcons name="cog-outline" size={13} color="#fff" />
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.iconBtn}
									onPress={() => console.log("Some action")}
								>
									<Ionicons name="radio" size={13} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>
					</Pressable>
				);
			})}
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	cardsRow: {
		alignItems: "flex-start",
		padding: 16,
		gap: 12
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		padding: 12,
		shadowColor: "#742BDE",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
		borderWidth: 0.3,
		borderColor: "#742BDE"
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cardMac: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		borderWidth: 0.3,
		borderColor: "#002143",
		borderRadius: 2,
		padding: 4,
		textTransform: 'capitalize'
	},
	cardMenu: {
		padding: 6,
	},
	kindRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	kindDot: {
		width: 8,
		height: 8,
		borderRadius: 8,
		marginRight: 8,
	},
	greenDot: {
		backgroundColor: "#32CD32",
	},
	redDot: {
		backgroundColor: "#FF3B30",
	},
	kindText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	cardTitle: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	cardSub: {
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#6B7888",
		textTransform: 'capitalize'
	},
	cardFooter: {
		marginTop: 2,
		flexDirection: "row",
		justifyContent: "space-between"
	},
	iconBtn: {
		width: 22,
		height: 22,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#E7DFFF",
		backgroundColor: "#5552FE",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
})
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Fonts from "@/constants/Typography";
import { Academy, ContactSupport, MoreTabIcons } from "@/constants/IconProvider";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MoreTabItem = | "Gateways" | "Requests" | "PartsInventory" | "Config" | "Monitoring" | "Preventive";

interface MoreTabModalProps {
	modalVisible: boolean;
	setModalVisible: (visible: boolean) => void;
}

const items: MoreTabItem[] = ["Gateways", "Requests", "PartsInventory", "Config", "Monitoring", "Preventive"];

export default function MoreTabModal({ modalVisible, setModalVisible }: MoreTabModalProps) {
	return (
		<Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
			<TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
				<View style={styles.modalOverlay} />
			</TouchableWithoutFeedback>

			<View style={[styles.bottomSheet, { marginBottom: useSafeAreaInsets().bottom + 70 }]}>
				<FlatList
					data={items}
					keyExtractor={(_, index) => String(index)}
					numColumns={3}
					renderItem={({ item }) => {
						const Icon = MoreTabIcons[item];
						return (
							<View style={styles.gridItem}>
								<Pressable style={styles.sheetButton} onPress={() => {
									setModalVisible(false)
									if (item === "Gateways") router.push("/gateways");
									if (item === "Requests") router.push("/requests");
									if (item === "PartsInventory") router.push("/partsInventory");
									if (item === "Monitoring") router.push("/monitoring");
									if (item === "Preventive") router.push("/preventive");
								}}>
									{Icon && <Icon />}
									<Text style={styles.buttonLabel}>{item === "PartsInventory" ? "Parts Inventory" : item}</Text>
								</Pressable>
							</View>
						)
					}} />
				<Pressable style={styles.supportBtn}>
					<View style={styles.supportBtnIcon}><ContactSupport /></View>
					<Text style={styles.supportBtnText}>Contact Support</Text>
				</Pressable>
				<Pressable style={styles.supportBtn}>
					<View style={styles.supportBtnIcon}><Academy /></View>
					<Text style={styles.supportBtnText}>Academy</Text>
				</Pressable>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "transparent",
	},
	bottomSheet: {
		backgroundColor: "#742BDE",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 15,
		paddingVertical: 16,
		// marginHorizontal: 20
	},
	gridItem: {
		flex: 1,
		alignItems: "center",
		marginVertical: 12,
	},
	sheetButton: {
		backgroundColor: "#9146FF66",
		height: 70,
		width: 75,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
	},
	buttonLabel: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#FFFFFF",
		marginTop: 6,
		textAlign: "center",
	},
	supportBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 100,
		padding: 5,
		gap: 20,
		marginVertical: 10
	},
	supportBtnIcon: {
		height: 25,
		width: 25,
		borderRadius: 30,
		backgroundColor: "#9146FF33",
		alignItems: "center",
		justifyContent: "center"
	},
	supportBtnText: {
		fontSize: 10,
		color: "#812BFF",
		fontFamily: Fonts.regular,
	}
});

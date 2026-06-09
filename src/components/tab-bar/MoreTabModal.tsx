import { FlatList, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import Fonts from "@/constants/Typography";
import { Academy, ContactSupport, MoreTabIcons } from "@/constants/IconProvider";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";

type MoreTabItem =
	| "Gateways"
	| "Requests"
	| "PartsInventory"
	| "Config"
	| "Monitoring"
	| "Preventive"
	| "";

interface MoreTabModalProps {
	setModalVisible: (visible: boolean) => void;
}

const items: MoreTabItem[] = [
	"Gateways",
	"Requests",
	"PartsInventory",
	// "Config",
	"Monitoring",
	"Preventive",
	""
];

export default function MoreTabModal({ setModalVisible }: MoreTabModalProps) {
	const insets = useSafeAreaInsets();

	// --- Animation values
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(100);

	// --- Animate in on mount
	useEffect(() => {
		opacity.value = withTiming(1, { duration: 150 });
		translateY.value = withTiming(0, { duration: 200 });

	}, []);

	// --- Animate out then unmount (call parent close)
	const closeModal = () => {
		opacity.value = withTiming(0, { duration: 150 });
		translateY.value = withTiming(100, { duration: 200 }, () => {
			// wait for animation before hiding
			runOnJS(setModalVisible)(false);
		});
	};

	// --- Animated styles
	const overlayStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const sheetStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }],
	}));

	return (
		<Animated.View style={[styles.overlay, overlayStyle]}>
			<TouchableWithoutFeedback onPress={closeModal}>
				<View style={styles.modalOverlay} />
			</TouchableWithoutFeedback>

			<Animated.View
				style={[
					styles.bottomSheet,
					{ marginBottom: insets.bottom },
					sheetStyle,
				]}
			>
				<FlatList
					data={items}
					keyExtractor={(_, index) => String(index)}
					numColumns={3}
					renderItem={({ item }) => {
						const Icon = MoreTabIcons[item];
						return (
							<View style={styles.gridItem}>
								<Pressable
									style={[styles.sheetButton, item === "" && {backgroundColor: 'transparent'}]}
									onPress={() => {
										closeModal();
										if (item === "Gateways") router.push("/gateways");
										if (item === "Requests") router.push("/requests");
										if (item === "PartsInventory") router.push("/partsInventory");
										if (item === "Monitoring") router.push("/monitoring");
										if (item === "Preventive") router.push("/preventive");
									}}
								>
									{Icon && <Icon />}
									<Text style={styles.buttonLabel}>
										{item === "PartsInventory" ? "Parts Inventory" : item}
									</Text>
								</Pressable>
							</View>
						);
					}}
				/>
				<Pressable style={styles.supportBtn}>
					<View style={styles.supportBtnIcon}>
						<ContactSupport />
					</View>
					<Text style={styles.supportBtnText}>Contact Support</Text>
				</Pressable>
				<Pressable style={styles.supportBtn}>
					<View style={styles.supportBtnIcon}>
						<Academy />
					</View>
					<Text style={styles.supportBtnText}>Academy</Text>
				</Pressable>
			</Animated.View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 70,
		zIndex: 999,
		backgroundColor: "rgba(0,0,0,0.2)", // soft dim
	},
	modalOverlay: {
		flex: 1,
	},
	bottomSheet: {
		backgroundColor: "#742BDE",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 15,
		paddingVertical: 16,
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
		marginVertical: 10,
	},
	supportBtnIcon: {
		height: 25,
		width: 25,
		borderRadius: 30,
		backgroundColor: "#9146FF33",
		alignItems: "center",
		justifyContent: "center",
	},
	supportBtnText: {
		fontSize: 10,
		color: "#812BFF",
		fontFamily: Fonts.regular,
	},
});


























// import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
// import Fonts from "@/constants/Typography";
// import { Academy, ContactSupport, MoreTabIcons } from "@/constants/IconProvider";
// import { router } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// type MoreTabItem = | "Gateways" | "Requests" | "PartsInventory" | "Config" | "Monitoring" | "Preventive";

// interface MoreTabModalProps {
// 	modalVisible: boolean;
// 	setModalVisible: (visible: boolean) => void;
// }

// const items: MoreTabItem[] = ["Gateways", "Requests", "PartsInventory", "Config", "Monitoring", "Preventive"];

// export default function MoreTabModal({ modalVisible, setModalVisible }: MoreTabModalProps) {
// 	return (
// 		<Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
// 			<TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
// 				<View style={styles.modalOverlay} />
// 			</TouchableWithoutFeedback>

// 			<View style={[styles.bottomSheet, { marginBottom: useSafeAreaInsets().bottom + 70 }]}>
// 				<FlatList
// 					data={items}
// 					keyExtractor={(_, index) => String(index)}
// 					numColumns={3}
// 					renderItem={({ item }) => {
// 						const Icon = MoreTabIcons[item];
// 						return (
// 							<View style={styles.gridItem}>
// 								<Pressable style={styles.sheetButton} onPress={() => {
// 									setModalVisible(false)
// 									if (item === "Gateways") router.push("/gateways");
// 									if (item === "Requests") router.push("/requests");
// 									if (item === "PartsInventory") router.push("/partsInventory");
// 									if (item === "Monitoring") router.push("/monitoring");
// 									if (item === "Preventive") router.push("/preventive");
// 								}}>
// 									{Icon && <Icon />}
// 									<Text style={styles.buttonLabel}>{item === "PartsInventory" ? "Parts Inventory" : item}</Text>
// 								</Pressable>
// 							</View>
// 						)
// 					}} />
// 				<Pressable style={styles.supportBtn}>
// 					<View style={styles.supportBtnIcon}><ContactSupport /></View>
// 					<Text style={styles.supportBtnText}>Contact Support</Text>
// 				</Pressable>
// 				<Pressable style={styles.supportBtn}>
// 					<View style={styles.supportBtnIcon}><Academy /></View>
// 					<Text style={styles.supportBtnText}>Academy</Text>
// 				</Pressable>
// 			</View>
// 		</Modal>
// 	);
// }

// const styles = StyleSheet.create({
// 	modalOverlay: {
// 		flex: 1,
// 		backgroundColor: 'red'
// 	},
// 	bottomSheet: {
// 		backgroundColor: "#742BDE",
// 		borderTopLeftRadius: 40,
// 		borderTopRightRadius: 40,
// 		paddingHorizontal: 15,
// 		paddingVertical: 16,
// 	},
// 	gridItem: {
// 		flex: 1,
// 		alignItems: "center",
// 		marginVertical: 12,
// 	},
// 	sheetButton: {
// 		backgroundColor: "#9146FF66",
// 		height: 70,
// 		width: 75,
// 		alignItems: "center",
// 		justifyContent: "center",
// 		borderRadius: 10,
// 	},
// 	buttonLabel: {
// 		fontFamily: Fonts.regular,
// 		fontSize: 10,
// 		color: "#FFFFFF",
// 		marginTop: 6,
// 		textAlign: "center",
// 	},
// 	supportBtn: {
// 		flexDirection: "row",
// 		alignItems: "center",
// 		backgroundColor: "#FFFFFF",
// 		borderRadius: 100,
// 		padding: 5,
// 		gap: 20,
// 		marginVertical: 10
// 	},
// 	supportBtnIcon: {
// 		height: 25,
// 		width: 25,
// 		borderRadius: 30,
// 		backgroundColor: "#9146FF33",
// 		alignItems: "center",
// 		justifyContent: "center"
// 	},
// 	supportBtnText: {
// 		fontSize: 10,
// 		color: "#812BFF",
// 		fontFamily: Fonts.regular,
// 	}
// });

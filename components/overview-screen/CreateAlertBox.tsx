import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from "react-native";
import { CloseIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { LinearGradient } from "expo-linear-gradient";

interface CreateAlertProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (choice: "parts" | "preventive") => void;
}

const screenWidth = Dimensions.get("window").width;

export default function CreateAlertBox({ visible, onClose, onSelect }: CreateAlertProps) {
	return (
		<Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
			<Pressable style={styles.overlay} onPress={onClose}>

				<LinearGradient colors={["#ECEFF4", "#EEF5FB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrapper}>
					<View style={styles.container}>

						<TouchableOpacity style={styles.closeButton} onPress={onClose}>
							<CloseIcon />
						</TouchableOpacity>

						<Text style={styles.title}>What would you like to create?</Text>

						<TouchableOpacity style={styles.optionButton} onPress={() => onSelect("parts")}>
							<Text style={styles.optionText}>Parts</Text>
						</TouchableOpacity>

						<Text style={styles.orText}>or</Text>

						<TouchableOpacity style={styles.optionButton} onPress={() => onSelect("preventive")}>
							<Text style={styles.optionText}>Preventive</Text>
						</TouchableOpacity>
					</View>
				</LinearGradient>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "#FFFFFF66",
		justifyContent: "center",
		alignItems: "center",
	},
	wrapper: {
		padding: 15,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: "#FFFFFF66",
	},
	container: {
		width: screenWidth * 0.83,
		height: 210,
		backgroundColor: "#fff",
		borderRadius: 20,
		paddingVertical: 20,
		alignItems: "center",
		position: "relative",
		justifyContent: "space-evenly",
		borderWidth: 3,
		borderColor: "rgba(255, 255, 255, 0.45)",
		shadowColor: "#FFFFFF",
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 0 },
		elevation: 8,
	},
	closeButton: {
		position: "absolute",
		top: 5,
		right: 5,
		padding: 4,
	},
	title: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#000000",
		textAlign: "center",
		marginBottom: 5
	},
	optionButton: {
		backgroundColor: "#742BDE",
		paddingVertical: 10,
		paddingHorizontal: 35,
		borderRadius: 6,
		alignItems: "center",
	},
	optionText: {
		color: "#FFFFFF",
		fontSize: 12,
		fontFamily: Fonts.regular,
	},
	orText: {
		color: "#00000099",
		fontSize: 10,
		fontFamily: Fonts.regular,
	},
});

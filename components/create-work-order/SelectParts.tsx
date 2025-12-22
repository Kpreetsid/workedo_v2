import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

interface SelectPartsProps {
	onPress: () => void;
	label?: string;
}

export default function SelectParts({
	onPress,
	label = "Select Parts",
}: SelectPartsProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>

			<TouchableOpacity
				activeOpacity={0.85}
				style={styles.button}
				onPress={onPress}
			>
				<Text style={styles.buttonText}>Select Parts</Text>
				<Feather name="chevron-down" size={16} color="#fff" />
			</TouchableOpacity>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		gap: 20,
		paddingHorizontal: 25,
		marginVertical: 10,
	},

	label: {
		fontSize: 14,
		color: "#555",
		fontFamily: Fonts.semiBold,
	},

	button: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#6C3CF0",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		gap: 6,
	},

	buttonText: {
		color: "#fff",
		fontSize: 13,
		fontFamily: Fonts.semiBold,
	},
});

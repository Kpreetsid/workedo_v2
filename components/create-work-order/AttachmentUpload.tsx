import Fonts from "@/constants/Typography";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface AttachmentUploadProps {
	onPress: () => void;
}

export default function AttachmentUpload({ onPress }: AttachmentUploadProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.label}>Attachments</Text>

			<TouchableOpacity
				activeOpacity={0.8}
				style={styles.uploadBox}
				onPress={onPress}
			>
				<Text style={styles.text}>
					Drag & Drop file here or{" "}
					<Text style={styles.link}>Click to Upload</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
}
const styles = StyleSheet.create({
	container: {
		width: "100%",
		paddingHorizontal: 25,
		marginVertical: 10,
	},

	label: {
		fontSize: 14,
		color: "#333",
		marginBottom: 8,
		fontFamily: Fonts.semiBold,
	},

	uploadBox: {
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: "#CFCFCF",
		borderRadius: 8,
		paddingVertical: 16,
		paddingHorizontal: 12,
		alignItems: "flex-start",
		justifyContent: "center",
		backgroundColor: "#FAFAFA",
	},

	text: {
		fontSize: 13,
		color: "#777",
		fontFamily: Fonts.regular,
	},

	link: {
		color: "#000",
		textDecorationColor: "#222",
		textDecorationStyle: 'solid',
		textDecorationLine: 'underline',
		fontFamily: Fonts.bold,
	},
});

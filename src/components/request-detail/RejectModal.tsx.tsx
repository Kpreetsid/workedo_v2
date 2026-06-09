import { useEffect, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, Vibration, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

interface RejectModalProps {
	visible: boolean;
	onCancel: () => void;
	onSubmit: (reason: string) => void;
}

export default function RejectModal({ visible, onCancel, onSubmit }: RejectModalProps) {
	const [reason, setReason] = useState("");
	const shakeAnim = new Animated.Value(0);

	useEffect(() => {
		if (visible) {
			Vibration.vibrate(100);
			Animated.sequence([
				Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
				Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
			]).start();
		}
	}, [visible]);

	return (
		<Modal visible={visible} animationType="fade" transparent>
			<View style={styles.overlay}>
				<View style={styles.modalContainer}>

					<Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
						<Ionicons name="close-circle" size={40} color="#D32F2F" />
					</Animated.View>


					<Text style={styles.label}>Type of Reject Reason *</Text>

					<TextInput
						style={styles.input}
						placeholder="Enter reason for rejection..."
						placeholderTextColor="#00000080"
						multiline
						value={reason}
						onChangeText={setReason}
					/>

					<View style={styles.buttonRow}>
						<Pressable style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
							<Text style={styles.cancelText}>Cancel</Text>
						</Pressable>
						<Pressable style={[styles.button, styles.submitBtn]} onPress={() => {
							if (reason.trim()) {
								onSubmit(reason);
								setReason("");
							}
						}}>
							<Text style={styles.submitText}>Submit</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContainer: {
		backgroundColor: "#fff",
		width: "85%",
		borderRadius: 16,
		alignItems: "center",
		padding: 20,
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 6,
	},
	label: {
		fontFamily: Fonts.semiBold,
		fontSize: 13,
		color: "#000",
		marginTop: 15,
		marginBottom: 8,
	},
	input: {
		width: "100%",
		minHeight: 100,
		borderRadius: 8,
		padding: 10,
		backgroundColor: "#FFEBEE",
		textAlignVertical: "top",
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#000",
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 20,
		gap: 50,
	},
	button: {
		flex: 1,
		height: 40,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	cancelBtn: {
		backgroundColor: "#F5F5F5",
		borderWidth: 1,
		borderColor: "#D32F2F",
	},
	cancelText: {
		color: "#333",
		fontFamily: Fonts.medium,
		fontSize: 12,
	},
	submitBtn: {
		backgroundColor: "#742bde",
	},
	submitText: {
		color: "#fff",
		fontFamily: Fonts.semiBold,
		fontSize: 12,
	},
});

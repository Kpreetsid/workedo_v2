import { FC } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Fonts from "@/constants/Typography";
import { CloseIcon } from "@/constants/IconProvider";

interface MoreInfoModalProps {
	visible: boolean;
	onClose: () => void;
	estimatedTime: string;
	requestedBy: string;
	createdOn: string;
}

const MoreInfoModal: FC<MoreInfoModalProps> = ({ visible, onClose, estimatedTime, requestedBy, createdOn }) => {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.modalOverlay}>
				<Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
				<View style={styles.bottomSheet}>
					{/* Header */}
					<View style={styles.headerRow}>
						<Text style={styles.sheetTitle}>More Info</Text>
						<Pressable onPress={onClose}>
							<CloseIcon />
						</Pressable>
					</View>

					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
						<View style={styles.infoRow}>
							<View style={styles.infoCol}>
								<Text style={styles.label}>Estimated Time</Text>
								<Text style={styles.value}>{estimatedTime}</Text>
							</View>
							<View style={styles.infoCol}>
								<Text style={styles.label}>Requested By</Text>
								<Text style={styles.value}>{requestedBy}</Text>
							</View>
							<View style={styles.infoCol}>
								<Text style={styles.label}>Created On</Text>
								<Text style={styles.value}>{createdOn}</Text>
							</View>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "flex-end",
	},
	bottomSheet: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingHorizontal: 20,
		paddingVertical: 16,
		marginBottom: 20,
		maxHeight: "70%",
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	sheetTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 14,
		color: "#742BDE",
	},
	infoRow: {
		flexDirection: "column",
		borderTopWidth: 0.5,
		borderColor: "#E1E8EE",
		paddingTop: 12,
		gap: 12,
	},
	infoCol: {
		width: "100%",
		alignItems: "flex-start",
	},
	label: {
		fontFamily: Fonts.regular,
		fontSize: 11,
		color: "#555",
		marginBottom: 4,
		textAlign: "left",
	},
	value: {
		fontFamily: Fonts.semiBold,
		fontSize: 12,
		color: "#000",
		textAlign: "left",
		flexWrap: "wrap",
		width: "100%",
	},
	sheetContent: {
		paddingBottom: 6,
	},
});

export default MoreInfoModal;

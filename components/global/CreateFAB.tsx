import { GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fonts from "@/constants/Typography";
import { FC, ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

interface FABProps {
	label: string;
	onPress: (event: GestureResponderEvent) => void;
	backgroundColor?: string;
	style?: ViewStyle;
}

const CreateFAB: FC<FABProps> = ({ label, onPress, backgroundColor = "#742BDE", style }) => {
	const insets = useSafeAreaInsets();
	const sectionsForMargin = ['Create Request', "Create Preventive", "Create Part", "New Gateway"];

	return (
		<Pressable
			onPress={onPress}
			style={[
				styles.fab,

				// widen only for these labels
				// (label === "Create Work Order" || label === "Create Request") && 
				{
					width: 200,
				},

				// margin bottom only for labels in array
				sectionsForMargin.includes(label) && {
					marginBottom: 70 + insets.bottom + 2, // you can adjust
				},

				{
					backgroundColor,
				},

				style,
			]}
		>
			<Ionicons name="add-circle" size={24} color="white" />
			{label && <Text style={styles.label}>{label}</Text>}
		</Pressable>

	);
};

export default CreateFAB;

const styles = StyleSheet.create({
	fab: {
		width: 50,
		height: 50,
		borderRadius: 30,
		position: 'absolute',
		bottom: "2%",
		right: "6%",
		backgroundColor: "#742BDE",
		alignItems: "center",
		justifyContent: "center",


		flexDirection: "row",
		gap: 8,
		// borderRadius: 30,
		// position: "absolute",
		// alignSelf: "flex-end",
		// width: 160,
		// height: 50,
		// bottom: "2%",
		// right: "6%",
		// shadowColor: "#742BDE",
		// shadowOpacity: 0.3,
		// shadowOffset: { width: 0, height: 2 },
		// shadowRadius: 4,
		// elevation: 4,
	},
	label: {
		color: "#fff",
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		lineHeight: 16,
	},
});
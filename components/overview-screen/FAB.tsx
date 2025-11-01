import { TouchableOpacity, StyleSheet, GestureResponderEvent, Text } from "react-native";
import { FABIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

interface FABProps {
	label?: string;
	onPress: (event: GestureResponderEvent) => void;
}

export default function FAB({ onPress, label }: FABProps) {
	return (
		<TouchableOpacity style={[styles.btnContainer, label && { width: 180, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }]} onPress={onPress} activeOpacity={0.8}>
			{
				!label ? <FABIcon /> : null
			}
			{label && <Text style={styles.label}>{label}</Text>}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	btnContainer: {
		width: 50,
		height: 50,
		borderRadius: 30,
		position: 'absolute',
		bottom: "2%",
		right: "6%",
		backgroundColor: "#742BDE",
		alignItems: "center",
		justifyContent: "center",
	},
    label: {
        color: "#fff",
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        lineHeight: 16,
    },
})
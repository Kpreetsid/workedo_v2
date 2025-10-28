import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from "react-native";
import Fonts from "@/constants/Typography";
import { FontAwesome6 } from "@expo/vector-icons";

interface ActionButtonProps {
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
    icon?: boolean;
    disabled?: boolean;
}

export default function ActionButton({ label, onPress, icon, disabled }: ActionButtonProps) {
    return (
        <TouchableOpacity style={styles.registerBtn} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
            <Text style={styles.registerText}>{label}</Text>
            {icon && <FontAwesome6 name="arrow-right-long" size={18} color="#fff" />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    registerBtn: {
        width: "100%",
        backgroundColor: "#742BDE",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
		zIndex: 1,
    },
    registerText: {
        color: "#fff",
        fontFamily: Fonts.medium,
        lineHeight: 18,
    },
})

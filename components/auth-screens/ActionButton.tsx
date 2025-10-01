import {Text, TouchableOpacity, StyleSheet, GestureResponderEvent} from "react-native";
import Fonts from "@/constants/Typography";

interface ActionButtonProps {
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
}

export default function ActionButton({ label, onPress }: ActionButtonProps) {
    return (
        <TouchableOpacity style={styles.registerBtn} onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.registerText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    registerBtn: {
        backgroundColor: "#742BDE",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    registerText: {
        color: "#fff",
        fontFamily: Fonts.medium
    },
})

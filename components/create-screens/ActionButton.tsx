import {GestureResponderEvent, StyleSheet, Text, TouchableOpacity, ViewStyle} from "react-native";
import Fonts from "@/constants/Typography";

interface ActionButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    label: String;
    buttonStyle?: ViewStyle;
}

export default function ActionButton({label, onPress, buttonStyle}: ActionButtonProps) {
    return (
        <TouchableOpacity style={[styles.buttonContainer, buttonStyle]} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        height: 42,
        marginHorizontal: 25,
        backgroundColor: "#742BDE",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 40
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontFamily: Fonts.semiBold,
        lineHeight: 20
    }
})

import {TouchableOpacity, StyleSheet, GestureResponderEvent} from "react-native";
import {FABIcon} from "@/constants/IconProvider";

interface FABProps {
    onPress: (event: GestureResponderEvent) => void;
}

export default function FAB({ onPress }: FABProps) {
    return (
        <TouchableOpacity style={styles.btnContainer} onPress={onPress} activeOpacity={0.8}>
            <FABIcon />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btnContainer: {
        width: 50,
        height: 50,
        position: 'absolute',
        bottom: "2%",
        right: "6%",
        backgroundColor: "#742BDE",
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    }
})
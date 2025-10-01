import {Text, View, StyleSheet, Pressable, ViewStyle, TextStyle, GestureResponderEvent} from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import {FC} from "react";

interface AssignInputProps {
    label: string;
    required?: boolean;
    onPress?: (event: GestureResponderEvent) => void;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    buttonStyle?: ViewStyle;
    buttonTextStyle?: TextStyle;
}

const AssignInput: FC<AssignInputProps> = ({label, required = true, onPress, containerStyle, labelStyle, buttonStyle, buttonTextStyle}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.labelContainer}>
                <Text style={[styles.labelText, labelStyle]}>{label}</Text>
                {required && <Text style={styles.asterisk}>*</Text>}
            </View>
            <Pressable style={[styles.buttonContainer, buttonStyle]} onPress={onPress}>
                <Text style={[styles.buttonText, buttonTextStyle]}>Assign</Text>
                <ArrowRight />
            </Pressable>
        </View>
    );
};

export default AssignInput;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 25,
        marginVertical: 7.5,
        borderRadius: 8,
        borderWidth: 0.6,
        borderColor: "#E1E8EE",
        height: 50,
        paddingHorizontal: 25,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    labelText: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
    },
    asterisk: {
        color: "#D63928",
        fontSize: 12,
        fontFamily: Fonts.regular,
        marginTop: -2,
        marginLeft: 2,
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#742BDE",
        width: 70,
        height: 28,
        justifyContent: "center",
        gap: 5,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#FFFFFF",
        lineHeight: 20,
    },
});

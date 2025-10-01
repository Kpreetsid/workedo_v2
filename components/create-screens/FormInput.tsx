import {View, Text, TextInput, TextInputProps, StyleSheet, ViewStyle, TextStyle} from "react-native";
import Fonts from "@/constants/Typography";
import {FC} from "react";

interface FormInputProps extends TextInputProps {
    label: string;
    required?: boolean;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    inputStyle?: TextStyle;
}

const FormInput: FC<FormInputProps> = ({label, required = true, containerStyle, labelStyle, inputStyle, ...textInputProps}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.labelContainer}>
                <Text style={[styles.labelText, labelStyle]}>{label}</Text>
                {required && <Text style={styles.asterisk}>*</Text>}
            </View>
            <View style={styles.field}>
                <TextInput
                    style={[styles.inputField, inputStyle]}
                    placeholderTextColor="#6B788899"
                    {...textInputProps}
                />
            </View>
        </View>
    );
};

export default FormInput;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 25,
        paddingVertical: 7.5,
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    labelText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        lineHeight: 20,
        color: "#1C1C1C",
    },
    asterisk: {
        color: "#D63928",
        fontSize: 14,
        fontFamily: Fonts.regular,
        marginTop: -3,
        marginLeft: 2,
    },
    field: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#E1E8EE",
    },
    inputField: {
        padding: 10,
        fontSize: 12,
        color: "#1C1C1C",
        fontFamily: Fonts.light,
    },
});

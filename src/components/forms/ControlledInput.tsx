import React from "react";
import { View, Text, TextInput, StyleSheet, ViewStyle } from "react-native";
import { useController, UseControllerProps } from "react-hook-form";
import Fonts from "@/constants/Typography";

interface ControlledInputProps extends UseControllerProps<any> {
    label: string;
    placeholder?: string;
    required?: boolean;
    style?: ViewStyle;
    secureTextEntry?: boolean;
    keyboardType?: any;
    multiline?: boolean;
    numberOfLines?: number;
}

export const ControlledInput = ({
    name,
    control,
    rules,
    defaultValue,
    label,
    placeholder,
    required = false,
    style,
    secureTextEntry,
    keyboardType,
    multiline,
    numberOfLines,
}: ControlledInputProps) => {
    const {
        field: { onChange, onBlur, value },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules,
        defaultValue,
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{label}</Text>
                {required && <Text style={styles.asterisk}>*</Text>}
            </View>
            <View style={[styles.inputContainer, error && styles.errorBorder]}>
                <TextInput
                    style={[styles.inputText, multiline && styles.multilineInput]}
                    placeholder={placeholder}
                    placeholderTextColor="#A0A0A0"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value || ""}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginVertical: 10,
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
    inputContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#E1E8EE",
        flexDirection: "row",
        alignItems: "center",
    },
    errorBorder: {
        borderColor: "#D63928",
        borderWidth: 1.5,
    },
    inputText: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 12,
        color: "#1C1C1C",
        fontFamily: Fonts.light,
    },
    multilineInput: {
        textAlignVertical: 'top',
        minHeight: 80,
    },
    errorText: {
        color: "#D63928",
        fontSize: 10,
        fontFamily: Fonts.regular,
        marginTop: 4,
        marginLeft: 4,
    },
});

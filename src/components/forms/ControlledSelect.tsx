import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useController, UseControllerProps } from "react-hook-form";
import DropDownInput from "@/src/components/create-screens/DropDownInput";
import Fonts from "@/constants/Typography";

interface ControlledSelectProps extends UseControllerProps<any> {
    label: string;
    options: string[];
    required?: boolean;
    containerStyle?: object;
}

export const ControlledSelect = ({
    name,
    control,
    rules,
    defaultValue,
    label,
    options,
    required = false,
    containerStyle,
}: ControlledSelectProps) => {
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules,
        defaultValue,
    });

    return (
        <View style={containerStyle}>
            <DropDownInput
                label={label}
                required={required}
                options={options}
                value={value}
                onSelect={onChange}
                containerStyle={error ? { marginBottom: 0 } : {}}
                fieldStyle={error ? styles.errorBorder : {}}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    errorBorder: {
        borderColor: "#D63928",
        borderWidth: 1.5,
    },
    errorText: {
        color: "#D63928",
        fontSize: 10,
        fontFamily: Fonts.regular,
        marginTop: 4,
        marginLeft: 24,
    },
});

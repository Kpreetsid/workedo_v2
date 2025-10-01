import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Fonts from "@/constants/Typography";

export interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupProps {
    options: RadioOption[];
    selectedValue: string;
    onChange: (value: string) => void;
}

export default function RadioGroup({ options, selectedValue, onChange }: RadioGroupProps) {
    return (
        <View style={styles.container}>
            {options.map((option) => {
                const isSelected = selectedValue === option.value;

                return (
                    <TouchableOpacity key={option.value} style={styles.optionRow} onPress={() => onChange(option.value)} activeOpacity={0.7}>
                        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.optionText}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 10
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 5
    },
    radioOuter: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: "#6B7888",
        justifyContent: "center",
        alignItems: "center",
    },
    radioOuterSelected: {
        borderColor: "#742BDE",
    },
    radioInner: {
        width: 6,
        height: 6,
        borderRadius: 5,
        backgroundColor: "#742BDE",
    },
    optionText: {
        fontSize: 10,
        color: "#6B7888",
        fontFamily: Fonts.regular,
        lineHeight: 20
    },
});

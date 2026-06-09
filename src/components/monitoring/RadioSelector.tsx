import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons} from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

interface RadioSelectorProps {
    selected: string;
    onSelect: (value: string) => void;
}

export default function RadioSelector({ selected, onSelect }: RadioSelectorProps) {
    return (
        <View style={styles.container}>
            {/* Default Option */}
            <Pressable style={[styles.option, selected === "Default" && styles.selectedOption]} onPress={() => onSelect("Default")}>
                <MaterialIcons name={selected === "Default" ? "radio-button-on" : "radio-button-off"}
                          size={16} color={selected === "Default" ? "#742BDE" : "#999"}/>
                <Text style={[styles.label, selected === "Default" && styles.selectedLabel]}>Default</Text>
            </Pressable>

            {/* Custom Option */}
            <Pressable style={[styles.option, selected === "Custom" && styles.selectedOption]} onPress={() => onSelect("Custom")}>
                <MaterialIcons name={selected === "Custom" ? "radio-button-on" : "radio-button-off"}
                    size={16} color={selected === "Custom" ? "#742BDE" : "#999"}/>
                <Text style={[styles.label, selected === "Custom" && styles.selectedLabel]}>
                    Custom
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 25,
        gap: 8,
        marginBottom: 10,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 8,
        paddingHorizontal: 15,
        width: "100%",
        gap: 10,
    },
    selectedOption: {
        backgroundColor: "#742BDE06",
        borderColor: "#742BDE",
    },
    label: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#000",
    },
    selectedLabel: {
        fontFamily: Fonts.semiBold,
        color: "#742BDE",
    },
});

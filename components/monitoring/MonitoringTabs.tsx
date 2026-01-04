import { Pressable, StyleSheet, View, Text } from "react-native";
import { useState } from "react";
import RadioSelector from "@/components/monitoring/RadioSelector";
import FormInput from "@/components/create-screens/FormInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Fonts from "@/constants/Typography";

export default function MonitoringTabs() {
    const [selectedOption, setSelectedOption] = useState("Default");
    return (
        <View style={styles.container}>
            <RadioSelector selected={selectedOption} onSelect={setSelectedOption} />

            {selectedOption === "Custom" && <>
                <FormInput label="Host" placeholder="Enter Host Name" labelStyle={styles.label} inputStyle={styles.value}
                    containerStyle={{ paddingHorizontal: 25 }}
                    inputContainer={styles.inputContainer} />

                <FormInput label="Port Number" placeholder="Enter Port Number" labelStyle={styles.label} inputStyle={styles.value}
                    containerStyle={{ paddingHorizontal: 25 }}
                    inputContainer={styles.inputContainer} />

                <FormInput label="User Name" placeholder="Enter User Name" labelStyle={styles.label} inputStyle={styles.value}
                    containerStyle={{ paddingHorizontal: 25 }}
                    inputContainer={styles.inputContainer} />

                <FormInput label="Password" placeholder="Enter Password" labelStyle={styles.label} inputStyle={styles.value}
                    containerStyle={{ paddingHorizontal: 25 }}
                    inputContainer={styles.inputContainer} />
            </>}

            <FormInput label="MAC ID" placeholder="Enter Mac ID" labelStyle={styles.label} inputStyle={styles.value}
                containerStyle={{ paddingHorizontal: 25 }}
                inputContainer={styles.inputContainer} />


            <Pressable style={[styles.connectBtn, { bottom: useSafeAreaInsets().bottom + 30 }]}>
                <Text style={styles.btnText}>Connect</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA"
    },
    connectBtn: {
        position: "absolute",
        width: "88%",
        backgroundColor: "#742BDE",
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    btnText: {
        fontFamily: Fonts.semiBold,
        color: "#ffffff",
        fontSize: 16,
        lineHeight: 18
    },
    label: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#201f23",
    },
    value: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#201f23",
        padding: 6
    },
    inputContainer: {
        borderRadius: 2,
        padding: 2
    },
})
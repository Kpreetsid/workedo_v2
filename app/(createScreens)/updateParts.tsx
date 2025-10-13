import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import {Text, TouchableOpacity, StyleSheet, View} from "react-native";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import DropDownInput from "@/components/create-screens/DropDownInput";
import {useState} from "react";

export default function UpdateParts() {
    const [selectedPart, setSelectedPart] = useState<string>("");
    return (
        <>
            <Header title="Update Parts"/>
            <KeyboardAwareScrollView bottomOffset={30}>
                <View style={{marginVertical: 5}}/>

                <DropDownInput label="Part Name" value={selectedPart} options={["Spare 1", "Spare 2", "Spare 3"]} onSelect={(val) => setSelectedPart(val)}/>

                <FormInput label="Part Number" placeholder="Type Number"/>

                <FormInput label="Part Type" placeholder="Type Part"/>

                <FormInput label="Available Quantity" placeholder="Type Quantity"/>

                <FormInput label="Quantity Needed" placeholder="0"/>

                <TouchableOpacity activeOpacity={0.7} onPress={() => console.info("Add Part Pressed")} style={styles.btnContainer}>
                    <Text style={styles.btnText}>Add Part</Text>
                </TouchableOpacity>

                <ActionButton onPress={() => console.info("Submit Pressed")} label="Confirm"/>

            </KeyboardAwareScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    btnContainer: {
        marginHorizontal: 25,
        marginVertical: 10,
        backgroundColor: "#742BDE",
        borderWidth: 1,
        borderColor: "#E1E8EE",
        borderRadius: 4,
        alignSelf: "flex-start",
        width: 75,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    btnText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#fff"
    }
})

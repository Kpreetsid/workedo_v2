import Header from "@/components/global/Header";
import {StyleSheet, View} from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import {router} from "expo-router";
import DropDownInput from "@/components/create-screens/DropDownInput";
import {useState} from "react";

export default function CreatePart() {
    const [selectedPart, setSelectedPart] = useState<string>("");
    return (
        <>
            <Header title="Create Part"/>
            <KeyboardAwareScrollView bottomOffset={30}>
                <View style={{marginVertical: 5}}/>

                <FormInput label="Part Name" placeholder="Enter Title"/>
                <FormInput label="Description" placeholder="Enter a message" inputStyle={styles.descriptionInput}/>

                <AssignInput label="Location" onPress={() => router.push("/selectLocation")}/>

                <DropDownInput label="Part Name" value={selectedPart} options={["Spare 1", "Spare 2", "Spare 3"]} onSelect={(val) => setSelectedPart(val)}/>

                <FormInput label="Part Number" placeholder="Type Number"/>
                <FormInput label="Available Quantity" placeholder="Enter Quantity"/>
                <FormInput label="Minimum Stock Quantity" placeholder="Enter Quantity"/>
                <FormInput label="Unit Cost" placeholder="Enter Cost"/>

                <ActionButton label="Submit" onPress={() => console.info("Submit Pressed")}/>

            </KeyboardAwareScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    descriptionInput: {
        height: 80,
        textAlignVertical: "top"
    }
})


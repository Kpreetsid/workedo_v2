import Header from "@/components/global/Header";
import {StyleSheet, View} from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import AssignSchedule from "@/components/create-screens/AssignSchedule";
import {router} from "expo-router";
import DatePicker from "@/components/global/DatePicker";
import {useState} from "react";

export default function CreatePreventive() {
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    return (
        <>
            <Header title="Create Preventive"/>
            <KeyboardAwareScrollView bottomOffset={30}>
                <View style={{marginVertical: 5}}/>

                <FormInput label="Part Name" placeholder="Enter Title"/>
                <FormInput label="Description" placeholder="Enter Title" inputStyle={styles.descriptionInput}/>

                <AssignInput label="Location" onPress={() => router.push("/selectLocation")}/>
                <AssignInput label="Assign User" onPress={() => router.push("/selectUser")}/>
                <AssignInput label="Start Date" onPress={() => setIsDatePickerVisible(true)}/>

                <AssignSchedule/>

                <View style={styles.row}>
                    <FormInput label="Start Date" labelStyle={styles.label} placeholder="dd-mm-yyyy" containerStyle={styles.inputContainer}/>
                    <FormInput label="Nature of Work" labelStyle={styles.label} placeholder="Preventive" containerStyle={styles.inputContainer}/>
                </View>

                <View style={styles.row}>
                    <FormInput label="Priority" labelStyle={styles.label} placeholder="None" containerStyle={styles.inputContainer}/>
                    <FormInput label="No. of Days to Complete WO" labelStyle={styles.label} placeholder="dd-mm-yyyy" containerStyle={styles.inputContainer}/>
                </View>

                <AssignInput label="Add Parts" onPress={() => router.push("/updateParts")}/>

                <ActionButton label="Submit" onPress={() => console.info("Submit Pressed")}/>

                <DatePicker visible={isDatePickerVisible} onClose={() => setIsDatePickerVisible(false)} onDateSelect={(date) => console.info(date)}/>
            </KeyboardAwareScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    descriptionInput: {
        height: 80,
        textAlignVertical: "top"
    },
    row: {
        flexDirection: "row",
        paddingHorizontal: 25,
        gap: 15,
    },
    label: {
        fontSize: 10
    },
    inputContainer: {
        paddingHorizontal: 0,
        flexGrow: 1,
        width: "45%",
    },
})

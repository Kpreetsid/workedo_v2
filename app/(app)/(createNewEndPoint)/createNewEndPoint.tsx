import Header from "@/components/global/Header";
import FormInput from "@/components/create-screens/FormInput";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";

export default function CreateNewEndPoint() {
    return (
        <>
            <Header title="Create New End Point"/>
            <KeyboardAwareScrollView bottomOffset={30}>
                <View style={{marginVertical: 5}}/>

                <FormInput label="Data Collection Point Name" placeholder="Use a descriptive name"/>

                <FormInput label="Measuring Point Location" placeholder="DE"/>

                <FormInput label="RPM" placeholder="Input machine RPM"/>

                <View style={styles.row}>
                    <FormInput label="Bearing Number" placeholder="Bearing No. of Measuring Point" containerStyle={styles.inputContainer}/>
                    <Pressable style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>Get Details</Text>
                    </Pressable>
                </View>

                <View style={styles.row}>
                    <FormInput label="BPFO" placeholder="" containerStyle={styles.inputContainer}/>
                    <FormInput label="BPFI" placeholder="" containerStyle={styles.inputContainer}/>
                </View>

                <View style={styles.row}>
                    <FormInput label="BSF" placeholder="" containerStyle={styles.inputContainer}/>
                    <FormInput label="FTF" placeholder="" containerStyle={styles.inputContainer}/>
                </View>

            </KeyboardAwareScrollView>

            <ActionButton label="Create Endpoint" onPress={() => console.info("Create Endpoint")}/>
        </>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        paddingHorizontal: 25,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 15,
    },
    inputContainer: {
        paddingHorizontal: 0,
        flexGrow: 1,
        width: "45%",
    },
    buttonContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#742BDE",
        paddingHorizontal: 10,
        paddingVertical: 5,
        justifyContent: "center",
        borderRadius: 5,
        alignSelf: "flex-end",
        marginBottom: 13
    },
    buttonText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#FFFFFF",
        lineHeight: 20,
    },
})
import Header from "../../components/global/Header";
import FormInput from "../../components/create-screens/FormInput";
import {Pressable, StyleSheet, Text, View} from "react-native";
import AssignInput from "../../components/create-screens/AssignInput";
import {router} from "expo-router";
import Fonts from "../../constants/Typography";
import {DropDownIcon} from "../../constants/IconProvider";
import ActionButton from "../../components/create-screens/ActionButton";

export default function NewWorkOrder() {
    return (
        <>
            <Header title="New Work Order"/>

            <View style={styles.container}>
                <FormInput label="Title" placeholder="Enter Title"/>

                <FormInput label="Message" placeholder="Enter a message" inputStyle={styles.messageInput}/>

                <AssignInput label="Location" onPress={() => router.push("/selectLocation")}/>

                <View style={styles.dropdownsRow}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownTitle}>Problem Type</Text>
                        <Pressable style={styles.dropdown}>
                            <Text style={styles.dropdownItemText}>General</Text>
                            <DropDownIcon/>
                        </Pressable>
                    </View>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownTitle}>Priority</Text>
                        <Pressable style={styles.dropdown}>
                            <Text style={styles.dropdownItemText}>None</Text>
                            <DropDownIcon/>
                        </Pressable>
                    </View>

                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownTitle}>Estimation Duration</Text>
                        <Pressable style={styles.dropdown}>
                            <Text style={styles.dropdownItemText}>Hours</Text>
                            <DropDownIcon/>
                        </Pressable>
                    </View>
                </View>

                <AssignInput label="Add Parts" onPress={() => router.push("/updateParts")}/>

                <Pressable style={styles.uploadBtn}>
                    <Text style={styles.uploadBtnText}>Upload or Capture Photos</Text>
                </Pressable>

                <ActionButton onPress={() => console.info("Create Work Order Request Pressed")} label="Create Work Request" buttonStyle={styles.submitBtn}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9ff",
        paddingTop: 20
    },
    messageInput: {
        height: 80,
        textAlignVertical: "top"
    },
    dropdownsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 25,
        marginVertical: 10,
        gap: 20,
        backgroundColor: "#e0e0e0",
        padding: 10,
        borderRadius: 8
    },
    dropdownContainer: {
        gap: 3,
        padding: 5,
        flexShrink: 1
    },
    dropdownTitle: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        lineHeight: 20,
        color: "#201f23",
    },
    dropdown: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "space-between",
    },
    dropdownItemText: {
        fontFamily: Fonts.regular,
        fontSize: 10,
    },
    uploadBtn: {
        backgroundColor: "#742BDE10",
        padding: 10,
        marginHorizontal: 25,
        marginVertical: 10,
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "#742BDE",
        borderStyle: "dashed",
        borderRadius: 4,
    },
    uploadBtnText: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: "#742BDE"
    },
    submitBtn: {
        marginHorizontal: 25
    }
})
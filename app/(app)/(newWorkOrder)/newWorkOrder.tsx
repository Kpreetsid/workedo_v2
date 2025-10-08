import Header from "../../../components/global/Header";
import FormInput from "../../../components/create-screens/FormInput";
import {Pressable, StyleSheet, Text, View} from "react-native";
import AssignInput from "../../../components/create-screens/AssignInput";
import {router} from "expo-router";
import Fonts from "../../../constants/Typography";
import {DropDownIcon} from "@/constants/IconProvider";
import ActionButton from "../../../components/create-screens/ActionButton";
import AssignInputContainer from "@/components/new-work-order/AssignInputContainer";

export default function NewWorkOrder() {
    return (
        <>
            <Header title="New Work Order"/>

            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <FormInput label="Title" placeholder="Enter Title" labelStyle={styles.label} inputStyle={styles.value}
                               inputContainer={styles.inputContainer}/>

                    <FormInput label="Message" placeholder="Enter a message" labelStyle={styles.label} inputStyle={styles.messageInput}
                               inputContainer={styles.inputContainer}/>
                </View>


                <AssignInputContainer/>

                <View style={styles.subContainer}>
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
                            <Text style={styles.dropdownTitle} numberOfLines={1} adjustsFontSizeToFit>Estimation Duration</Text>
                            <Pressable style={styles.dropdown}>
                                <Text style={styles.dropdownItemText}>Hours</Text>
                                <DropDownIcon/>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={{marginHorizontal: -15}}>
                    <AssignInput label="Add Parts" onPress={() => router.push("/updateParts")}/>
                </View>

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
        backgroundColor: "#fff",
        margin: 20
    },
    subContainer: {
        backgroundColor: "#f9f9ff",
        margin: 10
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
    messageInput: {
        height: 80,
        textAlignVertical: "top"
    },
    dropdownsRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 8
    },
    dropdownContainer: {
        gap: 3,
        padding: 5,
        flexShrink: 1,
    },
    dropdownTitle: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        color: "#201f23",
        flex: 1
    },
    dropdown: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    dropdownItemText: {
        fontFamily: Fonts.regular,
        fontSize: 10,
    },
    uploadBtn: {
        backgroundColor: "#742BDE10",
        padding: 10,
        marginHorizontal: 10,
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
        marginHorizontal: 10
    }
})
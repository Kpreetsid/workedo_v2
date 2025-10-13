import Header from "@/components/global/Header";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {FontAwesome6} from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import FormInput from "@/components/create-screens/FormInput";
import {useState} from "react";
import UpdatePartInventoryModal from "@/components/part-detail/UpdatePartInventoryModal";

export default function partDetail() {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <>
            <Header title="Part Detail"/>
            <View style={styles.container}>

                <View style={styles.addBtnContainer}>
                    <Text style={styles.buttonTitle}>Add Quantity</Text>
                    <Pressable style={styles.addBtn}  onPress={() => setModalVisible(true)}>
                        <FontAwesome6 name="plus" size={10} color="#fff"/>
                        <Text style={styles.btnText}>Add Stock</Text>
                    </Pressable>
                </View>

                <View style={styles.detailRow}>
                    <FormInput label="Location" labelStyle={styles.label} value="Delhi Location" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                    <FormInput label="Part Number" labelStyle={styles.label} value="P-001" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                    <FormInput label="Available Quantity" labelStyle={styles.label} value="1100" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                </View>

                <View style={styles.detailRow}>
                    <FormInput label="Min. Quantity" labelStyle={styles.label} value="500" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                    <FormInput label="Unit Cost (Rs)" labelStyle={styles.label} value="100" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                    <FormInput label="Part Type" labelStyle={styles.label} value="Spare 1" inputStyle={styles.value} inputContainer={styles.inputContainer}
                               containerStyle={styles.textInput} required={false} editable={false}/>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.descText}>This is a sample paragraph used to fill space in a layout. You can replace this
                        text with your actual content later. It helps visualize how your design will look
                        once real text is added...</Text>
                </View>
            </View>
            <UpdatePartInventoryModal
                visible={modalVisible} onClose={() => setModalVisible(false)}
                onSubmit={(data) => {
                    console.log("Inventory Updated:", data);
                    setModalVisible(false);
                }}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    addBtnContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 5,
        margin: 20
    },
    buttonTitle: {
        fontSize: 10,
        fontFamily: Fonts.semiBold
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        backgroundColor: "#742BDE",
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        elevation: 5,
    },
    btnText: {
        fontSize: 9,
        fontFamily: Fonts.regular,
        color: "#fff"
    },
    detailRow: {
        flexDirection: "row",
        paddingHorizontal: 25,
        gap: 15,
    },
    label: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        color: "#201f23",
    },
    textInput: {
        paddingHorizontal: 0,
        flexGrow: 1,
        width: "30%",
    },
    value: {
        fontSize: 9,
        fontFamily: Fonts.regular,
        color: "#201f23",
        padding: 6
    },
    inputContainer: {
        borderRadius: 2,
        padding: 0
    },
    descriptionContainer: {
        backgroundColor: "#F9F9FF",
        borderWidth: 0.1,
        borderColor: "#999",
        margin: 20,
        padding:5
    },
    descriptionTitle: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        lineHeight: 15,
        color: "#000"
    },
    descText: {
        fontSize: 9,
        fontFamily: Fonts.light,
        color: "#201f23"
    }
})
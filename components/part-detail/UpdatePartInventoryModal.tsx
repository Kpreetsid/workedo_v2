import {useState} from "react";
import {Modal, View, Text, StyleSheet, TextInput, Pressable, TouchableWithoutFeedback} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

interface UpdatePartInventoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { current: string; add: string; total: string }) => void;
}

export default function UpdatePartInventoryModal({visible, onClose, onSubmit}: UpdatePartInventoryModalProps) {
    const [current, setCurrent] = useState("");
    const [add, setAdd] = useState("");
    const [total, setTotal] = useState("");

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {/* Tap outside to close */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}/>
            </TouchableWithoutFeedback>

            <View style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Update Part Inventory</Text>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={15} color="#000"/>
                    </Pressable>
                </View>

                {/* Inputs */}
                <View style={styles.inputRow}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Current Quantity</Text>
                        <TextInput
                            style={styles.input}
                            value={current}
                            onChangeText={setCurrent}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Quantity to Add</Text>
                        <TextInput
                            style={styles.input}
                            value={add}
                            onChangeText={setAdd}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Total Quantity</Text>
                        <TextInput
                            style={styles.input}
                            value={total}
                            onChangeText={setTotal}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <Pressable style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>

                    <Pressable style={[styles.button, styles.submitBtn]} onPress={() => onSubmit({current, add, total})}>
                        <Text style={styles.submitText}>Submit</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#00000066",
    },
    modalContainer: {
        position: "absolute",
        top: "30%",
        alignSelf: "center",
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        color: "#742BDE",
    },
    closeButton: {
        backgroundColor: "#D9D9D950",
        height: 25,
        width: 25,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    inputRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        color: "#201f23",
        marginBottom: 4,
    },
    input: {
        borderWidth: 0.6,
        borderColor: "#99999950",
        borderRadius: 2,
        height: 25,
        paddingHorizontal: 8,
        fontSize: 8,
        fontFamily: Fonts.regular,
        color: "#201f23",
        padding: 0
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 3,
        alignItems: "center",
        paddingHorizontal: 15,
        marginHorizontal: 5,
    },
    cancelBtn: {
        backgroundColor: "#FF0400",
    },
    submitBtn: {
        backgroundColor: "#742BDE",
    },
    cancelText: {
        color: "#fff",
        fontFamily: Fonts.regular,
        fontSize: 11,
    },
    submitText: {
        color: "#fff",
        fontFamily: Fonts.regular,
        fontSize: 11,
    },
});

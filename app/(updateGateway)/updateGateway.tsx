import Header from "@/components/global/Header";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {AddNewGatewayIcon, ArrowRight, CloudIcon} from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import ActionButton from "@/components/create-screens/ActionButton";

export default function UpdateGateways() {
    return (
        <>
            <Header title="Update Gateway"/>
            <View style={styles.container}>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.label}>Gateway Mac ID</Text>
                            <Text style={styles.value}>70:B8:F6:62:01:5c</Text>
                        </View>
                        <Pressable>
                            <CloudIcon/>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.label}>Location</Text>
                            <Text style={styles.value}>234rfgbn567uhvcxsd8ytgbjk</Text>
                        </View>
                        <Pressable style={styles.btnContainer}>
                            <Text style={styles.btnText}>Assign</Text>
                            <ArrowRight/>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.label}>Add Bluetooth Sensors</Text>
                        <View style={styles.makeRow}>
                            <Pressable style={styles.btnContainer}>
                                <AddNewGatewayIcon/>
                                <Text style={styles.btnText}>Add</Text>
                            </Pressable>
                            <Pressable>
                                <CloudIcon/>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <ActionButton onPress={() => console.info("Update Gateway Pressed")} label="Update" buttonStyle={styles.actionBtn}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 11,
        color: "#201F23",
        fontFamily: Fonts.semiBold,
    },
    value: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#000000A0",
    },
    makeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10
    },
    btnContainer: {
        flexDirection: "row",
        backgroundColor: "#742BDE",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 8
    },
    btnText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#fff",
        lineHeight: 18
    },
    actionBtn: {
        marginHorizontal: -4
    }
})
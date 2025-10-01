import {Text, TouchableOpacity, View, StyleSheet, GestureResponderEvent} from "react-native";
import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

interface AuthHeaderProps {
    title: string;
    btnText: string;
    onPress?: (event: GestureResponderEvent) => void;
}

export default function AuthHeader({ title, btnText, onPress }: AuthHeaderProps) {
    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={18} color="#fff"/>
            </TouchableOpacity>

            <View style={styles.makeRow}>
                <Text style={styles.haveAccount}>{title}</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={onPress}>
                    <Text style={styles.loginBtnText}>{btnText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    makeRow: {
        flexDirection: "row",
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    haveAccount: {
        color: "#fff",
        fontFamily: Fonts.light,
        fontSize: 11
    },
    loginBtn: {
        backgroundColor: "#fff",
        height: 30,
        width: 80,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    loginBtnText: {
        color: "#742BDE",
        fontSize: 10,
        fontFamily: Fonts.semiBold
    },
})

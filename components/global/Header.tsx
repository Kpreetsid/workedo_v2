import { SafeAreaView } from "react-native-safe-area-context";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { ArrowBack } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import {router} from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
    title: string;
    modal?: boolean;
    dismiss?: () => void | null;
}

export default function Header({ title, modal = false, dismiss }: HeaderProps) {
    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => modal ? dismiss!() : router.back()} style={styles.backButton}>
                    {/* <ArrowBack /> */}
                    <Ionicons name="chevron-back" size={22} color={"#fff"} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#A259FF",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 25,
        paddingVertical: 15,
    },
    backButton: {
        marginRight: 5,
        padding: 5,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        lineHeight: 20,
        letterSpacing: 0.15,
        color: "#FFFFFF",
    },
});

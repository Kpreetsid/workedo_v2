import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo } from "@/constants/IconProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import ActionButton from "@/components/auth-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Field from "@/components/auth-screens/InputField";

export default function ForgotPassword() {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <AuthHeader />
                <View style={styles.logoContainer}><Logo /></View>
                <View style={styles.card}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>Enter your registered email to receive verification code.</Text>

                    <View style={styles.col}>
                        <Field icon="email" placeholder="Email ID" />
                    </View>

                    <ActionButton label="Submit Now" onPress={() => router.push({pathname: "/otpVerification", params: {type: "resetPassword"}})} />

                </View>
                <Image source={require("../../assets/images/presage.png")} style={styles.image} />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#742BDE",
    },
    logoContainer: {
        alignSelf: "center",
        marginVertical: 70,
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    handle: {
        width: 75,
        height: 5,
        borderRadius: 2,
        backgroundColor: "#D9D9D9",
        alignSelf: "center",
        marginBottom: 15,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.semiBold,
        textAlign: "center",
        color: "#742BDE",
    },
    subtitle: {
        fontSize: 12,
        textAlign: "center",
        color: "#00000099",
        fontFamily: Fonts.light,
        marginBottom: 40,
        paddingHorizontal: 30
    },
    col: {
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 15,
    },
    image: {
        position: "absolute",
        bottom: 0,
        right: 0,
    }
})

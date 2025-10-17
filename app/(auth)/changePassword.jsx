import {SafeAreaView} from "react-native-safe-area-context";
import {KeyboardAwareScrollView} from "react-native-keyboard-controller";
import AuthHeader from "../../components/auth-screens/AuthHeader";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Logo} from "../../constants/IconProvider";
import Field from "../../components/auth-screens/InputField";
import ActionButton from "../../components/auth-screens/ActionButton";
import {router} from "expo-router";
import Fonts from "../../constants/Typography";

export default function ChangePassword() {
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <AuthHeader />
                <View style={styles.logoContainer}><Logo /></View>
                <View style={styles.card}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>Change Password</Text>
                    <Text style={styles.subtitle}>Enter your new password.</Text>

                    <View style={styles.col}>
                        <Field icon="lock" placeholder="Enter new password" secure={true} />
                        <Field icon="lock" placeholder="Confirm new password" secure={true} />
                    </View>

                    <ActionButton label="Submit" onPress={() => router.push({pathname: "/registrationComplete", params: {type: "resetPassword"}})} />

                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace("/")}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

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
    cancelButton: {
        width: "100%",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 15,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        borderWidth: 0.5,
        borderColor: "#742BDE",
        zIndex: 10
    },
    cancelButtonText: {
        color: "#742BDE",
        fontFamily: Fonts.medium,
        lineHeight: 18,
    },
    image: {
        position: "absolute",
        bottom: 0,
        right: 0,
    }
})

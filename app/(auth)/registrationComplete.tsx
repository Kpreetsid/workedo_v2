import {Image, StyleSheet, Text, View} from "react-native";
import {router} from "expo-router";
import AuthHeader from "@/src/components/auth-screens/AuthHeader";
import {Logo, RegistrationCompleteIcon} from "@/constants/IconProvider";
import {SafeAreaView} from "react-native-safe-area-context";
import ActionButton from "@/src/components/auth-screens/ActionButton";
import Fonts from "@/constants/Typography";

export default function RegistrationComplete() {
    return (
        <SafeAreaView style={styles.container}>
            <AuthHeader/>
            <View style={styles.logoContainer}><Logo/></View>
            <View style={styles.card}>

                <View style={styles.handle}/>

                <View style={styles.completeIcon}><RegistrationCompleteIcon/></View>

                <Text style={styles.title}>Registration Complete!</Text>

                <Text style={styles.infoText}>Your account has been created. Welcome aboard!</Text>

                <ActionButton label="Log in" icon={true} onPress={() => router.push("/")}/>

            </View>
            <Image source={require("../../assets/images/presage.png")} style={styles.image}/>
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
    completeIcon: {
        alignSelf: "center",
        marginVertical: 15
    },
    title: {
        fontFamily: Fonts.semiBold,
        fontSize: 16,
        textAlign: "center",
    },
    infoText: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        textAlign: "center",
        color: "#999999",
        marginBottom: 30
    },
    image: {
        position: "absolute",
        bottom: 0,
        right: 0,
    }
})

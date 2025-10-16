import { Image, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Drawer, PrevisionLogo } from "@/constants/IconProvider";
import { useRouter } from "expo-router";

export default function OverviewHeader() {
    const router = useRouter();
    
    return (
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
            <View style={styles.headerContainer}>

                <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
                    <Drawer />
                </TouchableOpacity>

                <PrevisionLogo/>

                <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.push("/myAccount")}>
                    <Image source={require("../../assets/images/UserAvatar.png")} style={styles.avatar} resizeMode="cover"/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#fff",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    iconButton: {
        padding: 4,
    },
    avatar: {
        width: 33,
        height: 33,
        borderRadius: 17,
    },
});

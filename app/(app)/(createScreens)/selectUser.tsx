import Header from "@/components/global/Header";
import {Pressable, Text, StyleSheet, FlatList, View, Dimensions} from "react-native";
import Fonts from "@/constants/Typography";
import {LinearGradient} from "expo-linear-gradient";
import {useState} from "react";
import {TickIcon} from "@/constants/IconProvider";
import ActionButton from "@/components/create-screens/ActionButton";
import {router} from "expo-router";

const names: string[] = [
    "Aarav Sharma",
    "Ishita Verma",
    "Kabir Malhotra",
    "Saanvi Iyer",
    "Rohan Kapoor",
    "Meera Bansal",
    "Advait Nair",
    "Ananya Gupta",
    "Vivaan Khanna",
    "Kiara Singh",
    "Arjun Mehta",
    "Diya Reddy",
    "Reyansh Joshi",
    "Myra Choudhary",
    "Vihaan Das",
    "Aanya Menon",
    "Hrithik Agarwal",
    "Pari Saxena",
    "Ishaan Kulkarni",
    "Riya Deshmukh",
];

const width = Dimensions.get("window").width;
export default function SelectUser() {
    const [selectedUser, setSelectedUser] = useState<string>("");
    return (
        <>
            <Header title="Select User"/>
            <FlatList
                data={names}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item}) => (
                    <Pressable style={styles.userButton} onPress={() => setSelectedUser(item)}>
                        {selectedUser === item ?
                            <View style={styles.tickIcon}><TickIcon/></View>
                            : <LinearGradient colors={["#A259FF", "#C7AAF2"]} style={styles.initials}>
                                <Text style={styles.initialText}>{item.split(" ").map(part => part[0]).join("").toUpperCase()}</Text>
                            </LinearGradient>}
                        <Text style={styles.userText}>{item}</Text>
                    </Pressable>)}
                contentContainerStyle={styles.contentContainer}
            />
            <ActionButton onPress={() => router.back()} label="Confirm User" buttonStyle={styles.actionButton}/>
        </>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        flexGrow: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 25,
        paddingTop: 15,
        paddingBottom: 105,
        gap: 10
    },
    userButton: {
        borderWidth: 1,
        borderColor: "#E1E8EE66",
        borderRadius: 7,
        backgroundColor: "#EFF2FC",
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 10
    },
    initials: {
        width: 35,
        height: 35,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center"
    },
    tickIcon: {
        width: 35,
        height: 35,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#742BDE",
    },
    initialText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontFamily: Fonts.semiBold
    },
    userText: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
    },
    actionButton: {
        position: "absolute",
        bottom: "2%",
        alignSelf: "center",
        width: width - 50
    }
})

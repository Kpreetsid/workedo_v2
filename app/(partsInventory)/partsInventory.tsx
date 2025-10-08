import Header from "@/components/global/Header";
import SearchBar from "@/components/global/SearchBar";
import {useState} from "react";
import {StyleSheet, View, Text, Pressable} from "react-native";
import {Entypo, FontAwesome} from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import CreateFAB from "@/components/global/CreateFAB";
import {router} from "expo-router";

export default function PartsInventory() {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <>
            <Header title="Parts Inventory"/>
            <View style={styles.container}>
                <SearchBar value={searchQuery} onChangeText={setSearchQuery}/>

                <Pressable style={styles.partInfoCard} onPress={()=> router.push("partDetail")}>
                    <Text style={styles.partName}>New Parts</Text>
                    <View style={styles.makeRow}>
                        <FontAwesome name="gears" size={12} color="#000" style={styles.icon}/>
                        <Text style={styles.partInfo}>Type : Spare 1</Text>
                    </View>

                    <View style={styles.makeRow}>
                        <Entypo name="location-pin" size={12} color="#000" style={styles.icon}/>
                        <Text style={styles.partInfo}>Location : New Delhi</Text>
                    </View>
                    <View style={styles.makeRow}>
                        <FontAwesome name="cubes" size={12} color="#000" style={styles.icon}/>
                        <Text style={styles.partInfo}>Quantity : 1100</Text>
                    </View>
                </Pressable>
            </View>

            <CreateFAB label="Create Part" onPress={() => router.push("/createPart")} />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
    },
    partInfoCard: {
        backgroundColor: "#ffffff70",
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 20,
        borderWidth: 0.3,
        borderColor: "#E1E8EE40",
    },
    makeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    partName: {
        fontSize: 10,
        fontFamily: Fonts.semiBold
    },
    icon: {
        width: 22
    },
    partInfo: {
        fontSize: 10,
        fontFamily: Fonts.regular
    }
})
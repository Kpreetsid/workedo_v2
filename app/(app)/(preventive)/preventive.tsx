import Header from "@/components/global/Header";
import {router} from "expo-router";
import CreateFAB from "@/components/global/CreateFAB";
import SearchBar from "@/components/global/SearchBar";
import {useState} from "react";
import {FlatList, Pressable, StyleSheet, Text, View} from "react-native";
import Fonts from "@/constants/Typography";
import {MaterialIcons} from "@expo/vector-icons";

const mockData = Array.from({length: 10}, (_, i) => ({
    id: `${i + 1}`,
    title: `Weekly Preventive Test ${i + 1}`,
    assignedTo: i % 2 === 0 ? "Parwez" : "John Doe",
    location: i % 3 === 0 ? "New Delhi" : "Mumbai",
    status: i % 2 === 0 ? "Active" : "Inactive",
}));

export default function Preventive() {
    const [searchQuery, setSearchQuery] = useState("");
    return (
        <>
            <Header title="Preventive Maintenance"/>
            <View style={styles.container}>
                <SearchBar value={searchQuery} onChangeText={setSearchQuery}/>

                <FlatList
                    data={mockData}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => <Pressable style={styles.preventiveItem} onPress={() =>
                        router.push({pathname: "/preventiveDetail", params: {parsedItem: JSON.stringify(item)}})}>
                        <View style={styles.makeRow}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <View style={styles.noneTag}>
                                <Text style={styles.noneTagText}>#None</Text>
                            </View>
                        </View>
                        <View style={styles.subInfoRow}>
                            <MaterialIcons name="groups" size={12} color="black"/>
                            <Text style={styles.subText}>Assigned to : {item.assignedTo}</Text>
                        </View>

                        <View style={styles.makeRow}>
                            <View style={styles.subInfoRow}>
                                <MaterialIcons name="location-on" size={12} color="black"/>
                                <Text style={styles.subText}>Location : {item.location}</Text>
                            </View>
                            <View style={[styles.activeTag, item.status === "Inactive" && {backgroundColor: "red"}]}>
                                <Text style={styles.activeTagText}>Active</Text>
                            </View>
                        </View>
                    </Pressable>}
                    contentContainerStyle={{paddingBottom: 100, gap: 10}}
                    showsVerticalScrollIndicator={false}
                />


            </View>
            <CreateFAB label="Create Preventive" onPress={() => router.push("/createPreventive")} style={styles.createBtn}/>

        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        backgroundColor: "#F5F7FA",
        flex: 1,
    },
    preventiveItem: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 4,
        marginHorizontal: 20,
        gap: 5
    },
    makeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemTitle: {
        fontSize: 10,
        fontFamily: Fonts.semiBold
    },
    noneTag: {
        backgroundColor: "#99999920",
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 2,
        alignItems: "center",
        justifyContent: "center"
    },
    noneTagText: {
        fontFamily: Fonts.regular,
        fontSize: 9
    },
    subInfoRow: {
        flexDirection: "row",
        gap: 5
    },
    subText: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        lineHeight: 12
    },
    activeTag: {
        backgroundColor: "#00B227",
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 2,
        alignItems: "center",
        justifyContent: "center"
    },
    activeTagText: {
        fontFamily: Fonts.regular,
        fontSize: 9,
        color: "#fff"
    },
    createBtn: {
        width: 190
    }
})
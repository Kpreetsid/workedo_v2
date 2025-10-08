import {useState} from "react";
import {FlatList, Pressable, StyleSheet, Text, View} from "react-native";
import SearchBar from "@/components/global/SearchBar";
import Fonts from "@/constants/Typography";
import {ArrowDown} from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import {router} from "expo-router";
import CreateFAB from "@/components/global/CreateFAB";

const mockGateways = [
    {id: "1", macId: "70:B8:F6:62:01:5c", name: "Main Gateway"},
    {id: "2", macId: "kamal_test1", name: "Gateway Test 1"},
    {id: "3", macId: "kamal_test2", name: "Gateway Test 2"},
    {id: "4", macId: "parwez_dummy", name: "Gateway Dummy"},
    {id: "5", macId: "70:B8:F6:62:01:5c", name: "Main Gateway Copy"},
    {id: "6", macId: "kamal_test1", name: "Gateway Test 1 Copy"},
    {id: "7", macId: "kamal_test2", name: "Gateway Test 2 Copy"},
    {id: "8", macId: "parwez_dummy", name: "Gateway Dummy Copy"},
];

export default function Gateways() {
    const [searchText, setSearchText] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredGateways = mockGateways.filter((g) =>
        g.macId.toLowerCase().includes(searchText.toLowerCase()) ||
        g.name.toLowerCase().includes(searchText.toLowerCase()));

    return (
        <>
            <Header title="Gateways"/>
            <View style={styles.container}>
                <SearchBar placeholder="Search..." value={searchText} onChangeText={setSearchText}/>
                <FlatList
                    data={filteredGateways}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => {
                        const isExpanded = expandedId === item.id;
                        return (
                            <Pressable key={item.id} style={[styles.card, isExpanded && styles.expandedCard]}
                                       onPress={() => setExpandedId(isExpanded ? null : item.id)}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.label}>Gateway Mac ID</Text>
                                        <Text style={styles.value}>{item.macId}</Text>
                                    </View>
                                    <ArrowDown/>
                                </View>

                                {isExpanded && (
                                    <View style={styles.expandedSection}>
                                        <Pressable style={styles.actionButton}>
                                            <Text style={styles.actionText}>Add & Delete Sensor</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </Pressable>
                        );
                    }}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />

                <CreateFAB label="New Gateway" onPress={() => router.push("/updateGateway")}/>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20
    },
    listContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        gap: 10
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
    expandedCard: {
        backgroundColor: "#F8F5FF",
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
    expandedSection: {
        marginTop: 12,
    },
    actionButton: {
        backgroundColor: "#742BDE",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    actionText: {
        color: "#fff",
        fontSize: 10,
        fontFamily: Fonts.regular,
    },
    newGatewayButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#742BDE",
        borderRadius: 24,
        position: "absolute",
        alignSelf: "flex-end",
        width: 160,
        height: 40,
        gap: 8,
        right: 20,
        shadowColor: "#742BDE",
        shadowOpacity: 0.3,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 4,
    },
    newGatewayText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        lineHeight: 16
    },
});

import {FlatList, Pressable, StyleSheet, Text, View} from "react-native";
import Fonts from "@/constants/Typography";
import {WorkOrderCardLogo} from "@/constants/IconProvider";
import {router} from "expo-router";

const mockRequests = [
    {
        id: "1",
        title: "Test - 5",
        requestedBy: "admin12 test_test",
        createdOn: "Oct 03, 2025",
        status: "#None",
    },
    {
        id: "2",
        title: "Test - 6",
        requestedBy: "john_doe",
        createdOn: "Oct 04, 2025",
        status: "#None",
    },
    {
        id: "3",
        title: "Test - 7",
        requestedBy: "kamal_test",
        createdOn: "Oct 04, 2025",
        status: "#None",
    },
    {
        id: "4",
        title: "Test - 8",
        requestedBy: "parwez_dummy",
        createdOn: "Oct 05, 2025",
        status: "#None",
    },
    {
        id: "5",
        title: "Test - 9",
        requestedBy: "admin12 test_test",
        createdOn: "Oct 05, 2025",
        status: "#None",
    },
];

export default function PendingRequests() {
    return (
        <FlatList
            data={mockRequests}
            keyExtractor={(item) => item.id}
            renderItem={({item}: { item: (typeof mockRequests)[0] }) => (
                <Pressable style={styles.card} onPress={() => router.push({pathname: "/requestDetail", params: {stringifyItem: JSON.stringify(item)}})}>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.subText}>Requested By : {item.requestedBy}</Text>
                        <Text style={styles.subText}>Created On : {item.createdOn}</Text>
                    </View>

                    <View style={styles.rightContainer}>
                        <WorkOrderCardLogo/>
                        <View style={styles.tagButton}>
                            <Text style={styles.tagText}>{item.status}</Text>
                        </View>
                    </View>
                </Pressable>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,
        backgroundColor: "#F7F7F9",
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 3,
        elevation: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 2,
    },
    subText: {
        fontSize: 9,
        fontFamily: Fonts.regular,
        color: "#000000A0",
        marginVertical: 1,
    },
    rightContainer: {
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    tagButton: {
        backgroundColor: "#742BDE",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    tagText: {
        color: "#fff",
        fontSize: 9,
        fontFamily: Fonts.regular,
    },
});

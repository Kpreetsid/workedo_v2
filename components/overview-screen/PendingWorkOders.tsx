import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";

type WorkOrder = {
    id: string;
    title: string;
    priority: "Low" | "Medium" | "High";
    location: string;
    asset: string;
    assigned: string[];
    date: string; // ISO
};

const mockData: WorkOrder[] = [
    {
        id: "1",
        title: "Test 1",
        priority: "Medium",
        location: "Report Testing",
        asset: "Portable Test 8G",
        assigned: ["Admin", "XB", "xc", "+9 others"],
        date: "2025-11-29T12:49:00Z",
    },
    {
        id: "2",
        title: "Inspection A12",
        priority: "Medium",
        location: "Warehouse 3B",
        asset: "Lift Motor",
        assigned: ["RK", "John", "+3 others"],
        date: "2025-10-10T09:30:00Z",
    },
    {
        id: "3",
        title: "Cooling Check",
        priority: "Medium",
        location: "Building 42",
        asset: "AC Unit 9F",
        assigned: ["Admin", "+4 others"],
        date: "2025-08-21T14:10:00Z",
    },
    {
        id: "4",
        title: "Panel Review",
        priority: "Medium",
        location: "Main Hub",
        asset: "Control Panel XP",
        assigned: ["XB", "Adam", "+7 others"],
        date: "2025-12-01T10:15:00Z",
    },
];

export default function PendingWorkOrders() {
    return (
        <FlatList
            ListHeaderComponent={<Text style={styles.cardTitle}>Pending Work Orders</Text>}
            data={mockData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            renderItem={({ item }) => <WorkOrderCard item={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        />
    );
}

function WorkOrderCard({ item }: { item: WorkOrder }) {
    const formattedDate = new Date(item.date).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <View style={styles.card}>
          
            <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
            </View>
          
            <View style={styles.detailRow}>
                <Ionicons name="location-sharp" size={16} color="#000" />
                <Text style={styles.detailLabel}> Location :</Text>
                <Text style={styles.detailValue}> {item.location}</Text>
            </View>

            <View style={styles.detailRow}>
                <MaterialIcons name="settings" size={16} color="#000" />
                <Text style={styles.detailLabel}> Asset :</Text>
                <Text style={styles.detailValue}> {item.asset}</Text>
            </View>

            <View style={styles.detailRow}>
                <FontAwesome5 name="users" size={14} color="#000" />
                <Text style={styles.detailLabel}> Assigned :</Text>
                <Text style={styles.detailValue}> {item.assigned.join(", ")}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.footerRow}>
                <View style={styles.footerLeft}>
                    <Feather name="calendar" size={16} color="#000" />
                    <Text style={styles.footerDate}>{formattedDate}</Text>
                </View>

                <TouchableOpacity style={styles.openButton}>
                    <Text style={styles.openButtonText}>Open</Text>
                    <Feather name="arrow-up-right" size={15} color="#7B2BFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 10
    },
    card: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 15,
        shadowColor: "#742BDE",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 0.1,
        borderColor: "#742BDE",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    title: {
        fontSize: 13,
        fontFamily: Fonts.semiBold,
        color: "#000",
    },
    priorityBadge: {
        backgroundColor: "#742BDE",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 50,
        elevation: 1,
        borderWidth: 0.1,
        borderColor: "#742BDE",
    },
    priorityText: {
        color: "#FFF",
        fontFamily: Fonts.regular,
        fontSize: 11
    },

    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    detailLabel: {
        fontFamily: Fonts.semiBold,
        fontSize: 11,
        marginLeft: 5
    },
    detailValue: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: "#333",
        flexShrink: 1,
    },

    divider: {
        height: 1,
        borderBottomWidth: 2,
        borderBottomColor: "#EADCFD",
        borderStyle: "dashed",
        marginVertical: 10
    },

    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    footerDate: {
        marginLeft: 6,
        fontSize: 10,
        fontFamily: Fonts.regular
    },

    openButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D3B4FF50",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    openButtonText: {
        color: "#742BDE",
        fontFamily: Fonts.regular,
        fontSize: 10,
        marginRight: 5
    },
});

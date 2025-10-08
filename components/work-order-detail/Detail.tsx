import { View, Text, StyleSheet, ScrollView, Image, Pressable } from "react-native";
import Fonts from "@/constants/Typography";
import { AssignUserRightIcon } from "@/constants/IconProvider";
import { useState } from "react";
import AssignedUsersModal from "./AssignUserModal";
import PartsInfoModal from "./PartsInfoModal";
import MoreInfoModal from "./MoreInfoModal";

const mockUsers = [
    { id: "1", name: "Alice Johnson", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
    { id: "2", name: "Michael Smith", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
    { id: "3", name: "Sophia Brown", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
    { id: "4", name: "James Wilson", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
    { id: "5", name: "Emily Davis", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
];
const parts = [
    { id: "1", name: "ARM microcontrollers MCU Ultra-low power FPU Arm", quantity: 1 },
    { id: "2", name: "Accelerometers tri-axis acclrmtr 8g, 16g, 32g", quantity: 4 },
];
export default function Detail({ params }: any) {
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [partsModalVisible, setPartsModalVisible] = useState(false);
    const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);
    return (
        <ScrollView style={styles.container}>

            {/* Assigned Section */}
            <View style={styles.card}>
                <View style={styles.makeRow}>
                    <Text style={styles.cardTitle}>Assigned to</Text>
                    <Pressable style={styles.avatarRow} onPress={() => setUserModalVisible(true)}>
                        <View style={styles.avatars}>
                            {mockUsers.slice(0, 3).map((user, i) => (
                                <Image key={user.id} source={{ uri: user.avatar }} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]} />
                            ))}
                        </View>
                        <AssignUserRightIcon />
                    </Pressable>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardSubtitle}>{params?.assignedTo || "N/A"}</Text>
                </View>
            </View>

            {/* Priority Section */}
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>Priority</Text>
                    <Text style={[styles.badge, params?.priority === "Low" && styles.badgeLow, params?.priority === "Medium" && styles.badgeMedium, params?.priority === "High" && styles.badgeHigh]}>
                        #{params?.priority}
                    </Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardSubtitle}>Start Date</Text>
                    <Text style={styles.cardSubtitle}>End Date</Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardValue}>{params?.startDate || "N/A"}</Text>
                    <Text style={styles.cardValue}>{params?.endDate || "N/A"}</Text>
                </View>
            </View>

            {/* More Info */}
            <Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>More Info</Text>
                    <AssignUserRightIcon />
                </View>
            </Pressable>

            {/* Parts Section */}
            <Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
                <View style={styles.rowBetween}>
                    <Text style={styles.cardTitle}>Parts</Text>
                    <View style={styles.avatarRow}>
                        <Text style={styles.linkText}>{params?.parts || 0} Parts</Text>
                        <AssignUserRightIcon />
                    </View>
                </View>
            </Pressable>

            {/* Description Section */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Description</Text>
                <Text style={styles.description}>
                    {params?.description || "No description available."}
                </Text>
            </View>

            <AssignedUsersModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} users={mockUsers} />

            <PartsInfoModal visible={partsModalVisible} onClose={() => setPartsModalVisible(false)} parts={parts} />

            <MoreInfoModal visible={moreInfoModalVisible} onClose={() => setMoreInfoModalVisible(false)}
                           estimatedTime="2h 30m" requestedBy="Parwez Alam" createdOn="23/09/2025" />

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#F1F3F8",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#00000099",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0.1,
        borderColor: "#00000099",
        gap: 5
    },
    cardTitle: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#000000",
    },
    makeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatars: {
        flexDirection: "row",
    },
    avatar: {
        width: 25,
        height: 25,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#fff",
    },
    cardSubtitle: {
        fontSize: 10,
        fontFamily: Fonts.light,
        color: "#666",
    },
    cardValue: {
        fontSize: 10,
        fontFamily: Fonts.light,
        color: "#333",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#fff",
    },
    badgeLow: { backgroundColor: "#9BE7FF" },
    badgeMedium: { backgroundColor: "#FFD580" },
    badgeHigh: { backgroundColor: "#FF9B9B" },
    linkText: {
        fontSize: 10,
        fontFamily: Fonts.medium,
        color: "#742BDE",
    },
    description: {
        fontSize: 10,
        fontFamily: Fonts.light,
        color: "#444",
    },
});

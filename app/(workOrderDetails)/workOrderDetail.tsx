import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,} from "react-native";
import {useLocalSearchParams} from "expo-router";
import Fonts from "@/constants/Typography";
import Header from "@/components/global/Header";
import {WorkOrderCompleteIcon, WorkOrderInProgressIcon, WorkOrderOnHoldIcon, WorkOrderOpenIcon} from "@/constants/IconProvider";

export default function WorkOrderDetail() {
    const params = useLocalSearchParams();

    return (
        <>
            <Header title="Work Order Details"/>
            <ScrollView style={styles.container}>

                <View style={styles.header}>
                    <Text style={styles.woId}>{params.id}</Text>
                    <Text style={styles.woType}>{params.type}</Text>
                    <Text style={styles.woTitle}>{params.title}</Text>
                </View>


                <View style={styles.statusTabs}>
                    {["Open", "On Hold", "In Progress", "Done"].map((status, index) => {
                        const isActive = (params.priority === "Low" && status === "Open") || (params.priority === "Medium" && status === "In Progress") || (params.priority === "High" && status === "Done");

                        return (
                            <Pressable key={index} style={[styles.tab, isActive && styles.tabActive]}>
                                <View style={styles.tabIcon}>
                                    {status === "Open" ? <WorkOrderOpenIcon/> : status === "On Hold" ? <WorkOrderOnHoldIcon/> : status === "In Progress" ? <WorkOrderInProgressIcon/> : <WorkOrderCompleteIcon/>}
                                </View>

                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{status}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Assigned Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Assigned to</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardSubtitle}>{params.assignedTo || "N/A"}</Text>
                    </View>
                </View>

                {/* Priority Section */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Priority</Text>
                        <Text style={[styles.badge, params.priority === "Low" && styles.badgeLow, params.priority === "Medium" && styles.badgeMedium, params.priority === "High" && styles.badgeHigh]}>
                            #{params.priority}
                        </Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardSubtitle}>Start Date</Text>
                        <Text style={styles.cardSubtitle}>End Date</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardValue}>{params.startDate || "N/A"}</Text>
                        <Text style={styles.cardValue}>{params.endDate || "N/A"}</Text>
                    </View>
                </View>

                {/* Parts Section */}
                <TouchableOpacity style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Parts</Text>
                        <Text style={styles.linkText}>{params.parts || 0} Parts</Text>
                    </View>
                </TouchableOpacity>

                {/* Description Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Description</Text>
                    <Text style={styles.description}>
                        {params.description || "No description available."}
                    </Text>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    header: {
        backgroundColor: "#742BDE",
        borderRadius: 8,
        padding: 16,
    },
    woId: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#742BDE",
        backgroundColor: "#fff",
        alignSelf: "flex-start",
        paddingHorizontal: 5
    },
    woType: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#EAEAEA",
        marginTop: 4,
    },
    woTitle: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#fff",
        marginTop: 4,
    },
    statusTabs: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        marginVertical: 12,
    },
    tab: {
        alignItems: "center",
        justifyContent: "center",
        width: 86,
        height: 58,
        borderRadius: 8,
        backgroundColor: "#F9FAF9",
        marginHorizontal: 4,
        borderColor: "#00000033",
        borderWidth: 0.6
    },
    tabIcon:{
        height: 25,
        width: 25,
        alignItems: "center",
        justifyContent: "center"
    },
    tabActive: {
        backgroundColor: "#EFE4FF",
        borderWidth: 0
    },
    tabText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#742BDE",
        marginTop: 2,
    },
    tabTextActive: {
        color: "#742BDE",
        fontFamily: Fonts.medium,
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
    badgeLow: {backgroundColor: "#9BE7FF"},
    badgeMedium: {backgroundColor: "#FFD580"},
    badgeHigh: {backgroundColor: "#FF9B9B"},
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

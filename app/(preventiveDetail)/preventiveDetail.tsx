import Header from "@/components/global/Header";
import {useLocalSearchParams} from "expo-router";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Fonts from "@/constants/Typography";
import {AssignUserRightIcon} from "@/constants/IconProvider";
import {useState} from "react";
import AssignedUsersModal from "@/components/work-order-detail/AssignUserModal";
import PartsInfoModal from "@/components/work-order-detail/PartsInfoModal";
import MoreInfoModal from "@/components/work-order-detail/MoreInfoModal";

const mockUsers = [
    {id: "1", name: "Alice Johnson", avatar: "https://randomuser.me/api/portraits/women/1.jpg"},
    {id: "2", name: "Michael Smith", avatar: "https://randomuser.me/api/portraits/men/2.jpg"},
    {id: "3", name: "Sophia Brown", avatar: "https://randomuser.me/api/portraits/women/3.jpg"},
    {id: "4", name: "James Wilson", avatar: "https://randomuser.me/api/portraits/men/4.jpg"},
    {id: "5", name: "Emily Davis", avatar: "https://randomuser.me/api/portraits/women/5.jpg"},
];
const parts = [
    {id: "1", name: "ARM microcontrollers MCU Ultra-low power FPU Arm", quantity: 1},
    {id: "2", name: "Accelerometers tri-axis acclrmtr 8g, 16g, 32g", quantity: 4},
];
export default function PreventiveDetail() {
    const {parsedItem} = useLocalSearchParams();
    let item;
    if (parsedItem) if (typeof parsedItem === "string") item = JSON.parse(parsedItem);
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [partsModalVisible, setPartsModalVisible] = useState(false);
    const [moreInfoModalVisible, setMoreInfoModalVisible] = useState(false);

    return (
        <View style={{backgroundColor: "#F5F7FA", flex: 1}}>
            <Header title="Preventive Details"/>

            <View style={styles.header}>
                <Text style={styles.woType}>Preventive</Text>
                <Text style={styles.woTitle}>{item.title}</Text>
            </View>

            <View style={styles.statusInfo}>
                <Text style={styles.statusInfoText}>Status</Text>
                <View style={[styles.statusView, {backgroundColor: item.status === "Active" ? "#00B227" : "#FF0400"}]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.detailContainer}>

                <View style={styles.card}>
                    <View style={styles.makeRow}>
                        <Text style={styles.cardTitle}>Assigned to</Text>
                        <Pressable style={styles.avatarRow} onPress={() => setUserModalVisible(true)}>
                            <View style={styles.avatars}>
                                {mockUsers.slice(0, 3).map((user, i) => (
                                    <Image key={user.id} source={{uri: user.avatar}} style={[styles.avatar, {marginLeft: i === 0 ? 0 : -8}]}/>
                                ))}
                            </View>
                            <AssignUserRightIcon/>
                        </Pressable>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardSubtitle}>{item.assignedTo || "N/A"}</Text>
                    </View>
                </View>

                {/* Location */}
                <Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Location</Text>
                        <Text style={[styles.linkText, {color: "#000"}]}>Supreme Industries</Text>
                    </View>
                </Pressable>

                {/* Asset */}
                <Pressable style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Asset</Text>
                        <View style={styles.avatarRow}>
                            <Text style={styles.linkText}>New Asset</Text>
                            <AssignUserRightIcon/>
                        </View>
                    </View>
                </Pressable>

                {/* More Info */}
                <Pressable style={styles.card} onPress={() => setMoreInfoModalVisible(true)}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>More Info</Text>
                        <AssignUserRightIcon/>
                    </View>
                </Pressable>

                {/* Parts Section */}
                <Pressable style={styles.card} onPress={() => setPartsModalVisible(true)}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Parts</Text>
                        <View style={styles.avatarRow}>
                            <Text style={styles.linkText}>{item?.parts || 0} Parts</Text>
                            <AssignUserRightIcon/>
                        </View>
                    </View>
                </Pressable>
            </View>

            <View style={styles.detailContainer}>
                {/* Description Section */}
                    <Text style={styles.cardTitle}>Description</Text>
                    <Text style={styles.description}>
                        {item?.description || "No description available."}
                    </Text>
            </View>
            <AssignedUsersModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} users={mockUsers}/>

            <PartsInfoModal visible={partsModalVisible} onClose={() => setPartsModalVisible(false)} parts={parts}/>

            <MoreInfoModal visible={moreInfoModalVisible} onClose={() => setMoreInfoModalVisible(false)}
                           estimatedTime="2h 30m" requestedBy="Parwez Alam" createdOn="23/09/2025"/>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#742BDE",
        borderRadius: 8,
        padding: 16,
        margin: 20,
        gap: 4
    },
    woType: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#742BDE",
        backgroundColor: "#fff",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4
    },
    woTitle: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#fff",
    },
    statusInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 10
    },
    statusInfoText: {
        fontFamily: Fonts.semiBold,
        fontSize: 12
    },
    statusView: {
        paddingVertical: 7,
        paddingHorizontal: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5
    },
    statusText: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: "#fff",
    },
    detailContainer: {
        backgroundColor: "#F1F3F8",
        borderRadius: 4,
        padding: 15,
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#000000",
    },
    card: {
        backgroundColor: "#fff",
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
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
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
})
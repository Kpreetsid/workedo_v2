import {Pressable, Text, View, StyleSheet} from "react-native";
import Fonts from "@/constants/Typography";
import {WorkOrderCardLogo} from "@/constants/IconProvider";
import {router} from "expo-router";

type WorkOrder = {
    id: string;
    title: string;
    requestedBy: string;
    createdOn: string;
    status: "Open" | "Closed" | "Completed";
    priority: "Low" | "Medium" | "High";
    image: string;
};

const getPriorityColor = (priority: WorkOrder["priority"]) => {
    switch (priority) {
        case "Low":
            return {bg: "#3F009A40", text: "#742BDE"};
        case "Medium":
            return {bg: "#FF4D0040", text: "#D67B00"};
        case "High":
            return {bg: "#FF040042", text: "#D63928"};
        default:
            return {bg: "#eee", text: "#000"};
    }
};

const WorkOrderCard = ({item, isSelected, onPress}: { item: WorkOrder; isSelected: boolean; onPress: () => void; }) => {
    const priorityStyle = getPriorityColor(item.priority);

    const onCardPress = () => {
        onPress();
        isSelected && router.push({
            pathname: "/workOrderDetail",
            params: {
                id: item.id,
                title: item.title,
                type: "Preventive",
                requestedBy: item.requestedBy,
                createdOn: item.createdOn,
                priority: item.priority,
                startDate: "Sep 22, 2025",
                endDate: "Sep 25, 2025",
                parts: 2,
                description: "Hii, Welcome to our app...",
                assignedTo: "Gufic Biosciences Indore",
            },
        });
    }
    return (
        <Pressable style={[styles.card, isSelected && styles.selectedCard]} onPress={onCardPress}>

            <View>
                <Text style={styles.id}>{item.id}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subText}>Requested By : {item.requestedBy}</Text>
                <Text style={styles.subText}>Created On : {item.createdOn}</Text>
            </View>

            <View style={styles.rightSection}>
                <WorkOrderCardLogo/>

                <View style={styles.badgesRow}>
                    <View style={[styles.statusBadge, {backgroundColor: item.status === "Completed" ? "#00B227" : "#FFFFFF"}]}>
                        <Text style={[styles.statusText, {color: item.status === "Completed" ? "#fff" : "#343C6A" }]}>{item.status}</Text>
                    </View>

                    <View style={[styles.priorityBadge, {backgroundColor: priorityStyle.bg}]}>
                        <Text style={[styles.priorityText, {color: priorityStyle.text}]}>{item.priority}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default WorkOrderCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        shadowColor: "#0000000A",
        shadowOpacity: 0.04,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
        elevation: 2,
        borderWidth: 0.2,
        borderColor: "#0000004D",
        justifyContent: "space-between"
    },
    selectedCard: {
        borderColor: "#742BDE4D",
        borderWidth: 0.6,
        backgroundColor: "#742BDE14",
        shadowColor: "#0000000A",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    id: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        marginBottom: 5,
        color: "#000000",
    },
    title: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        marginBottom: 2,
        color: "#000000",
    },
    subText: {
        fontSize: 9,
        color: "#555",
        marginBottom: 2,
        fontFamily: Fonts.light
    },
    rightSection: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    badgesRow: {
        flexDirection: "row",
        gap: 6,
    },
    statusBadge: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 2,
        borderWidth: 0.2,
        borderColor: "#3F009A99",
    },
    statusText: {
        fontSize: 9,
        fontFamily: Fonts.light,
    },
    priorityBadge: {
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 2,
    },
    priorityText: {
        fontSize: 9,
        color: "#000000",
        fontFamily: Fonts.light
    },
})
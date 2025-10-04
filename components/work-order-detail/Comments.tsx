import { Comment } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";
import { StyleSheet, TextInput, View, Image, Text, FlatList } from "react-native";

type Comment = {
    id: string;
    name: string;
    date: string;
    avatar: string; // remote URL for now
    comment: string;
};

const mockComments: Comment[] = [
    {
        id: "1",
        name: "Parwez Alam",
        date: "23/09/2025",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        comment: "Vibo is a smart, on-motor hardware sensor designed to continuously monitor the health of your industrial motors.",
    },
    {
        id: "2",
        name: "Sophia Johnson",
        date: "21/09/2025",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        comment: "Really helpful tool! It reduced our downtime significantly and improved our maintenance schedules.",
    },
    {
        id: "3",
        name: "James Smith",
        date: "20/09/2025",
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
        comment: "We integrated this system into our plant, and the insights are accurate and reliable.",
    },
    {
        id: "4",
        name: "Emily Davis",
        date: "19/09/2025",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        comment: "The UI is intuitive, and the monitoring reports are easy to understand even for non-technical staff.",
    },
    {
        id: "5",
        name: "Michael Brown",
        date: "18/09/2025",
        avatar: "https://randomuser.me/api/portraits/men/50.jpg",
        comment: "Setup was straightforward, and support from the team has been fantastic.",
    },
    {
        id: "6",
        name: "Olivia Wilson",
        date: "17/09/2025",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        comment: "I especially like the preventive maintenance alerts—it keeps our machines in top shape.",
    },
    {
        id: "7",
        name: "Daniel Taylor",
        date: "15/09/2025",
        avatar: "https://randomuser.me/api/portraits/men/61.jpg",
        comment: "Performance has been solid, and the predictive features are surprisingly accurate.",
    },
    {
        id: "8",
        name: "Ava Martinez",
        date: "14/09/2025",
        avatar: "https://randomuser.me/api/portraits/women/23.jpg",
        comment: "Great product. It has already saved us a few costly breakdowns.",
    },
    {
        id: "9",
        name: "William Anderson",
        date: "13/09/2025",
        avatar: "https://randomuser.me/api/portraits/men/78.jpg",
        comment: "Simple to use and effective. Our technicians love the mobile integration.",
    },
    {
        id: "10",
        name: "Isabella Thomas",
        date: "11/09/2025",
        avatar: "https://randomuser.me/api/portraits/women/36.jpg",
        comment: "Very useful for tracking machine health over time. The analytics are detailed and actionable.",
    },
];

export default function Comments() {
    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Comment"
                    placeholderTextColor="#00000050"
                    style={styles.commentInput}
                    multiline
                />
                <View style={styles.iconWrapper}>
                    <Comment />
                </View>
            </View>


            <FlatList
                data={mockComments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <View style={styles.commentCard}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} resizeMode="cover" />

                    <View style={styles.content}>
                        <View style={styles.row}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.date}>{item.date}</Text>
                        </View>
                        <Text style={styles.comment}>{item.comment}</Text>
                    </View>
                </View>
                }
                showsVerticalScrollIndicator={false}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20
    },
    inputContainer: {
        height: 70,
        backgroundColor: "#F0EDFF",
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#000000"
    },
    commentInput: {
        flex: 1, 
        fontFamily: Fonts.regular,
        fontSize: 11,
        height: "100%", 
        textAlignVertical: "top",
        paddingHorizontal: 8,
    },
    iconWrapper: {
        position: "absolute",
        right: 8,
        bottom: 8,
    },
    commentCard: {
        borderRadius: 8,
        backgroundColor: "#fff",
        padding: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginVertical: 5
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        flexShrink: 0
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    name: {
        fontFamily: Fonts.regular,
        fontSize: 12,
        color: "#1C1C1C",
    },
    date: {
        fontFamily: Fonts.medium,
        fontSize: 9,
        color: "#000",
    },
    comment: {
        fontFamily: Fonts.light,
        fontSize: 10,
        lineHeight: 14,
        color: "#333",
    },
})
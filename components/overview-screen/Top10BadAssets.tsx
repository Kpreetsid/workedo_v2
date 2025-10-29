import {StyleSheet, Text, View} from "react-native";
import Fonts from "@/constants/Typography";

export default function Top10BadAssets() {
    const data = [
        {score: 92, unaddressed: 14, status: "Critical"},
        {score: 88, unaddressed: 10, status: "High"},
        {score: 85, unaddressed: 9, status: "High"},
        {score: 82, unaddressed: 8, status: "Medium"},
        {score: 78, unaddressed: 7, status: "Medium"},
        {score: 74, unaddressed: 6, status: "Medium"},
        {score: 70, unaddressed: 5, status: "Low"},
        {score: 67, unaddressed: 4, status: "Low"},
        {score: 63, unaddressed: 3, status: "Low"},
        {score: 59, unaddressed: 2, status: "Low"},
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Top 10 Bad Assets</Text>

            <View style={styles.table}>

                <View style={[styles.row, styles.headerRow]}>
                    <Text style={styles.headerText}>Score</Text>
                    <Text style={styles.headerText}>Un-Addressed</Text>
                    <Text style={styles.headerText}>Status</Text>
                </View>

                <View style={styles.divider}/>

                {data.map((item, index) => (
                    <View key={index}>
                        <View style={styles.row}>
                            <Text style={[styles.cell, {textAlign: "left"}]}>{item.score}</Text>
                            <Text style={[styles.cell, {textAlign: "center"}]}>{item.unaddressed}</Text>
                            <Text style={[styles.cell, {textAlign: "right"}, item.status === "Critical" ? {color: "#E63946"} : item.status === "High"
                                ? {color: "#FF8C00"} : item.status === "Medium" ? {color: "#F4A261"} : {color: "#4CAF50"}]}>
                                {item.status}
                            </Text>
                        </View>
                        <View style={styles.rowDivider}/>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 12,
    },
    table: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8
    },
    headerRow: {
        paddingBottom: 8,
        paddingHorizontal: 4
    },
    headerText: {
        color: "#742BDE",
        fontFamily: Fonts.medium,
        fontSize: 12,
        textAlign: "center",
    },
    cell: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#201F23",
        flex: 1
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        marginTop: 4,
        marginBottom: 6,
    },
    rowDivider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
});

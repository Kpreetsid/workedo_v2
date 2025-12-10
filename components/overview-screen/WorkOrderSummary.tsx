import { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";

const barData = [
    { value: 40, date: "2024-08-01T00:00:00.000Z" },
    { value: 60, date: "2024-09-01T00:00:00.000Z" },
    { value: 35, date: "2024-10-01T00:00:00.000Z" },
    { value: 55, date: "2024-11-01T00:00:00.000Z" },
    { value: 25, date: "2024-12-01T00:00:00.000Z" },
    { value: 50, date: "2025-01-01T00:00:00.000Z" },
];

const screenWidth = Dimensions.get("window").width;

export default function WorkOrderSummary() {
    const [selectedBar, setSelectedBar] = useState<number | null>(null);

    return (
        <View style={styles.container}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Work Order Summary</Text>
                <TouchableOpacity style={styles.badge} activeOpacity={0.8}>
                    <Calender />
                    <Text style={styles.badgeText}>Monthly</Text>
                    <DropDownIcon />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                {selectedBar !== null && <Pressable style={styles.overlay} onPress={() => setSelectedBar(null)} />}

                <BarChart
                    data={barData.map((bar, i) => ({ ...bar, onPress: () => setSelectedBar(i) }))}
                    barWidth={35}
                    frontColor="#742BDE50"
                    isAnimated
                    barBorderRadius={10}
                    spacing={24}
                    hideRules
                    hideAxesAndRules
                    initialSpacing={0}
                    yAxisLabelWidth={0}
                    xAxisLabelTextStyle={styles.axisLabel}
                    yAxisThickness={0}
                    xAxisThickness={0}
                    allowFontScaling
                    width={screenWidth - 55}
                    xAxisLabelTexts={barData.map(item =>new Date(item.date).toLocaleString("en-US", { month: "short" }))}
                />

                {selectedBar !== null && (
                    <View style={[styles.tooltip, { left: 20 + selectedBar * (35 + 24) - 10 }]}>
                        <Text style={styles.legendTitle}>{new Date(barData[selectedBar].date).toLocaleDateString()}</Text>
                        <Text style={styles.legendText}>{barData[selectedBar].value}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
    },
    badge: {
        borderWidth: 1,
        borderColor: "#E1E8EE",
        borderRadius: 8,
        width: 112,
        height: 28,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "space-evenly",
        flexDirection: "row",
    },
    badgeText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: "#201F23",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: "relative",
    },
    axisLabel: {
        fontSize: 11,
        fontFamily: Fonts.regular,
        color: "#718EBF",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        zIndex: 5,
    },
    tooltip: {
        position: "absolute",
        bottom: 140,
        backgroundColor: "#EFF2FC",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    legendTitle: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: "#45515C",
        textAlign: "center",
        textAlignVertical: "center"
    },
    legendText: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#45515C",
    },

});

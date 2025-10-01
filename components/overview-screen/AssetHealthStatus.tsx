import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";

const screenWidth = Dimensions.get("window").width;
const radius = screenWidth * 0.22;
const gap = radius * 0.08; // gap proportional to radius for consistent spacing
const arcPadding = 1.5;
const pieDataRaw = [
    { value: 6, color: "#74FD70", text: "Healthy" },
    { value: 5, color: "#F9FB6F", text: "Alert" },
    { value: 2, color: "#FB9C6D", text: "Danger" },
    { value: 1, color: "#EF4444", text: "Critical" },
    { value: 3, color: "#B0B0B0", text: "Not Detected" },
];

export default function AssetHealthStatus() {
    const total = pieDataRaw.reduce((sum, s) => sum + s.value, 0);
    let startAngle = -90;

    const pieData = pieDataRaw.map((slice) => {
        // subtract padding so slices don't overlap
        const sliceAngle = (slice.value / total) * 360 - arcPadding;
        const midAngle = startAngle + sliceAngle / 2;
        const rad = (midAngle * Math.PI) / 180;

        const shiftX = Math.cos(rad) * gap;
        const shiftY = Math.sin(rad) * gap;

        startAngle += sliceAngle + arcPadding; // keep cumulative rotation correct

        return {
            value: slice.value,
            color: slice.color,
            shiftX,
            shiftY,
            strokeColor: "#fff",
        };
    });

    return (
        <View style={styles.container}>
            <Text style={styles.cardTitle}>Asset Health Status</Text>
            <View style={styles.card}>
                <View style={styles.pieRow}>
                    <PieChart
                        data={pieData}
                        radius={radius}
                        donut={false}
                        showText={false}
                        sectionAutoFocus={false}
                    />

                    <View style={styles.pieLegend}>
                        <Text style={styles.legendHeader}>See Details</Text>
                        {pieDataRaw.map((item, index) => (
                            <View key={index} style={styles.legendRow}>
                                <View
                                    style={[styles.legendColor, { backgroundColor: item.color }]}
                                />
                                <Text style={styles.legendText}>{item.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 12,
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
    pieRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pieLegend: {
        marginLeft: 16,
        justifyContent: "center",
    },
    legendHeader: {
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: "#374151",
        marginBottom: 15,
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: "#45515C",
    },
});

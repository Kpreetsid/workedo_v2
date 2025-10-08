import { useState } from "react";
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Pressable} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import Fonts from "@/constants/Typography";
import { Calender, DropDownIcon } from "@/constants/IconProvider";

const barData = [
    { value: 40, label: "Aug", frontColor: "#742BDE" },
    { value: 60, label: "Sep", frontColor: "#3B82F6" },
    { value: 35, label: "Oct", frontColor: "#22C55E" },
    { value: 55, label: "Nov", frontColor: "#FACC15" },
    { value: 25, label: "Dec", frontColor: "#F97316" },
    { value: 50, label: "Jan", frontColor: "#EF4444" },
];

const screenWidth = Dimensions.get("window").width;

export default function AssetHealth() {
    const [selectedBar, setSelectedBar] = useState<number | null>(null);

    return (
        <View style={styles.container}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Asset Health</Text>
                <TouchableOpacity style={styles.badge} activeOpacity={0.8}>
                    <Calender />
                    <Text style={styles.badgeText}>Monthly</Text>
                    <DropDownIcon />
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                {selectedBar !== null && <Pressable style={styles.overlay} onPress={() => setSelectedBar(null)}/>}

                <BarChart
                    data={barData.map((bar, i) => ({...bar, onPress: () => setSelectedBar(i)}))}
                    barWidth={35}
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
                    width={screenWidth - 55}

                />

                {/* Floating tooltip/modal */}
                {selectedBar !== null && (
                    <View style={[styles.tooltip, {left: 20 + selectedBar * (35 + 24) - 10}]}>
                        <Text style={styles.legendTitle}>{barData[selectedBar].label}</Text>
                        <View style={styles.legendRow}>

                            <View style={[styles.legendColor, { backgroundColor: "#22C55E" }]}/>

                            <Text style={styles.legendText}>Healthy: 10</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View
                                style={[styles.legendColor, { backgroundColor: "#FACC15" }]}
                            />
                            <Text style={styles.legendText}>Warning: 3</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View
                                style={[styles.legendColor, { backgroundColor: "#F97316" }]}
                            />
                            <Text style={styles.legendText}>Critical: 2</Text>
                        </View>
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
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        minWidth: 120,
        zIndex: 10,
    },
    legendTitle: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        marginBottom: 6,
        color: "#45515C",
    },
    legendRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    legendColor: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 10,
        fontFamily: Fonts.regular,
        color: "#45515C",
    },
});

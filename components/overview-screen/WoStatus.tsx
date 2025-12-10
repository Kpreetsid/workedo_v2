import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { Calender, DropDownIcon } from "@/constants/IconProvider";
import Fonts from "@/constants/Typography";

const chartData: pieDataItem[] = [
    { value: 3, color: "#00B227" }, { value: 3, color: "#DEDEDE" }, { value: 3, color: "#FFC107" }, { value: 3, color: "#5552FE" },
];

export default function WoStatus() {
    return (
        <View style={styles.container}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Wo - Status</Text>

                <TouchableOpacity style={styles.badge} activeOpacity={0.8}>
                    <Calender />
                    <Text style={styles.badgeText}>Monthly</Text>
                    <DropDownIcon />
                </TouchableOpacity>
            </View>

            <View style={styles.chartWrapper}>
                <PieChart
                    data={chartData}
                    donut
                    radius={100}
                    innerRadius={60}
                    innerCircleColor="#FFFFFF"
                    focusOnPress={false}
                    showText={false}
                    strokeWidth={8}
                    strokeColor="#FFFFFF"
                    backgroundColor="transparent"
                    isAnimated
                />

                <View>
                    <LegendItem color="#00B227" label="Open" count={3} />
                    <LegendItem color="#DEDEDE" label="On Hold" count={3} />
                    <LegendItem color="#FFC107" label="In-Progress" count={3} />
                    <LegendItem color="#5552FE" label="Completed" count={3} />
                </View>
            </View>
        </View>
    );
}

type LegendProps = {
    color: string;
    label: string;
    count: number;
};

function LegendItem({ color, label, count }: LegendProps) {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>
                {label} <Text>{count}</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 0
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
    chartWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        elevation: 1,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    legendText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: "#45515C",
    },
});

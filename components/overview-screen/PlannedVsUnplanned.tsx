import Fonts from "@/constants/Typography";
import { View, Text, StyleSheet } from "react-native";
import { LineChart, lineDataItem } from "react-native-gifted-charts";

const data: lineDataItem[] = [
    { value: 0.8, label: "Jul" },
    { value: 1.5, label: "Aug" },
    { value: 1.1, label: "Sep" },
    { value: 2.2, label: "Oct" },
    { value: 3.8, label: "Nov" },
    { value: 1.0, label: "Dec" },
    { value: 2.6, label: "Jan" },
    { value: 3.1, label: "" },
];
export default function PlannedVsUnplanned() {
    return (
        <View style={styles.container}>
            <Text style={styles.cardTitle}>Wo - Priority</Text>

            <View style={styles.chartWrapper}>
                <LineChart
                    data={data}
                    curved                     
                    thickness={3}           
                    color="#742BDE"     
                    hideDataPoints
                    startFillColor="transparent"
                    endFillColor="transparent"
                    yAxisTextStyle={styles.yAxisText}
                    xAxisLabelTextStyle={styles.xAxisText}
                    noOfSections={4}
                    yAxisColor="#DFE5EE"
                    xAxisColor="#DFE5EE"
                    spacing={45}
                    adjustToWidth
                    initialSpacing={10}
                    endSpacing={20}
                    showYAxisIndices
                    showXAxisIndices
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 0
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 12,
    },
    chartWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        elevation: 1,
        overflow: "hidden"
    },
    yAxisText: {
        color: "#718EBF",
        fontSize: 10,
    },
    xAxisText: {
        color: "#718EBF",
        fontSize: 10,
        marginTop: 6,
    },
})
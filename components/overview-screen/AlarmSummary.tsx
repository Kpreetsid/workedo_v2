import {View, Text, StyleSheet} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Fonts from "@/constants/Typography";

export default function AlarmSummary() {
    const data = [
        {value: 1, label: 'Jul'},
        {value: 2, label: 'Aug'},
        {value: 3.5, label: 'Sep'},
        {value: 1, label: 'Oct'},
        {value: 0.8, label: 'Nov'},
        {value: 2, label: 'Dec'},
        {value: 3, label: 'Jan'},
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.chartTitle}>Alarm Summary</Text>
            <View style={styles.chart}>
                <LineChart
                    areaChart
                    curved
                    data={data}
                    startFillColor="rgba(255, 99, 99, 0.3)"
                    endFillColor="rgba(255, 99, 99, 0.05)"
                    startOpacity={0.4}
                    endOpacity={0.05}
                    color="#FF5C5C"
                    thickness={3}
                    hideRules={false}
                    yAxisColor="transparent"
                    xAxisColor="transparent"
                    hideDataPoints
                    spacing={40}
                    initialSpacing={20}
                    yAxisTextStyle={{color: '#999', fontSize: 10}}
                    xAxisLabelTextStyle={{color: '#999', fontSize: 10}}
                    yAxisLabelTexts={['0', '1', '2', '3', '4']}
                    noOfSections={4}
                    isAnimated
                    animateOnDataChange
                    animationDuration={1000}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    chartTitle: {
        fontSize: 16,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        marginBottom: 12,
    },
    chart: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        position: "relative",
    },
})

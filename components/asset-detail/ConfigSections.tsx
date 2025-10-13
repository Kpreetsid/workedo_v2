import { View, Text, StyleSheet, Dimensions } from "react-native";
import Fonts from "@/constants/Typography";

const mockConfigData = [
    {
        title: "General Configurations",
        data: [
            { label: "Mount Location", value: "Motor Housing" },
            { label: "Mount Material", value: "Aluminium" },
            { label: "Mount Type", value: "Bolt-On" },
            { label: "Asset Type", value: "Rotary Machine" },
        ],
    },
    {
        title: "Signal Processing Configurations",
        data: [
            { label: "RPM", value: "1500" },
            { label: "High Pass Filter Cut-Off", value: "10Hz" },
            { label: "Low Pass Filter Cut-Off", value: "1kHz" },
        ],
    },
    {
        title: "Bearing Configurations",
        data: [
            { label: "Bearing Number", value: "SKF 6205" },
            { label: "BPFO", value: "245" },
            { label: "BPFI", value: "300" },
            { label: "BSF", value: "125" },
            { label: "FTF", value: "15" },
        ],
    },
    {
        title: "Firmware Configurations",
        data: [
            { label: "Sensitivity", value: "2.5g" },
            { label: "Vibration Sampling Frequency (Raw Data)", value: "12800Hz" },
            { label: "Vibration Sampling Frequency (Edge)", value: "6400Hz" },
            { label: "Vibration No. of Samples (Raw Data)", value: "2048" },
            { label: "Vibration No. of Samples (Edge)", value: "1024" },
            { label: "Edge Calculation Interval (Minutes)", value: "5" },
        ],
    },
    {
        title: "Edge Parameters",
        data: [
            { label: "Acceleration RMS Horizontal(g)", value: "8" },
            { label: "Acceleration RMS Vertical(g)", value: "12800" },
            { label: "Vibration Sampling Frequency (Edge)", value: "12800" },
            { label: "Velocity RMS Horizontal(mm/s)", value: "16384" },
            { label: "Velocity RMS Vertical(mm/s)", value: "-" },
            { label: "Velocity RMS Axial(mm/s)", value: "-" },
            { label: "Acc. Peak to Peak Horizontal(g)", value: "4.00" },
            { label: "Acc. Peak to Peak Vertical(g)", value: "-" },
            { label: "Acc. Peak to Peak Axial(g)", value: "-" },
            { label: "Temperature (‘C)", value: "-" },
            { label: "Counter", value: "3" },
            { label: "Edge alarm time out (Hours)", value: "-" },
        ],
    },
    {
        title: "Utility",
        data: [
            { label: "Currently tracking End-Point", value: "Not defined yet" },
            { label: "Running Value", value: "-" },
            { label: "Shift start time (24 Hr format)", value: "-" },
            { label: "Total working hours", value: "-" },
            { label: "Time Zone", value: "-" },
            { label: "User Emails", value: "-" },
        ],
    },
];

export default function ConfigSections () {
    return (
        <>
            {mockConfigData.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.configRow}>
                        {section.data.map((item, index) => (
                            <View key={index} style={styles.configBox}>
                                <Text style={styles.configLabel}>{item.label}</Text>
                                <Text style={styles.configValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </>
    );
};


const SCREEN_WIDTH = Dimensions.get("window").width;

const styles = StyleSheet.create({
    section: {
        marginHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderWidth: 0.6,
        borderColor: "#D9D9D9",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: Fonts.semiBold,
        color: "#000000",
        backgroundColor: "#FBF8FF",
        borderWidth: 0.3,
        borderColor: "#00214320",
        borderRadius: 2,
        paddingHorizontal: 5,
        paddingVertical: 3,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    configRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    configBox: {
        backgroundColor: "#F9F5FF70",
        borderLeftWidth: 0.5,
        borderColor: "#3F009A",
        padding: 5,
        marginVertical: 5,
        alignItems: "center",
        justifyContent: "center",
        maxWidth: (SCREEN_WIDTH / 3) - 28,
        flexGrow: 1,
    },
    configLabel: {
        fontSize: 11,
        fontFamily: Fonts.semiBold,
        color: "#1C1C1C",
        // letterSpacing: 0.3,
        textShadowColor: "#00000025",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    configValue: {
        fontSize: 11,
        fontFamily: Fonts.light,
        color: "#742BDE",
        textShadowColor: "#742BDE25",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

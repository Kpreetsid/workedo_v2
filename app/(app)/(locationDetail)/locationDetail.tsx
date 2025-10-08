import {Image, ScrollView, StyleSheet, Text, TextInput, View,} from "react-native";
import Header from "@/components/global/Header";
import Fonts from "@/constants/Typography";

type Asset = {
    name: string;
    type: string;
    status: "Critical" | "Healthy" | "Alert" | "Unknown";
    lastData: string;
};

const ASSETS: Asset[] = [
    {
        name: "Mixture Machine",
        type: "Other",
        status: "Critical",
        lastData: "Jan 16, 2025, 11:19 AM",
    },
    {
        name: "Die Casting Motor 560 ton-8",
        type: "Other",
        status: "Healthy",
        lastData: "Jan 16, 2025, 10:30 AM",
    },
    {
        name: "Die Casting Motor 560 ton-9",
        type: "Other",
        status: "Alert",
        lastData: "Jan 16, 2025, 10:30 AM",
    },
    {
        name: "Mixture Machine",
        type: "Other",
        status: "Critical",
        lastData: "Jan 16, 2025, 11:19 AM",
    },
    {
        name: "Die Casting Motor 560 ton-8",
        type: "Other",
        status: "Healthy",
        lastData: "Jan 16, 2025, 10:30 AM",
    },
    {
        name: "Die Casting Motor 560 ton-9",
        type: "Other",
        status: "Alert",
        lastData: "Jan 16, 2025, 10:30 AM",
    },
];

export default function LocationDetail() {

    return (
        <>
            <Header title="Location Detail"/>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header card with image + info */}
                <View style={styles.headerCard}>
                    <Image source={require("@/assets/images/locationDetail.png")} style={styles.image} resizeMode="stretch"/>
                    <View style={styles.infoSection}>
                        <Text style={styles.label}>Location ID</Text>
                        <TextInput style={styles.input} value="qwerty754hdjsee8whas67uhvc" editable={false}/>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Location Type</Text>
                                <TextInput style={styles.input} value="Plant" editable={false}/>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Location</Text>
                                <TextInput style={styles.input} value="Grasim Nagda" editable={false}/>
                            </View>
                        </View>
                    </View>
                </View>


                {ASSETS.map((asset, index) => (
                    <View key={index} style={[styles.assetCard, statusWrapper(asset.status)]}>
                        <View style={[styles.column, {flex: 1}]}>
                            <Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Asset Name</Text>
                            <Text style={styles.assetValue}>{asset.name}</Text>
                        </View>

                        <View style={[styles.column, {flex: 1}]}>
                            <Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Asset Type</Text>
                            <Text style={styles.assetValue}>{asset.type}</Text>
                        </View>

                        <View style={[styles.column, {flex: 1}]}>
                            <Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Status</Text>
                            <Text style={styles.assetValue}>{asset.status}</Text>
                        </View>

                        <View style={[styles.column, {flex: 1.6}]}>
                            <Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Last Data Collected</Text>
                            <Text style={styles.assetValue}>{asset.lastData}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </>
    );
}

function statusWrapper(status: Asset["status"]) {
    switch (status) {
        case "Critical":
            return {backgroundColor: "#ff040010", borderColor: "#ff0400", borderWidth: 0.3};
        case "Healthy":
            return {backgroundColor: "#00b22710", borderColor: "#00b227", borderWidth: 0.3};
        case "Alert":
            return {backgroundColor: "#ffc10710", borderColor: "#ffc107", borderWidth: 0.3};
        default:
            return null;
    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 30,
    },
    headerCard: {
        backgroundColor: "#742BDE02",
        borderRadius: 12,
        padding: 5,
        marginBottom: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#34343450",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    image: {
        width: 145,
        height: 77,
        borderRadius: 10
    },
    infoSection: {
        flex: 1,
        justifyContent: "center",
    },
    label: {
        fontSize: 9,
        fontFamily: Fonts.extraLight,
        marginBottom: 2,
        color: "#000000",
    },
    input: {
        borderWidth: 0.4,
        borderColor: "#00000020",
        borderRadius: 4,
        padding: 1,
        paddingHorizontal: 5,
        marginBottom: 3,
        fontSize: 10,
        backgroundColor: "#FFFFFF",
        fontFamily: Fonts.light,
        flex: 1
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    col: {
        flex: 1,
        marginRight: 8,
    },

    /* Asset card */
    assetCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#0000000d",
    },
    column: {
        minWidth: 0,
        alignItems: "center",
    },
    assetLabel: {
        fontFamily: Fonts.regular,
        fontSize: 10,
        color: "#000000",
        marginBottom: 4,
        textAlign: "center",

    },
    assetValue: {
        fontSize: 9,
        fontFamily: Fonts.light,
        color: "#111",
        textAlign: "center",
        lineHeight: 16,
        flexShrink: 1,
        flexWrap: "wrap",
    }
});
import Header from "@/components/global/Header";
import {FlatList, Pressable, Text, StyleSheet, Dimensions, View} from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import {router} from "expo-router";
import Fonts from "@/constants/Typography";
import {ArrowRight, MapIcon} from "@/constants/IconProvider";
import {useState} from "react";

const locations: string[] = [
    "New York, USA",
    "Berlin, Germany",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Toronto, Canada",
    "Dubai, UAE",
    "Paris, France",
    "Singapore",
    "San Francisco, USA",
    "London, UK",
    "Barcelona, Spain",
    "Amsterdam, Netherlands",
    "Mumbai, India",
    "Cape Town, South Africa",
    "Seoul, South Korea",
    "Chicago, USA",
    "Rome, Italy",
    "Bangkok, Thailand",
    "Lisbon, Portugal",
    "Rio de Janeiro, Brazil",
];

const width = Dimensions.get("window").width;
export default function SelectLocation() {
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    return (
        <>
            <Header title="Select Location"/>
            <FlatList
                data={locations}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item}) => (
                    <Pressable style={[styles.locationButton, {
                        backgroundColor: selectedLocation === item ? "#FFBF0080" : "#fff",
                        borderColor: selectedLocation === item ? "#FFC1074D" : "#99999933"
                    }]} onPress={() => setSelectedLocation(item)}>
                        <View style={styles.textRow}>
                            <Text style={styles.locationText}>{item}</Text>
                            <ArrowRight color={"#201F23CC"}/>
                        </View>
                        <MapIcon/>
                    </Pressable>)}
                contentContainerStyle={styles.container}
            />
            <ActionButton onPress={() => router.back()} label="Confirm Location" buttonStyle={styles.actionButton}/>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#F5F7FA",
        paddingHorizontal: 25,
        paddingTop: 15,
        paddingBottom: 105,
        gap: 10
    },
    locationButton: {
        borderWidth: 0.6,
        borderRadius: 7,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    textRow: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
    },
    locationText: {
        fontSize: 10,
        fontFamily: Fonts.semiBold,
        color: "#201F23",
        lineHeight: 20
    },
    actionButton: {
        position: "absolute",
        bottom: "2%",
        alignSelf: "center",
        width: width - 50
    }
})

import Header from "@/components/global/Header";
import {Dimensions, FlatList, Pressable, StyleSheet, Text, View} from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import {router} from "expo-router";
import Fonts from "@/constants/Typography";
import {ArrowRight, MapIcon} from "@/constants/IconProvider";
import {useState} from "react";
import SearchBar from "@/components/global/SearchBar";

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
export default function SelectLocation({showHeader = true}: { showHeader?: boolean }) {
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [searchText, setSearchText] = useState("");

    return (
        <>
            {showHeader && <Header title="Select Location"/>}
            <View style={{flex:1}}>
                <SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText}/>

                <FlatList
                    data={locations}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({item}) => (
                        <Pressable style={[styles.locationButton, {backgroundColor: selectedLocation === item ? "#FFBF0080" : "#fff", borderColor: selectedLocation === item ? "#FFC1074D" : "#99999933"}]}
                                   onPress={() => {
                                       setSelectedLocation(item);
                                       selectedLocation === item && router.push("/locationDetail")
                                   }}>
                            <View style={styles.textRow}>
                                <Text style={styles.locationText}>{item}</Text>
                                <ArrowRight color={"#201F23CC"}/>
                            </View>
                            <MapIcon/>
                        </Pressable>)}
                    contentContainerStyle={styles.container}
                />
                <ActionButton onPress={() => router.back()} label="Confirm Location" buttonStyle={styles.actionButton}/>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginVertical: 10,
        gap: 10
    },
    input: {
        fontSize: 12,
        fontFamily: Fonts.regular
    },
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
        bottom: 20,
        alignSelf: "center",
        width: width - 50
    }
})

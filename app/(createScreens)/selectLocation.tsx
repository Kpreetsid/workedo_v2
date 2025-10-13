import Header from "@/components/global/Header";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";
import { useEffect, useState } from "react";
import SearchBar from "@/components/global/SearchBar";
import { locationTree } from "@/src/services/location.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Location } from "@/src/types/location";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";

interface LocationInterface {
	showHeader?: boolean,
	selection?: boolean
}

const width = Dimensions.get("window").width;
export default function SelectLocation({ showHeader = true, selection = true }: LocationInterface) {
	const [selectedLocation, setSelectedLocation] = useState<Location>();
	const [searchText, setSearchText] = useState("");
	const user = useAuthStore((state) => state.user);
	const [locations, setLocations] = useState<Location[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const { setFormValue } = usePreventiveStore();

	useEffect(() => {
		fetchLocations();
	}, []);

	const fetchLocations = async () => {
		try {
			const res = await locationTree();

			if (res.status) {
				console.log('res locations = ', res?.data);
				setLocations(res.data as Location[]);
			}
		} catch (err: any) {
			console.error("Login failed:", err);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchLocations();
		setRefreshing(false);
	};

	return (
		<>
			{showHeader && <Header title="Select Location" />}
			<View style={{ flex: 1 }}>
				<SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />

				<FlatList
					data={locations}
					keyExtractor={(_, index) => index.toString()}
					renderItem={({ item }) => (
						<Pressable style={[styles.locationButton, { backgroundColor: selectedLocation === item ? "#FFBF0080" : "#fff", borderColor: selectedLocation === item ? "#FFC1074D" : "#99999933" }]}
							onPress={() => {
								if (selection) {
									setSelectedLocation(item);
									// updating selected location in zustand store while creating part
									setFormValue("location", item);
									router.back();
								} else {
									router.push({
										pathname: "/locationDetail",
										params: { data: JSON.stringify(item) },
									});
								}
							}}
						>

							<View style={styles.textRow}>
								<Text style={styles.locationText}>{item.location_name}</Text>
								<ArrowRight color={"#201F23CC"} />
							</View>
							<MapIcon />
						</Pressable>)}
					contentContainerStyle={styles.container}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>

				{selection && <ActionButton onPress={() => router.back()} label="Confirm Location" buttonStyle={styles.actionButton} />}
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

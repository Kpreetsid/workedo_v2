import Header from "@/components/global/Header";
import { ActivityIndicator, Alert, Dimensions, FlatList, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/global/SearchBar";
import { copyLocation, deleteLocation, locationTree } from "@/src/services/location.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Location } from "@/src/types/location";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import Popover from "react-native-popover-view";
import LocationCard from "@/components/locations/LocationCard";
import CreateFAB from "@/components/global/CreateFAB";

interface LocationInterface {
	showHeader?: boolean,
	selection?: boolean
}

const width = Dimensions.get("window").width;
export default function SelectLocation({ showHeader = true, selection = true }: LocationInterface) {
	console.log('rendering select location');

	const [loading, setLoading] = useState(true);

	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;

	const [searchText, setSearchText] = useState("");
	const user = useAuthStore((state) => state.user);
	const [locations, setLocations] = useState<Location[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [deleteLoading, setDeleteLoading] = useState(false);


	const flattenLocations = (list: Location[]) => {
		const out: Location[] = [];
		const walk = (items: Location[]) => {
			items.forEach(i => {
				out.push(i);
				if (i.childs && i.childs.length) walk(i.childs);
			});
		};
		walk(list || []);
		return out;
	};

	const flatLocations = useMemo(() => flattenLocations(locations), [locations]);
	const filteredLocations = useMemo(() => {
		const q = (searchText || "").trim().toLowerCase();
		if (!q) return flatLocations;
		return flatLocations.filter(l => (l.location_name || "").toLowerCase().includes(q));
	}, [searchText, flatLocations]);

	useEffect(() => {
		console.log('filtered locations = ', filteredLocations);
	}, [filteredLocations])

	useFocusEffect(
		useCallback(() => {
			fetchLocations();
			return () => {
				setSearchText("");
			};
		}, [])
	);

	const fetchLocations = async () => {
		setLoading(true);
		try {
			const res = await locationTree();
			const incoming = Array.isArray(res?.data) ? (res.data as Location[]) : [];

			if (res?.message === "No data found" || !res?.status || incoming.length === 0) {
				setLocations([]);
				return;
			}

			console.log('res locations = ', res?.data);
			setLocations(incoming);
		} catch (err: any) {
			if (err?.message === "No data found") {
				setLocations([]);
				return;
			}

			console.error("Login failed:", err);
			setLocations([]);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchLocations();
		setRefreshing(false);
	};

	const handleCopyLocation = async (item: Location) => {
		console.log('copying location = ', item);
		Alert.alert(
			"Copy Location",
			`Are you sure you want to copy ${item.location_name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Confirm",
					style: "destructive",
					onPress: async () => {
						setDeleteLoading(true)
						try {
							const resp = await copyLocation(item?.id);
							console.log('resp = ', resp);
							if (resp?.status) {
								ToastAndroid.show("Location Copied", ToastAndroid.SHORT);
								fetchLocations();
								setDeleteLoading(false)
							}
						} catch (e) {
							setDeleteLoading(false)
							console.log('error deleting = ', e);
						}
					},
				},
			],
			{ cancelable: true }
		);
	}

	const handleDeleteLocation = async (item: Location) => {
		console.log('deleting location = ', item);
		Alert.alert(
			"Delete Location",
			`Are you sure you want to delete ${item.location_name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						setDeleteLoading(true)
						try {
							const resp = await deleteLocation(item?.id);
							console.log('resp = ', resp);
							if (resp?.status) {
								ToastAndroid.show("Location Deleted", ToastAndroid.SHORT);
								fetchLocations();
								setDeleteLoading(false)
							}
						} catch (e) {
							setDeleteLoading(false)
							console.log('error deleting = ', e);
						}
					},
				},
			],
			{ cancelable: true }
		);


	}

	return (
		<>
			{showHeader && <Header title="Select Location" />}
			<>
				{
					!selection && <SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />
				}

				{
					<FlatList
						ListHeaderComponent={() => {
							return (
								<>
									{/* {
										!selection && (
											<TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/createLocation")}>
												<Text style={styles.buttonText}>Create Location</Text>
											</TouchableOpacity>
										)
									} */}

								</>
							);
						}}
						data={searchText ? filteredLocations : locations}
						keyExtractor={(_, index) => index.toString()}
						renderItem={
							({ item }: { item: Location }) => <LocationCard
								item={item}
								selection={selection}
								comingFrom={comingFrom}
								handleDeleteLocation={handleDeleteLocation}
								handleCopyLocation={handleCopyLocation}
							/>
						}
						contentContainerStyle={[
							styles.container,
							(searchText ? filteredLocations : locations).length === 0 && styles.emptyListContainer,
						]}
						refreshing={refreshing}
						onRefresh={handleRefresh}
						ListEmptyComponent={
							<View style={styles.emptyState}>
								{loading || refreshing ? (
									<ActivityIndicator size="large" />
								) : (
									<Text style={styles.emptyText}>No Locations found!</Text>
								)}
							</View>
						}
					/>
				}

				{selection && <ActionButton onPress={() => router.back()} label="Confirm Location" buttonStyle={styles.actionButton} />}
			</>


			<CreateFAB label="Create Location" onPress={() => router.push("/createLocation")} />
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
		paddingHorizontal: 25,
		// paddingTop: 15,
		paddingBottom: '30%',
		gap: 10
	},
	emptyListContainer: {
		flexGrow: 1,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	emptyText: {
		fontSize: 14,
		color: "#000000",
		textAlign: "center",
		fontFamily: Fonts.regular,
	},
	/* Add Task Button */
	buttonContainer: {
		marginTop: 5,
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		justifyContent: "center",
		gap: 5,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.60,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
	actionButton: {
		position: "absolute",
		bottom: 0,
		alignSelf: "center",
		width: width - 50,
	},
})

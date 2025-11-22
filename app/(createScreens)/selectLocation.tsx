import Header from "@/components/global/Header";
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/global/SearchBar";
import { deleteLocation, locationTree } from "@/src/services/location.service";
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

interface LocationInterface {
	showHeader?: boolean,
	selection?: boolean
}

const width = Dimensions.get("window").width;
export default function SelectLocation({ showHeader = true, selection = true }: LocationInterface) {
	console.log('rendering select location');

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
		}, [])
	);

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

	const handleDeleteLocation = async (item: Location) => {
		console.log('deleting location = ', item);
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
	}

	return (
		<>
			{showHeader && <Header title="Select Location" />}
			<>
				<SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />
				<FlatList
					ListHeaderComponent={() => {
						return (
							<>
								{
									!selection && (
										<TouchableOpacity style={styles.buttonContainer} onPress={() => router.push("/createLocation")}>
											<Text style={styles.buttonText}>Create Location</Text>
										</TouchableOpacity>
									)
								}

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
						/>}
					// renderItem={({ item }) => {
					// 	const isExpanded = expandedAssetId === item.id;
					// 	const hasChildren = item.childs && item.childs.length > 0;

					// 	return (
					// 		<View>
					// 			<Pressable style={
					// 				[
					// 					styles.locationButton,
					// 					isExpanded ? {
					// 						borderBottomLeftRadius: 0,
					// 						borderBottomRightRadius: 0,
					// 					} : {},
					// 					{
					// 						backgroundColor: selectedLocation?.id === item.id ? "#FFBF0080" : "#fff",
					// 						borderColor: selectedLocation?.id === item.id ? "#FFC1074D" : "#99999933"
					// 					}
					// 				]
					// 			}
					// 				onPress={() => {
					// 					if (selection) {
					// 						setSelectedLocation(item);
					// 						// updating selected location in zustand store while creating part
					// 						console.log('in selection = ', comingFrom)
					// 						if (comingFrom === "newWorkOrder") {
					// 							setWorkForm("location", item);
					// 						} else if (comingFrom === "newWorkRequest") {
					// 							setWorkRequestForm("location", item);
					// 						} else if (comingFrom === "createPart") {
					// 							setPartFormValue("location", item);
					// 						} else {
					// 							setPreventiveValue("location", item);
					// 						}
					// 						router.back();
					// 					} else {
					// 						console.log('in else = ', item)
					// 						router.push({
					// 							pathname: "/locationDetail",
					// 							params: { data: JSON.stringify(item) },
					// 						});
					// 					}
					// 				}}
					// 			>
					// 				<View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
					// 					<View style={styles.textRow}>
					// 						<Ionicons name="chevron-forward" color={"#201F23"} size={14} />
					// 						<Text style={styles.locationText}>{item.location_name}</Text>
					// 						{/* <ArrowRight color={"#201F23CC"} /> */}
					// 					</View>

					// 					{/* {hasChildren && (
					// 						<Pressable onPress={() => {
					// 							setExpandedAssetId(isExpanded ? null : item.id);
					// 						}}>
					// 							<Text style={styles.childLabel}>
					// 								Child locations
					// 								{isExpanded ? " ▲" : " ▼"}
					// 							</Text>
					// 						</Pressable>
					// 					)} */}

					// 				</View>
					// 				{/* <MapIcon /> */}

					// 				<Popover
					// 					isVisible={openPopoverId === item.id}
					// 					onRequestClose={() => setOpenPopoverId(null)}
					// 					from={(
					// 						<TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(item.id)}>
					// 							<Ionicons name="ellipsis-vertical" size={18} color="#201F23CC" />
					// 						</TouchableOpacity>
					// 					)}>
					// 					<View style={styles.popoverContent}>
					// 						{
					// 							[
					// 								{ icon: 'add', text: 'Add' },
					// 								{ icon: 'pencil', text: 'Edit' },
					// 								{ icon: 'copy', text: 'Copy' },
					// 								{ icon: 'trash', text: 'Delete' }
					// 							].map((option, index) => {
					// 								return (
					// 									<Pressable
					// 										style={styles.popoverItem}
					// 										key={index}
					// 										onPress={async () => {
					// 											if (index === 0) {
					// 												router.push({
					// 													pathname: "/locationDetail",
					// 													params: { data: JSON.stringify(item) },
					// 												});
					// 											} else if (index === 1) {
					// 												router.push({
					// 													pathname: "/createLocation",
					// 													params: {
					// 														location_data: JSON.stringify(item),
					// 														isEdit: 'true'
					// 													},
					// 												});
					// 											} else if (index === 3) {
					// 												handleDeleteLocation(item)
					// 											}
					// 											setOpenPopoverId(null)
					// 										}}
					// 									>
					// 										<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
					// 											<Ionicons name={option.icon as any} size={16} color="#71717A" />

					// 											<Text style={{ color: "#71717A", fontFamily: Fonts.regular }}>
					// 												{option.text}
					// 											</Text>

					// 											{
					// 												(deleteLoading && index === 3) && <ActivityIndicator size={"small"} color={"#71717A"} />
					// 											}
					// 										</View>
					// 									</Pressable>
					// 								);
					// 							})
					// 						}
					// 					</View>
					// 				</Popover>
					// 			</Pressable>

					// 			{/* 👇 Show child assets if expanded */}
					// 			{
					// 				isExpanded && hasChildren && (
					// 					<View style={styles.childContainer}>
					// 						{item?.childs?.map((child) => (
					// 							<Pressable
					// 								key={child.id}
					// 								style={styles.childButton}
					// 								onPress={() =>
					// 									router.push({
					// 										pathname: "/locationDetail",
					// 										params: { data: JSON.stringify(child) },
					// 									})
					// 								}
					// 							>
					// 								<Text style={styles.childText}>{child.location_name}</Text>
					// 							</Pressable>
					// 						))}
					// 					</View>
					// 				)
					// 			}
					// 		</View>
					// 	);
					// }}
					contentContainerStyle={styles.container}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>

				{selection && <ActionButton onPress={() => router.back()} label="Confirm Location" buttonStyle={styles.actionButton} />}
			</>
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

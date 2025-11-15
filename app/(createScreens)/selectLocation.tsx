import Header from "@/components/global/Header";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import ActionButton from "@/components/create-screens/ActionButton";
import { router, useLocalSearchParams } from "expo-router";
import Fonts from "@/constants/Typography";
import { ArrowRight, MapIcon } from "@/constants/IconProvider";
import { useEffect, useState } from "react";
import SearchBar from "@/components/global/SearchBar";
import { locationTree } from "@/src/services/location.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Location } from "@/src/types/location";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";

interface LocationInterface {
	showHeader?: boolean,
	selection?: boolean
}

const width = Dimensions.get("window").width;
export default function SelectLocation({ showHeader = true, selection = true }: LocationInterface) {
	console.log('rendering select location');
	const params: any = useLocalSearchParams();
	const comingFrom = params?.comingFrom;
	const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

	const [selectedLocation, setSelectedLocation] = useState<Location>();
	const [searchText, setSearchText] = useState("");
	const user = useAuthStore((state) => state.user);
	const [locations, setLocations] = useState<Location[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPartFormValue } = usePartFormStore();
	const { setPreventiveValue } = usePreventiveStore();

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
			<>
				<SearchBar placeholder="Search Location..." value={searchText} onChangeText={setSearchText} />

				<FlatList
					data={locations}
					keyExtractor={(_, index) => index.toString()}
					renderItem={({ item }) => {
						const isExpanded = expandedAssetId === item.id;
						const hasChildren = item.childs && item.childs.length > 0;

						return (
							<View>
								<Pressable style={
									[
										styles.locationButton,
										isExpanded ? {
											borderBottomLeftRadius: 0,
											borderBottomRightRadius: 0,
										} : {},
										{
											backgroundColor: selectedLocation?.id === item.id ? "#FFBF0080" : "#fff",
											borderColor: selectedLocation?.id === item.id ? "#FFC1074D" : "#99999933"
										}
									]
								}
									onPress={() => {
										if (selection) {
											setSelectedLocation(item);
											// updating selected location in zustand store while creating part
											console.log('in selection = ', comingFrom)
											if (comingFrom === "newWorkOrder") {
												setWorkForm("location", item);
											} else if (comingFrom === "newWorkRequest") {
												setWorkRequestForm("location", item);
											} else if (comingFrom === "createPart") {
												setPartFormValue("location", item);
											} else {
												setPreventiveValue("location", item);
											}
											router.back();
										} else {
											console.log('in else = ', item)
											router.push({
												pathname: "/locationDetail",
												params: { data: JSON.stringify(item) },
											});
										}
									}}
								>

									<View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
										<View style={styles.textRow}>
											<Text style={styles.locationText}>{item.location_name}</Text>
											<ArrowRight color={"#201F23CC"} />
										</View>

										{hasChildren && (
											<Pressable onPress={() => {
												// Toggle expand instead of navigating
												setExpandedAssetId(isExpanded ? null : item.id);
											}}>
												<Text style={styles.childLabel}>
													Child locations
													{isExpanded ? " ▲" : " ▼"}
												</Text>
											</Pressable>
										)}

									</View>
									<MapIcon />
								</Pressable>

								{/* 👇 Show child assets if expanded */}
								{
									isExpanded && hasChildren && (
										<View style={styles.childContainer}>
											{item?.childs?.map((child) => (
												<Pressable
													key={child.id}
													style={styles.childButton}
													onPress={() =>
														router.push({
															pathname: "/locationDetail",
															params: { data: JSON.stringify(child) },
														})
													}
												>
													<Text style={styles.childText}>{child.location_name}</Text>
												</Pressable>
											))}
										</View>
									)
								}
							</View>
						);
					}}
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
		paddingTop: 15,
		paddingBottom: '30%',
		gap: 10
	},
	locationButton: {
		// borderWidth: 0.6,
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
	childContainer: {
		backgroundColor: "#fff",
		paddingLeft: 40,
		paddingBottom: 10,
		borderBottomLeftRadius: 7,
		borderBottomRightRadius: 7,
	},
	childButton: {
		paddingVertical: 5,
	},
	childText: {
		fontSize: 10,
		color: "#555",
		fontFamily: Fonts.regular,
	},
	childLabel: {
		marginTop: 3,
		fontSize: 10,
		color: "#201F23",
		fontFamily: Fonts.light,
	},
	locationText: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20
	},
	actionButton: {
		position: "absolute",
		width: width - 50,
		bottom: 0,
		alignSelf: "center",
	}
})

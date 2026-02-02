import Header from "@/components/global/Header";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useState } from "react";
import { StyleSheet, View, Text, Pressable, FlatList, TouchableOpacity, Alert, ToastAndroid } from "react-native";
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import { router, useFocusEffect } from "expo-router";
import { deletePart, getParts } from "@/src/services/part.service";
import FAB from "@/components/overview-screen/FAB";
import CreateFAB from "@/components/global/CreateFAB";
import Popover from "react-native-popover-view";
import { FABIcon } from "@/constants/IconProvider";
import { Part } from "@/src/types/part";
import { Location } from "@/src/types/location";
import LocationPickerModal from "@/components/create-work-order/LocationPickerModal";

export default function PartsInventory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [parts, setParts] = useState<any[]>([]);
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

	useFocusEffect(
		useCallback(() => {
			fetchParts();
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchParts(selectedLocation?.id);
		setRefreshing(false);
	};

	const fetchParts = async (locationId?: string | null) => {
		try {
			const resp = await getParts(locationId || undefined);
			console.log('resp = ', resp);
			if (resp.status) {
				setParts(resp?.data);
			}
		} catch (error) {
			console.log('error = ', error);
		}
	}

	const handleDeletePart = async (item: Part) => {
		Alert.alert(
			"Delete Part",
			`Are you sure you want to delete ${item?.part_name}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {

						console.log('deleting preventive = ', item);
						// setDeleteLoading(true)
						try {
							const resp = await deletePart(item?.id);
							console.log('resp = ', resp);
							if (resp?.status) {
								ToastAndroid.show("Part Deleted", ToastAndroid.SHORT);
								fetchParts(selectedLocation?.id);
							}
						} catch (e) {
							// setDeleteLoading(false)
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
			<Header title="Parts Inventory" />
			<View style={styles.container}>
				<SearchBar value={searchQuery} onChangeText={setSearchQuery} />
				<Pressable style={styles.filterRow} onPress={() => setLocationModalVisible(true)}>
					<View style={styles.filterLeft}>
						<Ionicons name="location-outline" size={16} color="#201F23CC" />
						<Text style={styles.filterText}>
							{selectedLocation?.location_name || "All Locations"}
						</Text>
					</View>
					{selectedLocation ? (
						<TouchableOpacity
							onPress={() => {
								setSelectedLocation(null);
								fetchParts();
							}}
						>
							<Ionicons name="close-circle" size={18} color="#742BDE" />
						</TouchableOpacity>
					) : (
						<Ionicons name="chevron-down" size={18} color="#742BDE" />
					)}
				</Pressable>

				<FlatList
					data={parts}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<Pressable
							style={({ pressed }) => [
								styles.partInfoCard,
								pressed && { backgroundColor: '#fadb7d' },
							]}
							onPress={() => router.push({
								pathname: "partDetail",
								params: { data: JSON.stringify(item) }
							})}
						>
							<View style={styles.partInfoBox}>
								<Text style={styles.partName}>{item.part_name}</Text>

								<View style={styles.makeRow}>
									<FontAwesome name="gears" size={12} color="#000" style={styles.icon} />
									<Text style={styles.partInfo}>Type : {item.part_type}</Text>
								</View>

								<View style={styles.makeRow}>
									<Entypo name="location-pin" size={12} color="#000" style={styles.icon} />
									<Text style={styles.partInfo}>Location : {item?.location?.location_name || ""}</Text>
								</View>

								<View style={styles.makeRow}>
									<FontAwesome name="cubes" size={12} color="#000" style={styles.icon} />
									<Text style={styles.partInfo}>Quantity : {item.quantity}</Text>
								</View>
							</View>






							<Popover
								popoverStyle={{ borderRadius: 15 }}
								isVisible={openPopoverId === item.id}
								onRequestClose={() => setOpenPopoverId(null)}
								from={(
									<TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(item.id)}>
										<Ionicons name="ellipsis-vertical" size={18} color="#201F23CC" />
									</TouchableOpacity>
								)}
							>
								<View style={styles.popoverContent}>
									{
										[
											{ icon: '', text: 'Select Option', type: 'heading' },
											{ icon: '', text: 'Edit', type: 'option' },
											{ icon: '', text: 'Delete', type: 'option' }
										].map((option, index) => {
											return (
												<Pressable
													style={styles.popoverItem}
													key={index}
													onPress={async () => {
														if (index === 1) {
															router.push({
																pathname: '/createPart',
																params: { data: JSON.stringify(item) }
															})
														} else if (index === 2) {
															console.log('in it delete = ', item);
															handleDeletePart?.(item);
														}
														setOpenPopoverId(null)
													}}
												>
													<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
														{option?.icon != '' && <Ionicons name={option?.icon as any} size={16} color="#71717A" />}

														<Text style={
															[
																{ color: "#71717A", fontFamily: Fonts.regular },
																option?.type == 'heading' ? { color: "#742BDE", fontFamily: Fonts.semiBold } : {}
															]
														}>
															{option.text}
														</Text>
													</View>
												</Pressable>
											);
										})
									}
								</View>
							</Popover>


						</Pressable>
					)}
					contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
					refreshing={refreshing}
					onRefresh={handleRefresh}
				/>
			</View>

			<CreateFAB label="Create Part" onPress={() => router.push("/createPart")} />

			<LocationPickerModal
				visible={locationModalVisible}
				onClose={() => setLocationModalVisible(false)}
				comingFrom="partsInventory"
				onSelectLocation={(item) => {
					setSelectedLocation(item);
					fetchParts(item?.id || item?._id);
					setLocationModalVisible(false);
				}}
			/>

		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		backgroundColor: "#F5F7FA"
	},
	filterRow: {
		marginHorizontal: 20,
		marginBottom: 10,
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.60)",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	filterLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	filterText: {
		fontSize: 11,
		fontFamily: Fonts.regular,
		color: "#201F23CC",
	},
	partInfoCard: {
		backgroundColor: "rgba(255, 255, 255, 0.90)",
		borderRadius: 8,
		paddingHorizontal: 20,
		paddingVertical: 10,
		marginHorizontal: 20,
		borderWidth: 0.6,
		borderColor: "rgba(225, 232, 238, 0.40)",
		shadowColor: "#d3d3d3",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 3,
		elevation: 2,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	makeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	partInfoBox: {
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
	partName: {
		fontSize: 10,
		fontFamily: Fonts.semiBold
	},
	icon: {
		width: 22
	},
	partInfo: {
		fontSize: 10,
		fontFamily: Fonts.regular
	},
	popoverContent: {
		borderRadius: 20,
		backgroundColor: "#fff",
		padding: 10,
	},
	popoverItem: {
		width: 150,
		padding: 10,
	},
})

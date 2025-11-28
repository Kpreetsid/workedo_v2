import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Location } from '@/src/types/location';
import { useRouter } from 'expo-router';
import Fonts from '@/constants/Typography';
import { useWorkOrderStore } from '@/src/store/useWorkOrderStore';
import { useWorkRequestStore } from '@/src/store/useWorkRequestStore';
import { usePartFormStore } from '@/src/store/usePartFormStore';
import { usePreventiveStore } from '@/src/store/usePreventiveStore';
import { Ionicons } from '@expo/vector-icons';
import Popover, { PopoverMode, Rect } from 'react-native-popover-view';

interface LocationCardInterface {
	item: Location;
	isChild?: boolean;
	level?: number;
	selection?: boolean;
	comingFrom?: string;
	handleDeleteLocation?: (location: Location) => void;
}

const width = Dimensions.get("window").width;
const LocationCard = ({ item, isChild = false, level = 0, selection, comingFrom, handleDeleteLocation }: LocationCardInterface) => {

	const router = useRouter();
	const [selectedLocation, setSelectedLocation] = useState<Location>();
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
	const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

	const isExpanded = expandedAssetId === item.id;
	const hasChildren = item.childs && item.childs.length > 0;


	const { setWorkForm } = useWorkOrderStore();
	const { setWorkRequestForm } = useWorkRequestStore();
	const { setPartFormValue } = usePartFormStore();
	const { setPreventiveValue } = usePreventiveStore();

	return (
		<>
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
					},
					{ marginBottom: 10 }
				]
			}
				onPress={() => {
					if (selection) {
						setSelectedLocation(item);
						// updating selected location in zustand store while creating part
						console.log('in selection = ', comingFrom)
						if (comingFrom === "newWorkOrder") {
							setWorkForm("location", item);
							setWorkForm("selected_asset", item);
							setWorkForm("assigned_users", []);
						} else if (comingFrom === "newWorkRequest") {
							setWorkRequestForm("location", item);
							setWorkRequestForm("selected_asset", item);
						} else if (comingFrom === "createPart") {
							setPartFormValue("location", item);
						} else if(comingFrom === "createPreventive") {
							setPreventiveValue("location", item);
							setPreventiveValue("selected_asset", null);
							setPreventiveValue("assigned_users", []);
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
					<View style={[
						styles.textRow,
						{
							marginLeft: level * 20
						}
					]}>
						{hasChildren && (
							<Pressable
								onPress={() => {
									console.log('expanding')
									setExpandedAssetId(isExpanded ? null : item.id);
								}}
							>
								<Ionicons
									name={isExpanded ? "chevron-down" : "chevron-forward"}
									size={14}
									color="black"
									style={hasChildren ? { display: 'flex' } : (isChild ? { display: 'none' } : { display: 'flex' })}
								/>
							</Pressable>
						)}

						<Text style={styles.locationText}>{item.location_name}</Text>
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
								{ icon: 'add', text: 'Add' },
								{ icon: 'pencil', text: 'Edit' },
								{ icon: 'copy', text: 'Copy' },
								{ icon: 'trash', text: 'Delete' }
							].map((option, index) => {
								return (
									<Pressable
										style={styles.popoverItem}
										key={index}
										onPress={async () => {
											if (index === 0) {
												router.push({
													pathname: "/createLocation",
													params: {
														location_data: JSON.stringify(item),
														mode: 'child',
														isEdit: 'false'
													},
												});
											} else if (index === 1) {
												router.push({
													pathname: "/createLocation",
													params: {
														location_data: JSON.stringify(item),
														isEdit: 'true'
													},
												});
											} else if (index === 3) {
												handleDeleteLocation?.(item)
											}
											setOpenPopoverId(null)
										}}
									>
										<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
											<Ionicons name={option.icon as any} size={16} color="#71717A" />

											<Text style={{ color: "#71717A", fontFamily: Fonts.regular }}>
												{option.text}
											</Text>

											{/* {
											(deleteLoading && index === 3) && <ActivityIndicator size={"small"} color={"#71717A"} />
										} */}
										</View>
									</Pressable>
								);
							})
						}
					</View>
				</Popover>
			</Pressable>


			{/* RECURSIVE CHILDREN */}
			{
				isExpanded && hasChildren && (
					<View>
						{item?.childs?.map(child => (
							<LocationCard
								key={child.id}
								item={child}
								isChild={true}
								level={level + 1}
								selection={selection}
								comingFrom={comingFrom}
								handleDeleteLocation={() => handleDeleteLocation?.(child)}
							/>
						))}
					</View>
				)
			}
		</>
	)
}

export default LocationCard

const styles = StyleSheet.create({

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
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		lineHeight: 20
	},
	actionButton: {
		position: "absolute",
		width: width - 50,
		bottom: 0,
		alignSelf: "center",
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
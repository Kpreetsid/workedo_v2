import Header from "@/components/global/Header";
import { router, useFocusEffect } from "expo-router";
import CreateFAB from "@/components/global/CreateFAB";
import SearchBar from "@/components/global/SearchBar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import Fonts from "@/constants/Typography";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { deletePreventive, getPreventives } from "@/src/services/preventive.service";
import { Preventive } from "@/src/types/preventive";
import Popover from "react-native-popover-view";

const mockData = Array.from({ length: 10 }, (_, i) => ({
	id: `${i + 1}`,
	title: `Weekly Preventive Test ${i + 1}`,
	assignedTo: i % 2 === 0 ? "Parwez" : "John Doe",
	location: i % 3 === 0 ? "New Delhi" : "Mumbai",
	status: i % 2 === 0 ? "Active" : "Inactive",
}));

export default function PreventivePage() {
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [preventives, setPreventives] = useState<any[]>([]);
	const [loading, setLoading] = useState(false)

	useFocusEffect(
		useCallback(() => {
			fetchPreventives();
		}, [])
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchPreventives();
		setRefreshing(false);
	};

	const fetchPreventives = async () => {
		setLoading(true)
		try {
			const resp = await getPreventives()
			console.log('resp = ', resp);
			if (resp.status) {
				setPreventives(resp?.data);
				setLoading(false)
			}
		} catch (error) {
			setLoading(false)
			console.log('error = ', error);
		}
	}

	const handleDeletePreventive = async (item: Preventive) => {
		console.log('deleting preventive = ', item);
		// setDeleteLoading(true)
		try {
			const resp = await deletePreventive(item?.id);
			console.log('resp = ', resp);
			if (resp?.status) {
				ToastAndroid.show("Preventive Deleted", ToastAndroid.SHORT);
				fetchPreventives();
				// setDeleteLoading(false)
			}
		} catch (e) {
			// setDeleteLoading(false)
			console.log('error deleting = ', e);
		}
	}

	return (
		<>
			<Header title="Preventive Maintenance" />
			<View style={styles.container}>
				<SearchBar value={searchQuery} onChangeText={setSearchQuery} />

				{
					loading ?
						<ActivityIndicator size={"large"} />
						:
						<FlatList
							data={preventives}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => {
								return (
									<Pressable style={styles.preventiveItem} onPress={() =>
										router.push({ pathname: "/preventiveDetail", params: { data: JSON.stringify(item) } })}>
										<View style={styles.leftContentBox}>
											<View style={styles.makeRow}>
												<Text style={styles.itemTitle}>{item?.title}</Text>
												<View style={styles.noneTag}>
													<Text style={styles.noneTagText}>#{item?.work_order?.priority}</Text>
												</View>
											</View>
											<View style={styles.subInfoRow}>
												<MaterialIcons name="groups" size={12} color="black" />
												<Text style={styles.subText}>Assigned to : {item?.createdBy?.firstName + " " + item?.createdBy?.lastName || ""}</Text>
											</View>

											<View style={styles.makeRow}>
												<View style={styles.subInfoRow}>
													<MaterialIcons name="location-on" size={12} color="black" />
													<Text style={styles.subText}>Location : {item.work_order?.location?.location_name || ""}</Text>
												</View>
												<View style={[styles.activeTag, !item?.schedule?.enabled && { backgroundColor: "red" }]}>
													<Text style={styles.activeTagText}>{item?.schedule?.enabled ? "Active" : "In Active"}</Text>
												</View>
											</View>
										</View>

										<View style={styles.rightIconBox}>
											<Popover
												popoverStyle={{ borderRadius: 15 }}
												isVisible={openPopoverId === item.id}
												onRequestClose={() => setOpenPopoverId(null)}
												from={(
													<TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(item.id)}>
														<Ionicons name="ellipsis-vertical" size={18} color="#201F23CC" />
													</TouchableOpacity>
												)}>
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
																				pathname: '/createPreventive',
																				params: { data: JSON.stringify(item) }
																			})
																		} else if (index === 2) {
																			console.log('in it delete = ', item);
																			handleDeletePreventive?.(item);
																		}
																		setOpenPopoverId(null)
																	}}
																>
																	<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
																		{option.icon != '' && <Ionicons name={option.icon as any} size={16} color="#71717A" />}

																		<Text style={
																			[
																				{ color: "#71717A", fontFamily: Fonts.regular },
																				option.type == 'heading' ? { color: "#742BDE", fontFamily: Fonts.semiBold } : {}
																			]
																		}>
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
										</View>
									</Pressable>
								);
							}}
							contentContainerStyle={{ paddingBottom: 100, gap: 10 }}
							showsVerticalScrollIndicator={false}
							refreshing={refreshing}
							onRefresh={handleRefresh}
						/>

				}


			</View>
			<CreateFAB label="Create Preventive" onPress={() => router.push("/createPreventive")} style={styles.createBtn} />

		</>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 20,
		backgroundColor: "#F5F7FA",
		flex: 1,
	},
	preventiveItem: {
		flexDirection: 'row',
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 4,
		marginHorizontal: 20,
		gap: 5
	},
	makeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	itemTitle: {
		fontSize: 10,
		fontFamily: Fonts.semiBold
	},
	noneTag: {
		backgroundColor: "#99999920",
		paddingVertical: 3,
		paddingHorizontal: 7,
		borderRadius: 2,
		alignItems: "center",
		justifyContent: "center"
	},
	noneTagText: {
		fontFamily: Fonts.regular,
		fontSize: 9
	},
	subInfoRow: {
		flexDirection: "row",
		gap: 5
	},
	subText: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		lineHeight: 12
	},
	activeTag: {
		backgroundColor: "#00B227",
		paddingVertical: 3,
		paddingHorizontal: 7,
		borderRadius: 2,
		alignItems: "center",
		justifyContent: "center"
	},
	activeTagText: {
		fontFamily: Fonts.regular,
		fontSize: 9,
		color: "#fff"
	},
	createBtn: {
		// width: 190
	},
	leftContentBox: {
		width: '90%',
	},
	rightIconBox: {
		width: '10%',
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
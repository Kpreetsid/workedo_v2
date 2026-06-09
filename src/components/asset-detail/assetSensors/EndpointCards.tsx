import { Pressable, ScrollView, Text, TouchableOpacity, View, StyleSheet, RefreshControl, ToastAndroid } from "react-native";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { useAssetStore } from "@/src/state/assets/useAssetStore";
import { useCallback, useEffect, useState } from "react";
import { Asset } from "@/src/types/asset";
import { deleteEndpoint, getAllEndpoints, getSensorConfig } from "@/src/services/asset.service";
import Popover from "react-native-popover-view";
import { useFocusEffect, useRouter } from "expo-router";
import Fonts from "@/constants/Typography";
import AttachSensor from "./AttachSensor";
import { useGlobal } from "@/hooks/useGlobal";

interface Props {
	asset_data: Asset;
}

export default function EndpointCards({ asset_data }: Props) {
	const { mapAPItoConfigData } = useGlobal();
	const endpoints = useAssetStore<AssetEndpoint[]>((state) => state.endpoints);
	const { setDeviceInfo } = useAssetStore((state) => state);
	const setEndpoints = useAssetStore((state) => state.setEndpoints);
	const selectedSensor = useAssetStore((state) => state.selectedSensor);
	const setSelectedSensor = useAssetStore((state) => state.setSelectedSensor);
	const setSelectedEndpointToEdit = useAssetStore((state) => state.setSelectedEndpointToEdit);
	const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

	const [showAttachSensor, setShowAttachSensor] = useState<{ state: boolean, data: AssetEndpoint | null, action: string }>
		(
			{
				state: false,
				data: null,
				action: ""
			}
		);

	const router = useRouter();

	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		console.log('selcted sensor = ', endpoints, selectedSensor)
		if (!selectedSensor && endpoints.length > 0) {
			setSelectedSensor(endpoints[0]);
		}
	}, [endpoints]);

	// ✅ Pull-to-refresh logic
	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await fetchEndpoints(); // this should re-fetch from API and update store
		} catch (error) {
			console.error("Error refreshing endpoints:", error);
		} finally {
			setRefreshing(false);
		}
	};

	const handleSelect = (ep: AssetEndpoint) => {
		setSelectedSensor(ep);
	};

	useFocusEffect(useCallback(() => {
		console.log('in endpoints cards')
		fetchEndpoints()
	}, []))

	const fetchEndpoints = async (type?: string) => {
		console.log('fetching endpoints');
		try {
			console.log('asset_data = ', asset_data);

			let payload: string[] = [asset_data?.id];
			console.log('payload for endpoints = ', payload);
			const endpointsRes = await getAllEndpoints(payload);
			console.log('res endpoints = ', endpointsRes);

			if (endpointsRes?.data?.length > 0) {
				setEndpoints(endpointsRes.data);
				setSelectedSensor(endpointsRes.data[0]);
				if (type === 'afterDelete') {
					setSelectedSensor(endpointsRes.data[endpointsRes.data.length - 1]);
				}
			} else {
				setEndpoints([]);
				setSelectedSensor(null);
			}
		} catch (err) {
			console.error("Error fetching endpoints:", err);
		}
	}

	async function handleAttachSensor(ep: AssetEndpoint) {
		console.log('attach sensor');
		setSelectedSensor(ep);
		setShowAttachSensor({ state: true, data: { ...ep }, action: "open" });
	}

	const fetchSensorData = async (ep: any) => {
		console.log('sadfdsf', ep)
		setSelectedSensor(ep)
		const payload = {
			composite_key: ep?.composite_id,
			mount_id: ep?.id,
		}

		const res = await getSensorConfig(payload);
		console.log('sensor config = ', res);

		const mapped = mapAPItoConfigData(res?.config);
		console.log('mapped data = ', mapped);
		ep.deviceInfo = mapped;
		setDeviceInfo(mapped)
		setShowAttachSensor((prev) => (
			prev.state
				? { ...prev, data: { ...ep, deviceInfo: mapped } }
				: prev
		));
		return ep;
	}

	useEffect(() => {
		if (selectedSensor) {
			fetchSensorData(selectedSensor);
		}
	}, [selectedSensor])

	useEffect(() => {
		console.log('action. = ', showAttachSensor.action)
		if (showAttachSensor.action === "close") {
			fetchEndpoints();
		}
	}, [showAttachSensor])

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.cardsRow}
			nestedScrollEnabled
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor="#5552FE"
					colors={["#5552FE"]}
				/>
			}
		>
			{endpoints.map((ep) => {
				console.log('ep e p= ', ep)
				const isSelected = selectedSensor?.id === ep.id;
				return (
					<Pressable key={ep.id} onPress={() => handleSelect(ep)}>
						<View
							style={[
								styles.card,
								isSelected && {
									borderColor: "#5552FE",
									borderWidth: 2,
									shadowColor: "#5552FE",
									shadowOpacity: 0.3,
								},
							]}
						>
							<View style={styles.cardHeader}>
								<Text style={styles.cardMac}>
									{ep.mac_id
										? ep.mac_id.split("_").slice(1).join("_") || "No Sensor Mapped"
										: "No Sensor Mapped"}
								</Text>
								<Popover
									isVisible={openPopoverId === Number(ep.id)}
									onRequestClose={() => setOpenPopoverId(null)}
									from={(
										<TouchableOpacity style={{ padding: 6 }} onPress={() => setOpenPopoverId(Number(ep.id))}>
											<Fontisto name="more-v-a" size={15} color="#201F23" />
										</TouchableOpacity>
									)}>
									<View style={styles.popoverContent}>
										{
											["Edit Endpoint", "Delete Endpoint"].map((item, index) => {
												return (
													<Pressable
														style={styles.popoverItem}
														key={index}
														onPress={async () => {
															setOpenPopoverId(null);

															if (index === 1) {
																const re = await deleteEndpoint(ep?.id?.toString() || "")
																console.log('re = ', re);
																if (re?.message === "End Point deleted successfully.") {
																	ToastAndroid.show("Endpoint deleted successfully", ToastAndroid.SHORT);
																	fetchEndpoints('afterDelete');
																}
															}

															if (index === 0) {
																setSelectedEndpointToEdit(ep);
																// Small timeout helps ensure popover unmounts smoothly before navigation
																setTimeout(() => {
																	router.push("/createNewEndPoint");
																}, 150);
															}
														}}
													>
														<Text>{item}</Text>
													</Pressable>
												);
											})
										}
									</View>
								</Popover>
							</View>

							<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
								<View style={styles.kindRow}>
									<View
										style={[
											styles.kindDot,
											ep.online === "True" ? styles.greenDot : styles.redDot,
										]}
									/>
									<Text style={styles.kindText}>
										{ep.online === "True" ? "Online" : "Offline"}
									</Text>
								</View>

								<View style={styles.kindRow}>
									<Text style={styles.kindText}>
										{

											ep.mac_id &&
											(
												ep.mac_id && ep.mac_id.startsWith('wl_') ?
													"Wireless"
													:
													(
														ep.mac_id.startsWith('w_')
															?
															"Wired"
															:
															"Bluetooth"
													)
											)
										}
									</Text>
								</View>

							</View>

							<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
								<View>
									<Text style={styles.cardTitle}>End Point</Text>
									<Text style={styles.cardSub}>{ep.point_name || ""} - {ep.mount_location}</Text>
								</View>

								<View style={{ width: 1, backgroundColor: "#5552FE30", height: "70%" }} />

								<View>
									<Text style={styles.cardTitle}>Mount Direction</Text>
									<Text style={styles.cardSub}>{ep.mount_direction}</Text>
								</View>
							</View>

							<View style={styles.cardFooter}>
								{/* <TouchableOpacity
									style={styles.iconBtn}
									onPress={() => console.log("Settings pressed")}
								>
									<MaterialCommunityIcons name="cog-outline" size={13} color="#fff" />
								</TouchableOpacity> */}
								<TouchableOpacity
									style={styles.iconBtn}
									onPress={() => handleAttachSensor(ep)}
								>
									<Ionicons name="radio" size={13} color="#fff" />
								</TouchableOpacity>
							</View>
						</View>
					</Pressable>
				);
			})}

			<AttachSensor showAttachSensor={showAttachSensor} setShowAttachSensor={setShowAttachSensor} />
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	cardsRow: {
		alignItems: "flex-start",
		padding: 16,
		gap: 12
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		padding: 12,
		shadowColor: "#742BDE",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
		borderWidth: 0.3,
		borderColor: "#742BDE"
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	cardMac: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		borderWidth: 0.3,
		borderColor: "#002143",
		borderRadius: 2,
		padding: 4,
		textTransform: 'capitalize'
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
	cardMenu: {
		padding: 6,
	},
	kindRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 6,
	},
	kindDot: {
		width: 8,
		height: 8,
		borderRadius: 8,
		marginRight: 8,
	},
	greenDot: {
		backgroundColor: "#32CD32",
	},
	redDot: {
		backgroundColor: "#FF3B30",
	},
	kindText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	cardTitle: {
		fontSize: 10,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	cardSub: {
		fontSize: 11,
		fontFamily: Fonts.light,
		color: "#6B7888",
		textTransform: 'capitalize'
	},
	cardFooter: {
		marginTop: 2,
		flexDirection: "row",
		justifyContent: "space-between"
	},
	iconBtn: {
		width: 22,
		height: 22,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#E7DFFF",
		backgroundColor: "#5552FE",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 8,
	},
})

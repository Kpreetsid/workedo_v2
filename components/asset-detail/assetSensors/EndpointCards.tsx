import { Alert, Pressable, ScrollView, Text, TouchableOpacity, View, StyleSheet, RefreshControl, ToastAndroid } from "react-native";
import { Fontisto, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AssetEndpoint } from "@/src/types/assetEndpoint";
import { useAssetStore } from "@/src/store/useAssetStore";
import { useCallback, useEffect, useState } from "react";
import { Asset } from "@/src/types/asset";
import { deleteEndpoint, fetchAssetChildren, getAllEndpoints, getEnergyConfig, getSensorConfig } from "@/src/services/asset.service";
import Popover from "react-native-popover-view";
import { useFocusEffect, useRouter } from "expo-router";
import Fonts from "@/constants/Typography";
import AttachSensor from "./AttachSensor";
import { SvgXml } from "react-native-svg";

interface Props {
	asset_data: Asset;
}

const linkedIconXml = `<svg width="26" height="48" viewBox="0 0 26 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 1H11C5.47715 1 1 5.47715 1 11V31C1 36.5228 5.47715 41 11 41H15C20.5228 41 25 36.5228 25 31V11C25 5.47715 20.5228 1 15 1Z" stroke="#32CD32" stroke-width="2"/><path d="M13 9V33" stroke="#32CD32" stroke-width="2" stroke-linecap="round"/><path d="M20 41H6C4.34315 41 3 42.3431 3 44C3 45.6569 4.34315 47 6 47H20C21.6569 47 23 45.6569 23 44C23 42.3431 21.6569 41 20 41Z" stroke="#32CD32" stroke-width="2"/></svg>`;
const unlinkedIconXml = `<svg width="26" height="49" viewBox="0 0 26 49" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.1719 12L4.8318 29.5784" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round"/><path d="M15 1H11C5.47715 1 1 5.47715 1 11V31C1 36.5228 5.47715 41 11 41H15C20.5228 41 25 36.5228 25 31V11C25 5.47715 20.5228 1 15 1Z" stroke="#9A9A9A" stroke-width="2"/><path d="M13 7V17" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round"/><path d="M13 25V33" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round"/><path d="M20 42H6C4.34315 42 3 43.3431 3 45C3 46.6569 4.34315 48 6 48H20C21.6569 48 23 46.6569 23 45C23 43.3431 21.6569 42 20 42Z" stroke="#9A9A9A" stroke-width="2"/></svg>`;

const getDeviceType = (endpoint: AssetEndpoint) => {
	if (!endpoint?.mac_id) return "-";
	const prefix = endpoint?.composite_id?.split("_")[0];

	switch (prefix) {
		case "e":
			return "energy";
		case "c":
			return "current";
		case "ble":
			return "Bluetooth";
		case "wl":
			return "Wireless";
		case "w":
			return "Wired";
		case "p":
			return "Portable";
		default:
			return "Unknown";
	}
};

const getSensorLinkState = (endpoint: AssetEndpoint) => {
	if (typeof endpoint?.is_linked === "boolean") {
		return endpoint.is_linked;
	}

	return Boolean(endpoint?.mac_id);
};

const getSensorStatusTone = (online?: string) => {
	if (online === "True") {
		return { label: "Online", color: "#22C55E" };
	}

	if (online === "False") {
		return { label: "Offline", color: "#EF4444" };
	}

	return { label: "Status N/A", color: "#94A3B8" };
};

export default function EndpointCards({ asset_data }: Props) {
	const endpoints = useAssetStore<AssetEndpoint[]>((state) => state.endpoints);
	const setDeviceInfo = useAssetStore((state) => state.setDeviceInfo);
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

	const confirmDeleteEndpoint = (ep: AssetEndpoint) => {
		Alert.alert(
			"Delete EndPoint",
			`Are you sure you want to delete ${ep?.point_name || "this endpoint"}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							const re = await deleteEndpoint(ep?.id?.toString() || "");
							if (re?.message === "End Point deleted successfully.") {
								ToastAndroid.show("Endpoint deleted successfully", ToastAndroid.SHORT);
								fetchEndpoints("afterDelete");
							}
						} catch (error) {
							console.log("error deleting endpoint = ", error);
						}
					},
				},
			],
			{ cancelable: true }
		);
	};

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
			const childAssetsRes = await fetchAssetChildren(asset_data?.id);
			const childAssets = Array.isArray(childAssetsRes?.data) ? childAssetsRes.data : [];
			const relatedAssets = [asset_data, ...childAssets].filter(Boolean);
			const payload = Array.from(
				new Set(
					relatedAssets
						.map((asset: any) => asset?.id)
						.filter(Boolean)
				)
			);
			const endpointsRes = await getAllEndpoints(payload);
			const endpointData = Array.isArray(endpointsRes?.data) ? endpointsRes.data : [];
			const currentData = Array.isArray(endpointsRes?.current) ? endpointsRes.current : [];
			const energyData = Array.isArray(endpointsRes?.Energy) ? endpointsRes.Energy : Array.isArray(endpointsRes?.energy) ? endpointsRes.energy : [];
			const allEndpoints = [...endpointData, ...currentData, ...energyData];

			if (allEndpoints.length > 0) {
				const enrichedEndpoints = allEndpoints.map((endpoint: AssetEndpoint) => {
					const matchingAsset = relatedAssets.find((asset: any) => String(asset?.id) === String(endpoint?.asset_id));
					return {
						...endpoint,
						asset_name: endpoint?.asset_name || matchingAsset?.asset_name || asset_data?.asset_name || "-",
					};
				});

				setEndpoints(enrichedEndpoints);

				if (type === 'afterDelete') {
					setSelectedSensor(enrichedEndpoints[enrichedEndpoints.length - 1]);
				} else if (selectedSensor?.id) {
					const existingSelected = enrichedEndpoints.find((endpoint: AssetEndpoint) => String(endpoint?.id) === String(selectedSensor?.id));
					setSelectedSensor(existingSelected || enrichedEndpoints[0]);
				} else {
					setSelectedSensor(enrichedEndpoints[0]);
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
		setSelectedSensor(ep);
		const deviceType = getDeviceType(ep);

		if (deviceType === "current") {
			const currentPayload = { viewType: "current", config: null, endpoint: ep };
			setDeviceInfo(currentPayload);
			setShowAttachSensor((prev) => (prev.state ? { ...prev, data: { ...ep, deviceInfo: currentPayload } } : prev));
			return ep;
		}

		const payload = {
			composite_key: ep?.composite_id,
			mount_id: ep?.id,
		};

		try {
			const res =
				deviceType === "energy"
					? await getEnergyConfig(payload)
					: await getSensorConfig(payload);
			const configPayload = {
				viewType: deviceType === "energy" ? "energy" : "vibration",
				config: res?.config || null,
				endpoint: ep,
			};

			ep.deviceInfo = configPayload;
			setDeviceInfo(configPayload);
			setShowAttachSensor((prev) => (
				prev.state ? { ...prev, data: { ...ep, deviceInfo: configPayload } } : prev
			));
			return ep;
		} catch (error) {
			const fallbackPayload = {
				viewType: deviceType === "energy" ? "energy" : "vibration",
				config: null,
				endpoint: ep,
			};
			setDeviceInfo(fallbackPayload);
			return ep;
		}
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
				const isSelected = selectedSensor?.id === ep.id;
				const isLinked = getSensorLinkState(ep);
				const statusTone = getSensorStatusTone(ep.online);
				const deviceType = getDeviceType(ep);
				const sensorLabel = ep.mac_id
					? (ep.mac_id.includes("_") ? ep.mac_id.split("_").slice(1).join("_") : ep.mac_id)
					: "No Sensor Mapped";
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
								<View style={styles.headerLeft}>
									<SvgXml xml={isLinked ? linkedIconXml : unlinkedIconXml} width={14} height={28} />
									<Text style={styles.cardMac} numberOfLines={1}>
										{sensorLabel}
									</Text>
								</View>

								<View style={styles.headerRight}>
									<View style={styles.connectionTypeWrap}>
										<View style={[styles.kindDot, { backgroundColor: statusTone.color }]} />
										<Text style={styles.kindText}>{deviceType}</Text>
									</View>

									<Popover
										isVisible={openPopoverId === Number(ep.id)}
										onRequestClose={() => setOpenPopoverId(null)}
										from={(
											<TouchableOpacity style={styles.menuTrigger} onPress={() => setOpenPopoverId(Number(ep.id))}>
												<Fontisto name="more-v-a" size={16} color="#201F23" />
											</TouchableOpacity>
										)}>
										<View style={styles.popoverContent}>
										<Pressable
												style={styles.popoverItem}
												onPress={() => {
													setOpenPopoverId(null);
													setSelectedEndpointToEdit(ep);
													setTimeout(() => {
														router.push("/createNewEndPoint");
													}, 150);
												}}
											>
												<View style={styles.popoverIconWrap}>
													<MaterialCommunityIcons name="pencil" size={17} color="#5552FE" />
												</View>
												<Text style={styles.popoverText}>Edit endpoint</Text>
											</Pressable>

											<Pressable
												style={styles.popoverItem}
												onPress={() => {
													setOpenPopoverId(null);
													handleAttachSensor(ep);
												}}
												disabled={deviceType === "current" || deviceType === "energy"}
											>
												<View style={styles.popoverIconWrap}>
													<Ionicons
														name="radio-outline"
														size={17}
														color={deviceType === "current" || deviceType === "energy" ? "#94A3B8" : "#5552FE"}
													/>
												</View>
												<Text
													style={[
														styles.popoverText,
														(deviceType === "current" || deviceType === "energy") && styles.popoverTextDisabled,
													]}
												>
													Attach sensor
												</Text>
											</Pressable>

											<Pressable
												style={styles.popoverItem}
												onPress={() => {
													setOpenPopoverId(null);
													handleSelect(ep);
													ToastAndroid.show("Configuration details are shown below.", ToastAndroid.SHORT);
												}}
												disabled={!ep?.mac_id || deviceType === "current"}
											>
												<View style={styles.popoverIconWrap}>
													<MaterialCommunityIcons
														name="cog-outline"
														size={17}
														color={ep?.mac_id && deviceType !== "current" ? "#5552FE" : "#94A3B8"}
													/>
												</View>
												<Text
													style={[
														styles.popoverText,
														(!ep?.mac_id || deviceType === "current") && styles.popoverTextDisabled,
													]}
												>
													Update configuration
												</Text>
											</Pressable>

											<Pressable
												style={styles.popoverItem}
												onPress={() => {
													setOpenPopoverId(null);
													confirmDeleteEndpoint(ep);
												}}
											>
												<View style={styles.popoverIconWrap}>
													<MaterialCommunityIcons name="delete-outline" size={17} color="#DC2626" />
												</View>
												<Text style={[styles.popoverText, styles.popoverTextDanger]}>Delete endpoint</Text>
											</Pressable>
										</View>
									</Popover>
								</View>
							</View>

							<View style={styles.endpointInfoRow}>
								<View style={styles.infoBlock}>
									<Text style={styles.cardTitle}>End Point</Text>
									<Text style={styles.cardSub} numberOfLines={2}>
										{ep.point_name || "-"}{ep.mount_location ? ` - ${ep.mount_location}` : ""}
									</Text>
								</View>

								<View style={styles.infoBlock}>
									<Text style={styles.cardTitle}>Asset Name</Text>
									<Text style={styles.cardSub} numberOfLines={2}>
										{ep.asset_name || asset_data?.asset_name || "-"}
									</Text>
								</View>
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
		borderRadius: 14,
		padding: 12,
		width: 314,
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
		gap: 10,
	},
	headerLeft: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	headerRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	cardMac: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		borderWidth: 0.3,
		borderColor: "#C7D2FE",
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 6,
		textTransform: 'capitalize',
		flexShrink: 1,
	},
	popoverContent: {
		borderRadius: 14,
		backgroundColor: "#fff",
		paddingVertical: 6,
		minWidth: 198,
		maxWidth: 220,
		shadowColor: "#0F172A",
		shadowOpacity: 0.14,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 6,
		borderWidth: 1,
		borderColor: "#EEF2F7",
	},
	popoverItem: {
		paddingHorizontal: 12,
		paddingVertical: 11,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		minHeight: 46,
	},
	popoverIconWrap: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F8F4FF",
	},
	popoverText: {
		flex: 1,
		fontSize: 14,
		fontFamily: Fonts.medium,
		color: "#201F23",
		flexShrink: 1,
	},
	popoverTextDisabled: {
		color: "#94A3B8",
	},
	popoverTextDanger: {
		color: "#DC2626",
	},
	menuTrigger: {
		padding: 6,
	},
	connectionTypeWrap: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	kindDot: {
		width: 10,
		height: 10,
		borderRadius: 10,
	},
	kindText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		fontStyle: "italic",
	},
	endpointInfoRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 14,
		marginTop: 10,
	},
	infoBlock: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 4,
	},
	cardSub: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#6B7888",
		textTransform: 'capitalize'
	},
})

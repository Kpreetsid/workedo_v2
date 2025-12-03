import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View, } from "react-native";
import Header from "@/components/global/Header";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useState } from "react";
import { assetsHealthLocation, singleLocationData, topLevelAssets } from "@/src/services/location.service";
import { useLocationStore } from "@/src/store/useLocationStore";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import moment from "moment";
import { AssetHealth } from "@/src/types/assetHealth";
import apiClient from "@/src/api/apiClient";
import { Image } from 'expo-image';
import { LocationAsset } from "@/src/types/locationAsset";
import { endpoints } from "@/src/api/endpoints";
import { Ionicons } from "@expo/vector-icons";
import { Location } from "@/src/types/location";

const blurhash =
	'|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function LocationDetail() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	const location = JSON.parse(params?.data);
	console.log('location = ', location);
	const { user } = useAuthStore();
	const [assets, setAssets] = useState<LocationAsset[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [locationData, setLocationData] = useState<Location | null>(null);

	useFocusEffect(
		useCallback(() => {
			fetchSingleLocation();
			fetchTopLevelAssets()
		}, [])
	);

	const fetchSingleLocation = async () => {
		try {
			const res = await singleLocationData(location?.id);
			console.log(res);
			if (res?.status) {
				setLocationData(res?.data[0]);
			}
		} catch (e) {
			console.log('error = ', e);
		}
	}

	const fetchTopLevelAssets = async () => {
		console.log('top level = ', location.id);
		setLoading(true)
		try {
			const res = await topLevelAssets(location.id);
			// console.log("res top level assets = ", res);
			if (res.status) {
				let assets: LocationAsset[] = res?.data;

				// fetching each asset health
				const obj: { org_id: string, asset_list: string[] } = {
					org_id: user?.account_id,
					asset_list: assets?.map((asset: LocationAsset) => asset.id),
				};

				console.log("obj = ", obj);
				const resp = await assetsHealthLocation(obj);
				console.log("resp = ", resp);
				if (resp?.data && assets?.length) {
					for (const asset of assets) {
						const match = resp.data.find((r: AssetHealth) => r.asset_id === asset.id);
						if (match) {
							asset.status = match.asset_status;
							if (match.last_data === 0) {
								asset.lastData = 'Not Collected Yet';
							} else {
								asset.lastData = moment.unix(match.last_data).format("YYYY-MM-DD HH:mm:ss");
							}
						}
					}
					console.log("final assets =", assets);
					setAssets(assets);
					setLoading(false)
				}
			}
		} catch (e: any) {
			if (!e.status) {
				ToastAndroid.show(e.message, ToastAndroid.SHORT);
				setAssets([]);
				setLoading(false)
			}
		}
	}

	const handleEdit = async () => {
		router.push({
			pathname: "/createLocation",
			params: {
				location_data: JSON.stringify(locationData),
				isEdit: 'true'
			},
		});
	}

	return (
		<>
			<Header title={locationData?.location_name ?? "Location Detail"} />
			<ScrollView contentContainerStyle={styles.container}>

				{/* Header card with image + info */}
				<View style={styles.headerCard}>
					<Image
						style={styles.image}
						source={{ uri: location?.image_path ? `${endpoints.baseURL}locations/${location?.image_path}` : 'https://new.presageinsights.ai/cmms/assets/images/company.jpg' }}
						placeholder={{ blurhash }}
						contentFit="cover"
						transition={1000}
					/>
					<View style={styles.infoSection}>
						<View style={{ flex: 1 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
								<Text style={styles.label}>Location ID</Text>
								<Pressable onPress={handleEdit} style={{ width: 25, height: 25, backgroundColor: '#fff', borderRadius: 200, justifyContent: 'center', alignItems: 'center' }}>
									<Ionicons name="pencil" size={14} color="#71717A" />
								</Pressable>
							</View>

							<TextInput style={styles.input} value={location.id} editable={false} />
						</View>

						<View style={styles.row}>
							<View style={styles.col}>
								<Text style={styles.label}>Location Type</Text>
								<TextInput style={styles.input} value={locationData?.location_type} editable={false} />
							</View>
							<View style={styles.col}>
								<Text style={styles.label}>Location</Text>
								<TextInput style={styles.input} value={locationData?.location_name} editable={false} />
							</View>
						</View>
					</View>
				</View>

				{
					assets === null && (
						<View style={styles.noDataContainer}>
							<ActivityIndicator size="large" color="#742BDE" />
						</View>
					)
				}

				{
					assets && assets.length === 0 && (
						<View style={styles.noDataContainer}>
							<Text style={styles.noDataText}>No Asset Health data found for selected location.</Text>
						</View>
					)
				}


				{assets && assets.map((asset, index) => (
					<Pressable key={index} style={[styles.assetCard, statusWrapper(asset.status)]} onPress={() => {
						router.push({
							pathname: "/assetDetail",
							params: { id: asset.id },
						});
					}}>
						<View style={[styles.column, { flex: 1 }]}>
							<Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Asset Name</Text>
							<Text style={styles.assetValue}>{asset.asset_name}</Text>
						</View>

						<View style={[styles.column, { flex: 1 }]}>
							<Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Asset Type</Text>
							<Text style={styles.assetValue}>{asset.asset_type}</Text>
						</View>

						<View style={[styles.column, { flex: 1 }]}>
							<Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Status</Text>
							<Text style={styles.assetValue}>{asset.status}</Text>
						</View>

						<View style={[styles.column, { flex: 1.6 }]}>
							<Text style={styles.assetLabel} numberOfLines={1} ellipsizeMode="tail">Last Data Collected</Text>
							<Text style={styles.assetValue}>{asset.lastData}</Text>
						</View>
					</Pressable>
				))}
			</ScrollView>
		</>
	);
}

function statusWrapper(status: LocationAsset["status"]) {
	switch (status) {
		case "Critical":
			return { backgroundColor: "#ff040010", borderColor: "#ff0400", borderWidth: 0.3 };
		case "Healthy":
			return { backgroundColor: "#00b22710", borderColor: "#00b227", borderWidth: 0.3 };
		case "Alert":
			return { backgroundColor: "#ffc10710", borderColor: "#ffc107", borderWidth: 0.3 };
		default:
			return null;
	}
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		paddingHorizontal: 18,
		paddingTop: 12,
		paddingBottom: 30,
		backgroundColor: '#F5F7FA'
	},
	headerCard: {
		backgroundColor: "#742BDE02",
		borderRadius: 12,
		padding: 5,
		marginBottom: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#34343450",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10
	},
	image: {
		width: 145,
		height: 77,
		borderRadius: 10
	},
	infoSection: {
		flex: 1,
		justifyContent: "center",
		marginRight: 5
	},
	label: {
		fontSize: 9,
		fontFamily: Fonts.extraLight,
		marginBottom: 2,
		color: "#000000",
	},
	input: {
		borderWidth: 0.4,
		borderColor: "#00000020",
		borderRadius: 4,
		padding: 1,
		paddingHorizontal: 5,
		marginBottom: 3,
		fontSize: 10,
		backgroundColor: "#FFFFFF",
		fontFamily: Fonts.light,
		flex: 1
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	col: {
		flex: 1,
		marginRight: 8,
	},

	/* Asset card */
	assetCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#000",
	},
	column: {
		minWidth: 0,
		alignItems: "center",
	},
	assetLabel: {
		fontFamily: Fonts.regular,
		fontSize: 10,
		color: "#000000",
		marginBottom: 4,
		textAlign: "center",
	},
	assetValue: {
		fontSize: 9,
		fontFamily: Fonts.light,
		color: "#111",
		textAlign: "center",
		lineHeight: 16,
		flexShrink: 1,
		flexWrap: "wrap",
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noDataText: {
		fontSize: 16,
		fontFamily: Fonts.bold,
		color: "#000069",
		textAlign: "center",
	},
});
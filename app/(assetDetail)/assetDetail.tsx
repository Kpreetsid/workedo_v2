import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Asset } from "@/src/types/asset";
import { Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { getAssetData } from "@/src/services/asset.service";
import Fonts from "@/constants/Typography";
import AssetInfoTab from "@/components/asset-detail/assetInfo/AssetInfoTab";
import AssetSensorsTab from "@/components/asset-detail/assetSensors/AssetSensorsTab";

export default function AssetDetailScreen() {
	const [activeTab, setActiveTab] = useState<"info" | "sensors">("info");
	const [refreshing, setRefreshing] = useState(false);

	const router = useRouter();
	const params: any = useLocalSearchParams();
	// const asset_data = JSON.parse(params?.data);

	const id = params?.id;
	const composite_id = params?.composite_id;

	const [assetData, setAssetData] = useState<Asset | null>(null);

	// useEffect(() => {
	// 	console.log('id = ', id);
	// 	fetchAssetData();
	// }, [id])

	useFocusEffect(
		useCallback(() => {
			fetchAssetData();
		}, [])
	)

	const fetchAssetData = async () => {
		// console.log('fetching asset details', id);
		try {
			const assetDataRes = await getAssetData(id);
			console.log('res asset data = ', assetDataRes);
			if (assetDataRes.status) {
				setAssetData(assetDataRes.data[0]);
			}
		} catch (err) {
			// console.error("Error fetching asset details:", err);
			ToastAndroid.show("Failed to load asset details.", ToastAndroid.SHORT);
		}
	}

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchAssetData();
		setRefreshing(false);
	}, [id]);

	const handleEditAsset = () => {
		if (!assetData) return;
		const routeAssetId = Array.isArray(id) ? id[0] : id;
		const assetId = String(routeAssetId ?? assetData?.id ?? assetData?._id ?? "");
		const assetPrefill = {
			id: assetData?.id,
			_id: assetData?._id,
			asset_name: assetData?.asset_name,
			asset_id: assetData?.asset_id,
			asset_type: assetData?.asset_type,
			asset_model: assetData?.asset_model,
			model: assetData?.model,
			asset_timezone: assetData?.asset_timezone,
			locationId: assetData?.locationId,
			locationData: assetData?.locationData,
			location_name: (assetData as any)?.location_name,
			manufacturer: assetData?.manufacturer,
			year: assetData?.year,
			description: assetData?.description,
			userList: assetData?.userList,
			image_path: assetData?.image_path,
			asset_build_type: assetData?.asset_build_type,
			parent_id: assetData?.parent_id,
			top_level: assetData?.top_level,
		};

		if (!assetId) {
			ToastAndroid.show("Unable to open asset editor.", ToastAndroid.SHORT);
			return;
		}

		router.push({
			pathname: "/editAsset",
			params: {
				asset_id: assetId,
				asset_data: JSON.stringify(assetPrefill),
				mode: assetData?.top_level == false ? 'child' : 'parent'
			},
		});
	}

	return (
		<View style={styles.container}>
			<Header title={assetData?.asset_name || ""} editAsset={!!assetData} handleEditAsset={handleEditAsset} />

			{
				assetData ? (
					<View style={styles.tabRow}>
						<Pressable
							style={[
								styles.tabButton,
								activeTab === "info" && styles.activeTab
							]}
							onPress={() => setActiveTab("info")}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "info" && styles.activeTabText
								]}
							>
								Info
							</Text>
						</Pressable>

						<Pressable
							style={[
								styles.tabButton,
								activeTab === "sensors" && styles.activeTab
							]}
							onPress={() => setActiveTab("sensors")}
						>
							<Text
								style={[
									styles.tabText,
									activeTab === "sensors" && styles.activeTabText
								]}
							>
								Sensors
							</Text>
						</Pressable>
					</View>
					// <SegmentedPager tabs={[
					// 	{label: "Info", component: <AssetInfoTab asset_data={assetData!} /> },
					// 	{label: "Sensors", component: <AssetSensorsTab asset_data={assetData!} /> }
					// ]} />
				) : (
					<View style={styles.center}>
						<Text style={styles.resultText}>No asset data available</Text>
					</View>
				)
			}

			{
				assetData &&
				(
					activeTab === "info" ? (
						<AssetInfoTab
							asset_data={assetData}
							composite_idFromParams={composite_id}
							refreshing={refreshing}
							onRefresh={handleRefresh}
						/>
					) : (
						<AssetSensorsTab
							asset_data={assetData!}
							refreshing={refreshing}
							onRefresh={handleRefresh}
						/>
					)
				)
			}

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F7FA'
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	resultText: {
		fontSize: 14,
		fontFamily: Fonts.medium,
		color: "#201F23",
		textAlign: "center",
		paddingHorizontal: 20,
	},
	tabRow: {
		flexDirection: "row",
		alignSelf: "center",
		backgroundColor: "#fff",
		borderRadius: 100,
		padding: 4,
		marginVertical: 10,
		borderWidth: 0.5,
		borderColor: "#00000033",
	},

	tabButton: {
		paddingHorizontal: 16,
		height: 36,
		borderRadius: 100,
		justifyContent: "center",
		alignItems: "center",
	},

	activeTab: {
		backgroundColor: "#742BDE",
	},

	tabText: {
		fontSize: 12,
		color: "#000",
	},

	activeTabText: {
		color: "#fff",
	},
});

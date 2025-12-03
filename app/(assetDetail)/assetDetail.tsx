import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import AssetInfoTab from "@/components/asset-detail/AssetInfoTab";
import AssetSensorsTab from "@/components/asset-detail/AssetSensorsTab";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Asset } from "@/src/types/asset";
import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import { getAssetData } from "@/src/services/asset.service";
import Fonts from "@/constants/Typography";

export default function AssetDetailScreen() {
	const router = useRouter();
	const params: any = useLocalSearchParams();
	console.log('params = ', params);
	// const asset_data = JSON.parse(params?.data);

	const id = params?.id;

	const [assetData, setAssetData] = useState<Asset | null>(null);

	useEffect(() => {
		console.log('id = ', id);
		fetchAssetData();
	}, [id])

	const fetchAssetData = async () => {
		console.log('fetching asset details', id);
		try {
			const assetDataRes = await getAssetData(id);
			console.log('res asset details = ', assetDataRes);
			if (assetDataRes.status) {
				setAssetData(assetDataRes.data[0]);
			}
		} catch (err) {
			console.error("Error fetching asset details:", err);
			ToastAndroid.show("Failed to load asset details.", ToastAndroid.SHORT);
		}
	}

	const handleEditAsset = () => {
		console.log('handleEditAsset');

		router.push({
			pathname: "/createAsset",
			params: {
				asset_data: JSON.stringify(assetData),
				isEdit: 'true'
			},
		});
	}

	return (
		<View style={styles.container}>
			<Header title={assetData?.asset_name || ""} editAsset={true} handleEditAsset={handleEditAsset} />

			{
				assetData ? (
					<SegmentedPager tabs={[
						{ label: "Info", component: <AssetInfoTab asset_data={assetData!} /> },
						{ label: "Sensors", component: <AssetSensorsTab asset_data={assetData!} /> }
					]} />
				) : (
					<View style={styles.center}>
						<Text style={styles.resultText}>No asset data available</Text>
					</View>
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
});

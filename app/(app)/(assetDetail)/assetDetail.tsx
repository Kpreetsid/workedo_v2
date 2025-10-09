import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import AssetInfoTab from "@/components/asset-detail/AssetInfoTab";
import AssetSensorsTab from "@/components/asset-detail/AssetSensorsTab";
import { useLocalSearchParams } from "expo-router";

export default function AssetDetailScreen() {
	const params: any = useLocalSearchParams();
	const asset_data = JSON.parse(params?.data);

	return (
		<>
			<Header title="Asset Detail" />

			<SegmentedPager tabs={[
				{ label: "Info", component: <AssetInfoTab asset_data={asset_data} /> },
				{ label: "Sensors", component: <AssetSensorsTab /> }
			]} />
		</>
	);
}
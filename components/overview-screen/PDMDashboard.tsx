import { FlashList } from "@shopify/flash-list";
import InfoCards from "@/components/overview-screen/InfoCards";
import AssetHealth from "@/components/overview-screen/AssetHealth";
import AssetHealthStatus from "@/components/overview-screen/AssetHealthStatus";
import AlarmSummary from "@/components/overview-screen/AlarmSummary";
import Alarms from "@/components/overview-screen/Alarms";
import PDMDashboardLocationSelect from "./PDMLocationSelect";
import AssetHealthStatusPieChart from "./AssetHealthStatusPieChart";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

export default function PDMDashboard() {
	console.log('running pdm');
	const [refreshing, setRefreshing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const onRefresh = useCallback(() => {
		setRefreshing(true);

		// 🔥 Force remount of ALL children
		setRefreshKey((prev) => prev + 1);

		setRefreshing(false);
	}, []);

	// 🔥 Auto refresh when screen is focused
	// useFocusEffect(
	// 	useCallback(() => {
	// 		setRefreshKey((k) => k + 1);
	// 	}, [])
	// );

	return (
		<FlashList
			key={refreshKey}
			data={[{}]}
			renderItem={() => (
				<>
					<PDMDashboardLocationSelect />
					<InfoCards />
					<AssetHealthStatus />
					{/* <AssetHealthStatusPieChart /> */}
					<AssetHealth />
					<AlarmSummary />
					{/* <Top10BadAssets /> */}
					<Alarms />
				</>
			)}
			refreshing={refreshing}
			onRefresh={onRefresh}
		/>
	)
}
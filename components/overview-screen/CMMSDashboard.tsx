import { ScrollView, StyleSheet, View } from "react-native"
import CMMSDashboardLocationSelect from "./CMMSLocationSelect"
import CMMSInfoCards from "./CMMSInfoCards"
import WoStatus from "./WoStatus"
import WoPriority from "./WoPriority"
import PlannedVsUnplanned from "./PlannedVsUnplanned"
import WorkOrderSummary from "./WorkOrderSummary"
import PendingWorkOrders from "./PendingWorkOders"
import { Ionicons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { useCallback, useState } from "react"
import { useFocusEffect } from "expo-router"

export default function CMMSDashboard() {
	console.log('cmms dashboard')
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
			key={refreshKey}           // 👈 THIS is the trick
			data={[{}]}
			renderItem={() => (
				<>
					<CMMSDashboardLocationSelect />
					<CMMSInfoCards />
					<WoStatus />
					<WoPriority />
					<PlannedVsUnplanned />
					<WorkOrderSummary />
					<PendingWorkOrders />
				</>
			)}
			refreshing={refreshing}
			onRefresh={onRefresh}
		/>
	);
}
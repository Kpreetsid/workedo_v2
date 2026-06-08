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
	const [refreshing, setRefreshing] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setRefreshKey((prev) => prev + 1);

		setRefreshing(false);
	}, []);

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
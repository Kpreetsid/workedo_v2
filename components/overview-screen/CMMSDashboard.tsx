import { ScrollView, StyleSheet, View } from "react-native"
import CMMSDashboardLocationSelect from "./CMMSLocationSelect"
import CMMSInfoCards from "./CMMSInfoCards"
import WoStatus from "./WoStatus"
import WoPriority from "./WoPriority"
import PlannedVsUnplanned from "./PlannedVsUnplanned"
import WorkOrderSummary from "./WorkOrderSummary"
import PendingWorkOrders from "./PendingWorkOders"
import { Ionicons } from "@expo/vector-icons"

export default function CMMSDashboard() {
	return (
		<ScrollView contentContainerStyle={styles.contentContainer}>
			<CMMSDashboardLocationSelect />

			{/* <CMMSInfoCards /> */}

			<WoStatus />

			{/* <WoPriority />

			<PlannedVsUnplanned />

			<WorkOrderSummary />

			<PendingWorkOrders /> */}

		</ScrollView>
	)
}

const styles = StyleSheet.create({
	contentContainer: {
		// flexGrow: 1
	}
})
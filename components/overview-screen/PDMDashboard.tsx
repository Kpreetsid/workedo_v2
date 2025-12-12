import { FlashList } from "@shopify/flash-list";
import InfoCards from "@/components/overview-screen/InfoCards";
import AssetHealth from "@/components/overview-screen/AssetHealth";
import AssetHealthStatus from "@/components/overview-screen/AssetHealthStatus";
import AlarmSummary from "@/components/overview-screen/AlarmSummary";
import Alarms from "@/components/overview-screen/Alarms";
import PDMDashboardLocationSelect from "./PDMLocationSelect";
import AssetHealthStatusPieChart from "./AssetHealthStatusPieChart";

export default function PDMDashboard() {
	return (
		<FlashList
			data={[{}]} // dummy single item
			renderItem={() => (
				<>
					<PDMDashboardLocationSelect />
					<InfoCards />
					<AssetHealth />
					<AssetHealthStatusPieChart />
					{/* <AssetHealthStatus /> */}
					<AlarmSummary />
					{/* <Top10BadAssets /> */}
					<Alarms />
				</>
			)}
		/>
	)
}
import { StyleSheet, ScrollView } from "react-native";
import FAB from "@/components/overview-screen/FAB";
import InfoCards from "@/components/overview-screen/InfoCards";
import Location from "@/components/overview-screen/Location";
import OverviewHeader from "@/components/overview-screen/OverviewHeader";
import AssetHealth from "@/components/overview-screen/AssetHealth";
import AssetHealthStatus from "@/components/overview-screen/AssetHealthStatus";
import { router } from "expo-router";
import CreateAlertBox from "@/components/overview-screen/CreateAlertBox";
import { useState } from "react";

export default function Overview() {
	const [createAlertBoxVisible, setCreateAlertBoxVisible] = useState(false);

	const onSelect = (option: string) => {
		option === "parts" && router.push("/createPart");
		option === "preventive" && router.push("/createPreventive");
		setCreateAlertBoxVisible(false);
	}
	return (
		<>
			<OverviewHeader />

			<ScrollView contentContainerStyle={styles.container}>

				<Location />

				<InfoCards />

				<AssetHealth />

				<AssetHealthStatus />

			</ScrollView>

			<FAB onPress={() => setCreateAlertBoxVisible(true)} />

			<CreateAlertBox visible={createAlertBoxVisible} onClose={() => setCreateAlertBoxVisible(false)} onSelect={onSelect} />
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		// flexGrow: 1,
		justifyContent: "flex-start",
		backgroundColor: "#F5F7FA",
	}
})
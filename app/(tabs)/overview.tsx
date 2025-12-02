import { StyleSheet, ScrollView } from "react-native";
import FAB from "@/components/overview-screen/FAB";
import InfoCards from "@/components/overview-screen/InfoCards";
import Location from "@/components/overview-screen/Location";
import OverviewHeader from "@/components/overview-screen/OverviewHeader";
import AssetHealth from "@/components/overview-screen/AssetHealth";
import AssetHealthStatus from "@/components/overview-screen/AssetHealthStatus";
import { router } from "expo-router";
import CreateAlertBox from "@/components/overview-screen/CreateAlertBox";
import { useEffect, useState } from "react";
import AlarmSummary from "@/components/overview-screen/AlarmSummary";
import Top10BadAssets from "@/components/overview-screen/Top10BadAssets";
import Alarms from "@/components/overview-screen/Alarms";
import { FlashList } from "@shopify/flash-list";
import { getProfileService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Overview() {
	const [createAlertBoxVisible, setCreateAlertBoxVisible] = useState(false);
	const { user, setUser } = useAuthStore();

	const onSelect = (option: string) => {
		option === "parts" && router.push("/createPart");
		option === "preventive" && router.push({
			pathname: "/createPreventive",
			params: {comingFrom: "overview"}
		});
		setCreateAlertBoxVisible(false);
	}

	useEffect(() => {
		console.log('createAlertBoxVisible = ', createAlertBoxVisible)
		fetchProfile();
	}, [createAlertBoxVisible])

	const fetchProfile = async () => {
		const latestUser = await getProfileService(user?.id);
		console.log('latest user = ', latestUser);
		if (latestUser?.status) {
			setUser(latestUser?.data[0]);
		}
	}

	return (
		<>
			<OverviewHeader />

			<FlashList
				data={[{}]} // dummy single item
				renderItem={() => (
					<>
						<Location />
						<InfoCards />
						<AssetHealth />
						<AssetHealthStatus />
						<AlarmSummary />
						{/* <Top10BadAssets /> */}
						<Alarms />
					</>
				)}
			/>



			{/* <ScrollView contentContainerStyle={styles.container}>

				<Location />

				<InfoCards />

				<AssetHealth />

				<AssetHealthStatus />

				<AlarmSummary />

				<Top10BadAssets />

				<Alarms />

			</ScrollView> */}

			<FAB onPress={() => setCreateAlertBoxVisible(true)} />

			<CreateAlertBox visible={createAlertBoxVisible} onClose={() => setCreateAlertBoxVisible(false)} onSelect={onSelect} />
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		// flexGrow: 1,
		justifyContent: "flex-start",
	}
})
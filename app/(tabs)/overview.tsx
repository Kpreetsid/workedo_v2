import { StyleSheet, ScrollView, View, TouchableOpacity, Text, Dimensions } from "react-native";
import FAB from "@/components/overview-screen/FAB";
import InfoCards from "@/components/overview-screen/InfoCards";
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
import { Feather, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Fonts from "@/constants/Typography";
import CMMSDashboard from "@/components/overview-screen/CMMSDashboard";
import PDMDashboard from "@/components/overview-screen/PDMDashboard";
import { TabView } from "react-native-tab-view";

const PDM = () => (
	<View style={styles.scene}>
		<PDMDashboard />
	</View>
);

const CMMS = () => (
	<View style={styles.scene}>
		<CMMSDashboard />
	</View>
);

const renderScene = ({ route }: { route: { key: string } }) => {
	switch (route.key) {
		case "pdm":
			return <PDM />;
		case "cmms":
			return <CMMS />;
		default:
			return null;
	}
};

export default function Overview() {
	const layout = Dimensions.get("window");
	const [index, setIndex] = useState(0);

	const [routes] = useState([
		{ key: "pdm", title: "PDM Dashboard" },
		{ key: "cmms", title: "CMMS Dashboard" }
	]);


	const [createAlertBoxVisible, setCreateAlertBoxVisible] = useState(false);
	const [activeTab, setActiveTab] = useState("pdm")
	const { user, setUser } = useAuthStore();

	const onSelect = (option: string) => {
		option === "parts" && router.push("/createPart");
		option === "preventive" && router.push({
			pathname: "/createPreventive",
			params: { comingFrom: "overview" }
		});
		option === "location" && router.push("/createLocation");
		option === "asset" && router.push("/createAsset");
		option === "work_order" && router.push("/createWorkOrder");
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

	const renderTabBar = () => (
		<View style={styles.tabBar}>
			{routes.map((route, i) => {
				const isActive = i === index;
				return (
					<TouchableOpacity
						key={route.key}
						style={[styles.tabItem, isActive && styles.activeTab]}
						onPress={() => setIndex(i)}
					>
						<MaterialCommunityIcons
							name={route.key === "pdm" ? "view-dashboard-edit" : "inbox-outline"}
							size={14}
							color={isActive ? "#fff" : "#752BDF"}
						/>

						<Text style={[styles.tabText, isActive && styles.activeTabText]}>
							{route.title}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);

	return (
		<>
			<OverviewHeader />
			{renderTabBar()}

			<TabView
				navigationState={{ index, routes }}
				renderScene={renderScene}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={() => null}
			/>

			<FAB onPress={() => setCreateAlertBoxVisible(true)} />

			<CreateAlertBox visible={createAlertBoxVisible} onClose={() => setCreateAlertBoxVisible(false)} onSelect={onSelect} />
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		// flexGrow: 1,
		justifyContent: "flex-start",
	},


	tabBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: 20,
		marginBottom: 10,
	},
	tabItem: {
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderRadius: 30,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#fff"
	},
	activeTab: {
		backgroundColor: "#742BDE",
	},
	tabText: {
		fontSize: 14,
		color: "#000",
	},
	activeTabText: {
		color: "#fff",
		fontWeight: "600",
	},
	scene: {
		flex: 1,
		// padding: 20,
	},


	tabContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 20,
		paddingTop: 15,
		paddingHorizontal: 20,
	},
	tabButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
		paddingVertical: 6,
		gap: 8,
		borderRadius: 100
	},
	tabBtnText: {
		fontSize: 11
	}
})
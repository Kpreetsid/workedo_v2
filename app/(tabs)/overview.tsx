import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import OverviewHeader from "@/components/overview-screen/OverviewHeader";
import FAB from "@/components/overview-screen/FAB";
import CreateAlertBox from "@/components/overview-screen/CreateAlertBox";

import CMMSDashboard from "@/components/overview-screen/CMMSDashboard";
import PDMDashboard from "@/components/overview-screen/PDMDashboard";

import { getProfileService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useCMMSStore } from "@/src/store/useCMMSStore";

export default function Overview() {
	const [activeTab, setActiveTab] = useState<"pdm" | "cmms">("pdm");
	const [createAlertBoxVisible, setCreateAlertBoxVisible] = useState(false);

	const { user, setUser } = useAuthStore();

	// 🔥 Fetch profile when screen gains focus
	useFocusEffect(
		useCallback(() => {
			fetchProfile();
		}, [])
	);

	const fetchProfile = async () => {
		if (!user?.id) return;

		const latestUser = await getProfileService(user.id);
		if (latestUser?.status) {
			setUser(latestUser.data[0]);
		}
	};

	const handleTabChange = (nextTab: "pdm" | "cmms") => {
		if (nextTab === activeTab) return;

		// Reset both dashboard stores so switching tabs does not preserve the
		// previously selected locations/assets.
		useOverviewStore.getState().clearOverview();
		useCMMSStore.getState().clearCMMS();

		setActiveTab(nextTab);
	};

	const onSelect = (option: string) => {
		if (option === "parts") router.push("/createPart");
		if (option === "location") router.push("/createLocation");
		if (option === "asset") router.push("/createAsset");
		if (option === "work_order") {
			router.push({ pathname: "/createWorkOrder", params: { comingFrom: "overview" } });
		}
		if (option === "work_request") router.push("/newWorkRequest");
		if (option === "gateway") router.push("/updateGateway");

		if (option === "preventive") {
			router.push({
				pathname: "/createPreventive",
				params: { comingFrom: "overview" },
			});
		}

		setCreateAlertBoxVisible(false);
	};

	return (
		<>
			<OverviewHeader />

			{/* 🔥 Custom Tab Bar */}
			<View style={styles.tabBar}>
				<TabButton
					active={activeTab === "pdm"}
					label="PDM Dashboard"
					icon="view-dashboard-edit"
					onPress={() => handleTabChange("pdm")}
				/>

				<TabButton
					active={activeTab === "cmms"}
					label="CMMS Dashboard"
					icon="inbox-outline"
					onPress={() => handleTabChange("cmms")}
				/>
			</View>

			{/* 🔥 ONLY ONE DASHBOARD EXISTS */}
			{activeTab === "pdm" && <PDMDashboard />}
			{activeTab === "cmms" && <CMMSDashboard />}

			<FAB onPress={() => setCreateAlertBoxVisible(true)} />

			<CreateAlertBox
				visible={createAlertBoxVisible}
				onClose={() => setCreateAlertBoxVisible(false)}
				onSelect={onSelect}
			/>
		</>
	);
}

/* ---------------- TAB BUTTON ---------------- */

function TabButton({
	active,
	label,
	icon,
	onPress,
}: {
	active: boolean;
	label: string;
	icon: any;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.tabItem, active && styles.activeTab]}
		>
			<MaterialCommunityIcons
				name={icon}
				size={14}
				color={active ? "#fff" : "#752BDF"}
			/>
			<Text style={[styles.tabText, active && styles.activeTabText]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: 20,
		marginBottom: 10,
	},
	tabItem: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 30,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#fff",
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
});

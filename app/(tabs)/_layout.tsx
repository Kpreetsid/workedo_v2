import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import CustomTabBar from "@/components/tab-bar/CustomTabBar";
import MoreTabModal from "@/components/tab-bar/MoreTabModal";
import { BackHandler, StyleSheet, View } from "react-native";

export default function TabsLayout() {
	const [modalVisible, setModalVisible] = useState(false);

	useEffect(() => {
		console.log('modal visible', modalVisible);
	}, [modalVisible]);

	// 🔥 Handle Android hardware back
	useEffect(() => {
		const onBackPress = () => {
			if (modalVisible) {
				setModalVisible(false);
				return true; // ⛔ prevent navigation back
			}
			return false; // ✅ allow normal back behavior
		};

		const subscription = BackHandler.addEventListener(
			"hardwareBackPress",
			onBackPress
		);

		return () => subscription.remove();
	}, [modalVisible]);



	return (
		<View style={styles.container}>
			<Tabs screenOptions={{
				headerShown: false,
				sceneStyle: { backgroundColor: "#F5F7FA" },
			}}
				tabBar={
					(props) => <CustomTabBar {...props}
						onMorePress={() => setModalVisible((v) => !v)}
						onTabPress={() => setModalVisible(false)}
					/>
				}
			>
				<Tabs.Screen name="overview" options={{ title: "Overview" }} />
				<Tabs.Screen name="workOrders" options={{ title: "Work Orders" }} />
				<Tabs.Screen name="assets" options={{ title: "Assets" }} />
				<Tabs.Screen name="scanner" options={{ title: "Scanner" }} />
				<Tabs.Screen name="more" options={{ title: "More" }} />
			</Tabs>

			{/* ✅ replace Modal with overlay view */}
			{modalVisible && <MoreTabModal setModalVisible={setModalVisible} />}
			{/* <MoreTabModal modalVisible={modalVisible} setModalVisible={setModalVisible} /> */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F7FA"
	},
});
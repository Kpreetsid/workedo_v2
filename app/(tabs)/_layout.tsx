import { Tabs } from "expo-router";
import { useState} from "react";
import CustomTabBar from "@/components/tab-bar/CustomTabBar";
import MoreTabModal from "@/components/tab-bar/MoreTabModal";

export default function TabsLayout() {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <Tabs screenOptions={{headerShown: false}} tabBar={(props) => <CustomTabBar {...props} onMorePress={() => setModalVisible(true)}/>}>
                <Tabs.Screen name="overview" options={{title: "Overview"}}/>
                <Tabs.Screen name="workOrders" options={{title: "Work Orders"}}/>
                <Tabs.Screen name="assets" options={{title: "Assets"}}/>
                <Tabs.Screen name="scanner" options={{title: "Scanner"}}/>
                <Tabs.Screen name="more" options={{title: "More"}}/>
            </Tabs>

            <MoreTabModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
        </>
    );
}



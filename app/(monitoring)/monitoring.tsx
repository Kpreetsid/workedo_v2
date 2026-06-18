import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import {Foundation, MaterialCommunityIcons} from "@expo/vector-icons";
import BluetoothMonitorPlaceholder from "@/components/monitoring/BluetoothMonitorPlaceholder";
import WiredMonitorTab from "@/components/monitoring/WiredMonitorTab";
import { StyleSheet, View } from "react-native";
import { useState } from "react";

export default function Monitoring() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <View style={styles.container}>
            <Header title="Sensor Monitor"/>

            <SegmentedPager tabs={[
                {label: "Wired", icon: <MaterialCommunityIcons name="ethernet" size={15}/>, component: () => <WiredMonitorTab active={activeTab === 0} />},
                {label: "Bluetooth", icon: <Foundation name="bluetooth" size={13}/>, component: () => <BluetoothMonitorPlaceholder />}
            ]} onPageChange={setActiveTab} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA"
    }
})

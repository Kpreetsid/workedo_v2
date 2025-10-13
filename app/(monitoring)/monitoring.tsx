import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import {Foundation, MaterialCommunityIcons} from "@expo/vector-icons";
import MonitoringTabs from "@/components/monitoring/MonitoringTabs";

export default function Monitoring() {
    return (
        <>
            <Header title="Sensor Monitor"/>

            <SegmentedPager tabs={[
                {label: "Wired", icon: <MaterialCommunityIcons name="ethernet" size={15}/>, component: <MonitoringTabs/>},
                {label: "Bluetooth", icon: <Foundation name="bluetooth" size={13}/>, component:<MonitoringTabs />}
            ]}/>
        </>
    )
}
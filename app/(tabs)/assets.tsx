import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import AssetsTab from "@/components/assets/AssetsTab";
import {AssetsTabIcon, LocationTabIcon} from "@/constants/IconProvider";
import SelectLocation from "@/app/(createScreens)/selectLocation";
import {StatusBar} from "expo-status-bar";

export default function Assets() {
    return (
        <>
            <Header title="Assets"/>
            <StatusBar style="light" animated={true}/>
            <SegmentedPager tabs={[
                {label: "Locations", icon: <LocationTabIcon/>, component: <SelectLocation showHeader={false}/>},
                {label: "Assets", icon: <AssetsTabIcon/>, component: <AssetsTab/>}]}/>
        </>
    )
}

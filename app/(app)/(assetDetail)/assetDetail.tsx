import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import AssetInfoTab from "@/components/asset-detail/AssetInfoTab";
import AssetSensorsTab from "@/components/asset-detail/AssetSensorsTab";

export default function AssetDetailScreen() {
    return (
        <>
            <Header title="Asset Detail"/>

            <SegmentedPager tabs={[
                {label: "Info", component: <AssetInfoTab/>}, {label: "Sensors", component: <AssetSensorsTab/>}
            ]}/>
        </>
    );
}


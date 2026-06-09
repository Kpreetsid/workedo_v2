import Header from "@/src/components/global/Header";
import SegmentedPager from "@/src/components/global/SegmentPager";
import AssetsTab from "@/src/components/assets/AssetsTab";
import { AssetsTabIcon, LocationTabIcon } from "@/constants/IconProvider";
import { StatusBar } from "expo-status-bar";
import SelectLocation from "../(createScreens)/selectLocation";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function Assets() {
	const { initialIndex } = useLocalSearchParams<{ initialIndex?: string }>();
	const startIndex = initialIndex ? Number(initialIndex) : 0;
    // @ts-ignore
	const [activeTab, setActiveTab] = useState(startIndex);


	return (
		<>
			<Header title="Assets" />
			<StatusBar style="light" animated={true} />

			<SegmentedPager
				initialPage={startIndex}
				tabs={[
					{
						label: "Locations",
						icon: <LocationTabIcon />,
						component: () => <SelectLocation showHeader={false} selection={false} />,
					},
					{
						label: "Assets",
						icon: <AssetsTabIcon />,
						component: () => <AssetsTab selection={false} />,
					},
				]}
			/>

		</>
	)
}
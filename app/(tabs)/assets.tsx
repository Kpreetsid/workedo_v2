import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import AssetsTab from "@/components/assets/AssetsTab";
import { AssetsTabIcon, LocationTabIcon } from "@/constants/IconProvider";
import { StatusBar } from "expo-status-bar";
import SelectLocation from "../(createScreens)/selectLocation";
import { useLocalSearchParams } from "expo-router";

export default function Assets() {
	const { initialIndex } = useLocalSearchParams<{ initialIndex?: string }>();
	const startIndex = initialIndex ? Number(initialIndex) : 0;
	console.log("startIndex", startIndex);

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
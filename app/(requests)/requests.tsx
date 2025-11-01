import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import { DoneIcon } from "@/constants/IconProvider";
import PendingRequests from "@/components/requests/PendingRequests";
import { FontAwesome6 } from "@expo/vector-icons";
import CreateFAB from "@/components/global/CreateFAB";
import { router } from "expo-router";
import DoneRequests from "@/components/requests/DoneRequests";
import { View } from "react-native";

export default function Requests() {
	return (
		<View style={{flex: 1, backgroundColor: "#F5F7FA"}}>
			<Header title="Work Request" />
			<SegmentedPager tabs={[
				{ label: "Pending", icon: <FontAwesome6 name="circle-exclamation" size={12} />, component: <PendingRequests /> },
				{ label: "Done", icon: <DoneIcon />, component: <DoneRequests /> }]}
			/>

			<CreateFAB label="Create Request" onPress={() => router.push("/newWorkRequest")} />
		</View>
	)
}
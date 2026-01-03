import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import { DoneIcon } from "@/constants/IconProvider";
import PendingRequests from "@/components/requests/PendingRequests";
import { FontAwesome6 } from "@expo/vector-icons";
import CreateFAB from "@/components/global/CreateFAB";
import { router, useFocusEffect } from "expo-router";
import DoneRequests from "@/components/requests/DoneRequests";
import { View } from "react-native";
import RejectedRequests from "@/components/requests/RejectedRequests";
import { useCallback, useState } from "react";
import { WorkRequest } from "@/src/types/workRequest";
import { getWorkRequests } from "@/src/services/work-request.service";

export default function Requests() {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [allRequests, setAllRequests] = useState<WorkRequest[]>([]);

	const fetchRequests = async () => {
		setLoading(true);
		try {
			const res = await getWorkRequests();
			if (res?.status) {
				setAllRequests(res.data.reverse());
			}
		} catch (e) {
			console.log(e);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchRequests();
		}, [])
	);

	const pending = allRequests.filter(r => r.status === "Open");
	const rejected = allRequests.filter(r => r.status === "Rejected");
	const done = allRequests.filter(r => r.status === "Approved");

	console.log(pending)
	console.log(rejected)
	console.log(done)

	return (
		<View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
			<Header title="Work Request" />

			<SegmentedPager
				tabs={[
					{
						label: "Pending",
						icon: <FontAwesome6 name="circle-exclamation" size={12} />,
						component: (
							<PendingRequests
								data={pending}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
							/>
						),
					},
					{
						label: "Rejected",
						icon: <FontAwesome6 name="circle-exclamation" size={12} />,
						component: (
							<RejectedRequests
								data={rejected}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
							/>
						),
					},
					{
						label: "Done",
						icon: <DoneIcon />,
						component: (
							<DoneRequests
								data={done}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
							/>
						),
					},
				]}
			/>

			<CreateFAB label="Create Request" onPress={() => router.push("/newWorkRequest")} />
		</View>
	);
}

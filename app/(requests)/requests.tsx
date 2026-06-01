import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";

import Header from "@/components/global/Header";
import SegmentedPager from "@/components/global/SegmentPager";
import CreateFAB from "@/components/global/CreateFAB";
import RequestList from "@/components/requests/RequestList";
import Fonts from "@/constants/Typography";
import { getWorkRequests } from "@/src/services/work-request.service";
import { WorkRequest } from "@/src/types/workRequest";
import { getWorkRequestStage } from "@/src/utils/workRequestLifecycle";

export default function Requests() {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [allRequests, setAllRequests] = useState<WorkRequest[]>([]);

	const fetchRequests = async () => {
		setLoading(true);
		try {
			const res = await getWorkRequests();
			if (res?.status) {
				setAllRequests(Array.isArray(res.data) ? res.data : []);
			}
		} catch (e) {
			console.log("request list error =", e);
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

	const orderedRequests = useMemo(
		() =>
			[...allRequests].sort((left, right) => {
				const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
				const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
				return rightTime - leftTime;
			}),
		[allRequests]
	);

	const openRequests = orderedRequests.filter((request) => getWorkRequestStage(request) === "open");
	const approvedRequests = orderedRequests.filter((request) => getWorkRequestStage(request) === "approved");
	const closedRequests = orderedRequests.filter((request) => {
		const stage = getWorkRequestStage(request);
		return stage === "rejected" || stage === "converted";
	});

	return (
		<View style={styles.screen}>
			<Header title="Work Requests" />

			<View style={styles.summaryRow}>
				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>Total</Text>
					<Text style={styles.summaryValue}>{orderedRequests.length}</Text>
				</View>
				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>Open</Text>
					<Text style={styles.summaryValue}>{openRequests.length}</Text>
				</View>
				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>Approved</Text>
					<Text style={styles.summaryValue}>{approvedRequests.length}</Text>
				</View>
				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>Closed</Text>
					<Text style={styles.summaryValue}>{closedRequests.length}</Text>
				</View>
			</View>

			<SegmentedPager
				tabs={[
					{
						label: "Open",
						icon: <FontAwesome6 name="circle-exclamation" size={12} />,
						component: (
							<RequestList
								data={openRequests}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
								emptyTitle="No open requests"
								emptyMessage="Newly created requests that are still waiting for review will appear here."
							/>
						),
					},
					{
						label: "Approved",
						icon: <FontAwesome6 name="circle-check" size={12} />,
						component: (
							<RequestList
								data={approvedRequests}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
								emptyTitle="No approved requests"
								emptyMessage="Requests that are approved and ready to convert into work orders will appear here."
							/>
						),
					},
					{
						label: "Closed",
						icon: <FontAwesome6 name="circle-dot" size={12} />,
						component: (
							<RequestList
								data={closedRequests}
								loading={loading}
								refreshing={refreshing}
								onRefresh={() => {
									setRefreshing(true);
									fetchRequests();
								}}
								emptyTitle="No closed requests"
								emptyMessage="Rejected requests and requests already converted into work orders will appear here."
							/>
						),
					},
				]}
			/>

			<CreateFAB label="Create Request" onPress={() => router.push("/newWorkRequest")} />
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#F5F7FA",
	},
	summaryRow: {
		flexDirection: "row",
		paddingHorizontal: 20,
		marginTop: 16,
		marginBottom: 2,
		gap: 10,
	},
	summaryCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 18,
		paddingHorizontal: 12,
		paddingVertical: 14,
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	summaryLabel: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: "#64748B",
		marginBottom: 6,
	},
	summaryValue: {
		fontFamily: Fonts.semiBold,
		fontSize: 18,
		color: "#0F172A",
	},
});

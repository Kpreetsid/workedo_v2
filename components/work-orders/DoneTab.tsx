import { ActivityIndicator, FlatList, StyleSheet, Text, View, ToastAndroid } from "react-native";
import Fonts from "@/constants/Typography";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { useCallback, useState } from "react";
import { getWorkOrders } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { useFocusEffect } from "expo-router";

const sortNewestFirst = (orders: WorkOrder[]) =>
	[...orders].sort((a, b) => {
		const timeA = new Date(a?.createdAt || 0).getTime();
		const timeB = new Date(b?.createdAt || 0).getTime();
		return timeB - timeA;
	});

export default function DoneTab() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [workorders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);

	useFocusEffect(
		useCallback(() => {
			setLoading(true);
			fetchWorkOrders();
		}, [])
	);

	const fetchWorkOrders = async () => {
		setLoading(true);

		try {
			const res = await getWorkOrders('done');
			const incoming = Array.isArray(res?.data) ? (res.data as WorkOrder[]) : [];

			if (res?.message === "No data found" || (!res?.status && incoming.length === 0) || incoming.length === 0) {
				setWorkOrders([]);
				return;
			}

			if (res?.status && incoming.length > 0) {
				setWorkOrders(sortNewestFirst(incoming));
				return;
			}

			setWorkOrders([]);
			ToastAndroid.show(res?.message || "Something went wrong", ToastAndroid.SHORT);
		} catch (error: any) {
			if (error?.message === "No data found") {
				setWorkOrders([]);
				return;
			}

			setWorkOrders([]);
			ToastAndroid.show(error?.message || "Something went wrong", ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchWorkOrders();
		setRefreshing(false);
	};

	return (
		<View style={styles.container}>
			<FlatList
				style={styles.list}
				data={workorders || []}
				removeClippedSubviews={false}
				keyExtractor={(item) => item.id}
				contentContainerStyle={[
					styles.listContainer,
					workorders.length === 0 && styles.emptyListContainer,
				]}
				renderItem={({ item }) => (
					<WorkOrderCard item={item} isSelected={selectedId === item.id} />
				)}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						{loading || refreshing ? (
							<ActivityIndicator size={28} />
						) : (
							<Text style={styles.footerText}>No Work Orders found!</Text>
						)}
					</View>
				}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		flex: 1,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12
	},
	emptyListContainer: {
		flexGrow: 1,
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	footerText: {
		fontSize: 14,
		color: "#000000",
		textAlign: "center",
		fontFamily: Fonts.regular,
	}
})

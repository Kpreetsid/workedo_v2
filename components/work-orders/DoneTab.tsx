import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { useCallback, useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { getWorkOrders } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { ToastAndroid } from "react-native";
import { useFocusEffect } from "expo-router";

export default function DoneTab() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [workorders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [loading, setLoading] = useState(false)

	useFocusEffect(
		useCallback(() => {
			setLoading(true)
		fetchWorkOrders();
		}, [])
	);

	const fetchWorkOrders = async () => {
		console.log("fetch work orders");

		try {
			const res = await getWorkOrders('done');

			if (res?.status && res?.data) {
				const allWorkOrders = res.data as WorkOrder[];
				setWorkOrders(allWorkOrders);
				setLoading(false)
			}
		} catch (error: any) {
			console.log("error =", error);
			setLoading(false)
			ToastAndroid.show(error?.message || "Something went wrong", ToastAndroid.LONG);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchWorkOrders();
		setRefreshing(false);
	};

	if (loading) {
		<View style={{ marginTop: 20 }}>
			<ActivityIndicator size={28} />
		</View>
	}

	return (
		<FlatList
			data={workorders || []}
			removeClippedSubviews={false}
			keyExtractor={(item) => item.id}
			contentContainerStyle={[
				styles.listContainer,
				{ flexGrow: 1 }, // ensure empty component shows
			]}
			renderItem={({ item }) => (
				<WorkOrderCard item={item} isSelected={selectedId === item.id} />
			)}
			refreshing={refreshing}
			onRefresh={handleRefresh}
			ListEmptyComponent={
				<View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 40 }}>
					<Text style={styles.footerText}>No work orders found</Text>
				</View>
			}
		// selection for the work orders
		// onPress={() => setSelectedId(item.id)}
		/>
	)
}

const styles = StyleSheet.create({
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12
	},
	footerText: {
		fontSize: 12,
		color: "#000000",
		textAlign: "center",
		marginVertical: 12
	}
})
import {
	Pressable,
	Text,
	View,
	StyleSheet,
	ToastAndroid,
	FlatList,
	ActivityIndicator,
} from "react-native";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useState } from "react";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { workOrdersPaginated } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { useFocusEffect } from "expo-router";

const TABS = ["assignedToMe", "createdByMe", "openToAll"];

export default function ToDoTab() {
	const [selectedButton, setSelectedButton] = useState(0);

	const [page, setPage] = useState(1);
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	// -------------------------
	// FETCH WORK ORDERS
	// -------------------------
	const fetchWorkOrders = async (pageToLoad: number, isRefresh = false) => {
		try {

			// if (pageToLoad === 1 || isRefresh) {
			// 	setLoading(true);
			// } else {
			// 	setLoadingMore(true);
			// }

			const res = await workOrdersPaginated(
				TABS[selectedButton],
				pageToLoad,
				10
			);

			console.log('res work order = ', res);

			if (res?.status && res?.data) {
				console.log('res work order if = ', res);
				const incoming = res.data as WorkOrder[];

				setHasMore(res?.pagination?.hasNextPage ?? false);

				if (pageToLoad === 1 || isRefresh) {
					setWorkOrders(incoming);
				} else {
					setWorkOrders(prev => [...prev, ...incoming]);
				}

				setPage(prev => prev + 1);
			} else {
				console.log('res work order else = ', res);
			}
		} catch (error: any) {
			console.log('res work order catch')
			setWorkOrders([])
			ToastAndroid.show(
				error?.message || "Something went wrong",
				ToastAndroid.SHORT
			);
			// setLoading(false);
		} finally {
			// setLoading(false);
			// setLoadingMore(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			console.log('running callback')
			// When screen comes back into focus
			setPage(1);
			setHasMore(true);
			fetchWorkOrders(1, true);
		}, [selectedButton])
	);


	// -------------------------
	// INITIAL LOAD + TAB CHANGE
	// -------------------------
	// useEffect(() => {
	// 	setPage(1);
	// 	setWorkOrders([]);
	// 	setHasMore(true);

	// 	fetchWorkOrders(1, true);
	// }, [selectedButton]);

	// -------------------------
	// PULL TO REFRESH
	// -------------------------
	const handleRefresh = async () => {
		setRefreshing(true);
		setPage(1);
		setHasMore(true);
		await fetchWorkOrders(1, true);
		setRefreshing(false);
	};

	// -------------------------
	// INFINITE SCROLL
	// -------------------------
	const handleEndReached = () => {
		if (!hasMore) return;
		if (loadingMore) return;
		if (loading) return;

		fetchWorkOrders(page);
	};

	const renderWorkOrderItem = useCallback(
		({ item }: { item: WorkOrder }) => (
			<WorkOrderCard item={item} />
		),
		[]
	);

	return (
		<>
			{/* FILTER BUTTONS */}
			<View style={styles.buttonContainer}>
				{["Assigned To Me", "Created By Me", "Open For All"].map(
					(text, index) => {
						const active = selectedButton === index;
						return (
							<Pressable
								key={index}
								style={[
									styles.filterButton,
									{ backgroundColor: active ? "#3F009A" : "#3F009A14" },
								]}
								onPress={() => {
									setPage(1);
									setSelectedButton(index);
								}}
							>
								<Text
									style={[
										styles.buttonText,
										{
											color: active ? "#fff" : "#000",
											fontFamily: active
												? Fonts.regular
												: Fonts.extraLight,
										},
									]}
								>
									{text}
								</Text>
							</Pressable>
						);
					}
				)}
			</View>

			{/* INITIAL LOADER */}
			{loading && page === 1 && (
				<View style={{ marginTop: 20 }}>
					<ActivityIndicator size={28} />
				</View>
			)}

			{/* LIST */}
			<FlatList
				data={workOrders}
				keyExtractor={(item, index) => `${item.id}-${index}`}
				renderItem={renderWorkOrderItem}
				removeClippedSubviews={false}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				contentContainerStyle={styles.listContainer}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.1}
				ListFooterComponent={
					loadingMore ? <ActivityIndicator size={28} /> : null
				}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5,
	},
	filterButton: {
		borderWidth: 0.2,
		borderColor: "#FFFFFF66",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	buttonText: {
		fontSize: 10,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
});
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
		if (pageToLoad === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			const res = await workOrdersPaginated(
				TABS[selectedButton],
				pageToLoad,
				10
			);

			const incoming = Array.isArray(res?.data) ? (res.data as WorkOrder[]) : [];
			const isNoDataResponse =
				res?.message === "No data found" ||
				(!res?.status && incoming.length === 0) ||
				incoming.length === 0;

			if (isNoDataResponse) {
				if (pageToLoad === 1 || isRefresh) {
					setWorkOrders([]);
				}
				setHasMore(false);
				return;
			}

			if (res?.status && incoming.length > 0) {
				setHasMore(res?.pagination?.hasNextPage ?? false);

				if (pageToLoad === 1 || isRefresh) {
					setWorkOrders(incoming);
				} else {
					setWorkOrders(prev => [...prev, ...incoming]);
				}

				setPage(prev => prev + 1);
			} else if (pageToLoad === 1 || isRefresh) {
				setWorkOrders([]);
			}
		} catch (error: any) {
			if (error?.message === "No data found") {
				if (pageToLoad === 1 || isRefresh) {
					setWorkOrders([]);
				}
				setHasMore(false);
				return;
			}

			if (pageToLoad === 1 || isRefresh) {
				setWorkOrders([]);
			}

			ToastAndroid.show(
				error?.message || "Something went wrong",
				ToastAndroid.SHORT
			);
		} finally {
			setLoading(false);
			setLoadingMore(false);
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
									setHasMore(true);

									if (selectedButton === index) {
										fetchWorkOrders(1, true);
										return;
									}

									setWorkOrders([]);
									setLoading(true);
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

			{/* LIST */}
			<FlatList
				style={styles.list}
				data={workOrders}
				keyExtractor={(item, index) => `${item.id}-${index}`}
				renderItem={renderWorkOrderItem}
				removeClippedSubviews={false}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				contentContainerStyle={[
					styles.listContainer,
					workOrders.length === 0 && styles.emptyListContainer,
				]}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.1}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						{loading || refreshing ? (
							<ActivityIndicator size={28} />
						) : (
							<Text style={styles.emptyText}>No Work Orders found!</Text>
						)}
					</View>
				}
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
	list: {
		flex: 1,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12,
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
	emptyText: {
		fontSize: 14,
		color: "#000000",
		textAlign: "center",
		fontFamily: Fonts.regular,
	},
});

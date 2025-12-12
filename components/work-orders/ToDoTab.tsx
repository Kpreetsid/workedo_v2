import { Pressable, Text, View, StyleSheet, ToastAndroid, FlatList, ActivityIndicator } from "react-native";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useState } from "react";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { getWorkOrders, workOrdersPaginated } from "@/src/services/work-order.service";
import { AssignedUser, WorkOrder } from "@/src/types/workOrder";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useFocusEffect } from "expo-router";

const TABS = ['assignedToMe', "createdByMe", "openForAll"];

export default function ToDoTab() {
	const [selectedButton, setSelectedButton] = useState<number>(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const [page, setPage] = useState(1);
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const loggedInUser = useAuthStore((state) => state.user);
	console.log('user in state = ', loggedInUser);

	useFocusEffect(
		useCallback(() => {
			setLoading(true)
			fetchWorkOrders(1);
		}, [])
	);

	const fetchWorkOrders = async (pageToLoad: number, isRefresh = false) => {
		try {
			if (pageToLoad === 1 || isRefresh) {
				setLoading(true);
			} else {
				setLoadingMore(true);
			}

			const res = await workOrdersPaginated(
				TABS[selectedButton],
				pageToLoad,
				10
			);

			console.log('res todos - ', res);
			if (res?.status && res?.data) {
				const incoming = res.data as WorkOrder[];

				setHasMore(res?.pagination?.hasNextPage);

				if (pageToLoad === 1 || isRefresh) {
					setWorkOrders(incoming);   // reset list
				} else {
					setWorkOrders(prev => [...prev, ...incoming]); // append
				}

				setPage(pageToLoad + 1);
			}
		} catch (error: any) {
			console.log("error =", error);
			ToastAndroid.show(error?.message || "Something went wrong", ToastAndroid.LONG);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchWorkOrders(1, true);
		setRefreshing(false);
	};

	const renderWorkOrderItem = useCallback(
		({ item, index }: { item: WorkOrder, index: number }) => <WorkOrderCard key={index} item={item} isSelected={selectedId === item.id} />,
		[selectedId]
	);

	// 🚀 Infinite scroll
	const handleEndReached = () => {
		console.log("Reached end, loading next page...");
		if (loadingMore || loading || !hasMore) return;
		fetchWorkOrders(page);
	};

	useEffect(() => {
		// reset everything when tab changes
		setPage(1);
		setWorkOrders([]);
		setHasMore(true);

		fetchWorkOrders(1, true); // always load first page
	}, [selectedButton]);

	return (
		<>
			<View style={styles.buttonContainer}>
				{["Assigned To Me", "Created By Me", "Open For All"].map((text, index) => (
					<Pressable
						key={index}
						style={[
							styles.filterButton,
							{ backgroundColor: selectedButton === index ? "#3F009A" : "#3F009A14" }
						]}
						onPress={() => setSelectedButton(index)}
					>
						<Text
							style={[
								styles.buttonText,
								{
									color: selectedButton === index ? "#FFFFFF" : "#000000",
									fontFamily: selectedButton === index ? Fonts.regular : Fonts.extraLight
								}
							]}
						>
							{text}
						</Text>
					</Pressable>
				))}

			</View>

			{
				loading && <View style={{ marginTop: 20 }}>
					<ActivityIndicator size={28} />
				</View>
			}

			<FlatList
				data={workOrders}
				keyExtractor={(item, index) => index.toString()}
				renderItem={renderWorkOrderItem}
				removeClippedSubviews={false}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				contentContainerStyle={styles.listContainer}
				onEndReached={handleEndReached}
				onEndReachedThreshold={0.4}
				ListFooterComponent={
					loadingMore ? (
						<ActivityIndicator size={28} />
					) : null
				}
			/>
		</>
	)
}

const styles = StyleSheet.create({
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 5
	},
	filterButton: {
		borderWidth: 0.2,
		borderColor: "#FFFFFF66",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 5,
		paddingHorizontal: 10
	},
	buttonText: {
		fontSize: 10,
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingVertical: 12
	}
})
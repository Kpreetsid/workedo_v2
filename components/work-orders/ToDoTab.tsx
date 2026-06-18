import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	View,
	ScrollView,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Fonts from "@/constants/Typography";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { getWorkOrders } from "@/src/services/work-order.service";
import { WorkOrder } from "@/src/types/workOrder";
import { useAuthStore } from "@/src/store/useAuthStore";
import {
	WORKER_QUEUE_FILTERS,
	WorkerQueueFilterId,
	buildWorkerQueueCounts,
	filterWorkerQueueOrders,
} from "@/src/utils/workerWorkOrders";

const FILTER_ACCENT = "#1F6FEB";

const FILTER_EMPTY_MESSAGES: Record<WorkerQueueFilterId, string> = {
	assigned: "No active work orders are assigned to you right now.",
	dueToday: "Nothing assigned to you is due today.",
	inProgress: "You do not have any work orders in progress.",
	blockedWaiting: "You do not have any blocked or waiting work orders.",
	allOpen: "No open work orders found.",
};

export default function ToDoTab() {
	const { user } = useAuthStore();
	const [searchText, setSearchText] = useState("");
	const [selectedFilter, setSelectedFilter] = useState<WorkerQueueFilterId>("assigned");
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const fetchWorkOrders = async (isRefresh = false) => {
		if (isRefresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		try {
			const response = await getWorkOrders("todo");
			const nextOrders = Array.isArray(response?.data) ? (response.data as WorkOrder[]) : [];
			setWorkOrders(nextOrders);
		} catch (error) {
			console.log("worker queue fetch error", error);
			setWorkOrders([]);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchWorkOrders();
		}, [])
	);

	const counts = useMemo(() => buildWorkerQueueCounts(workOrders, user), [workOrders, user]);

	const filteredOrders = useMemo(
		() => filterWorkerQueueOrders(workOrders, selectedFilter, user, searchText),
		[searchText, selectedFilter, user, workOrders]
	);

	const renderWorkOrder = useCallback(
		({ item }: { item: WorkOrder }) => <WorkOrderCard item={item} variant="worker" currentUser={user} />,
		[user]
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={filteredOrders}
				keyExtractor={(item, index) => `${item.id || item._id || item.order_no}-${index}`}
				renderItem={renderWorkOrder}
				style={styles.list}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchWorkOrders(true)} tintColor={FILTER_ACCENT} />}
				contentContainerStyle={[
					styles.listContent,
					filteredOrders.length === 0 && !loading ? styles.emptyListContent : undefined,
				]}
				ListHeaderComponent={(
					<View>
						<View style={styles.searchShell}>
							<Ionicons name="search" size={16} color="#64748B" />
							<TextInput
								value={searchText}
								onChangeText={setSearchText}
								placeholder="Search order, asset, location, or assignee"
								placeholderTextColor="#94A3B8"
								style={styles.searchInput}
							/>
							{searchText ? (
								<Pressable onPress={() => setSearchText("")} hitSlop={8}>
									<Ionicons name="close-circle" size={18} color="#94A3B8" />
								</Pressable>
							) : null}
						</View>

						{/* <View style={styles.filterRow}>
							{WORKER_QUEUE_FILTERS.map((filter) => {
								const isActive = selectedFilter === filter.id;
								const count = counts[filter.id];
								return (
									<Pressable
										key={filter.id}
										style={[styles.filterChip, isActive && styles.filterChipActive]}
										onPress={() => setSelectedFilter(filter.id)}
									>
										<Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
											{filter.label}
										</Text>
										<View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
											<Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>{count}</Text>
										</View>
									</Pressable>
								);
							})}
						</View> */}
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.filterRow}
							>
							{WORKER_QUEUE_FILTERS.map((filter) => {
								const isActive = selectedFilter === filter.id;
								const count = counts[filter.id];

								return (
								<Pressable
									key={filter.id}
									style={[styles.filterChip, isActive && styles.filterChipActive]}
									onPress={() => setSelectedFilter(filter.id)}
								>
									<Text
									style={[
										styles.filterChipText,
										isActive && styles.filterChipTextActive,
									]}
									>
									{filter.label}
									</Text>

									<View
									style={[
										styles.filterCountBadge,
										isActive && styles.filterCountBadgeActive,
									]}
									>
									<Text
										style={[
										styles.filterCountText,
										isActive && styles.filterCountTextActive,
										]}
									>
										{count}
									</Text>
									</View>
								</Pressable>
								);
							})}
							</ScrollView>
					</View>
				)}
				ListEmptyComponent={
					loading ? (
						<View style={styles.emptyState}>
							<ActivityIndicator size={28} color={FILTER_ACCENT} />
							<Text style={styles.emptyText}>Loading your work queue...</Text>
						</View>
					) : (
						<View style={styles.emptyState}>
							<Ionicons name="briefcase-outline" size={24} color="#94A3B8" />
							<Text style={styles.emptyTitle}>Nothing here yet</Text>
							<Text style={styles.emptyText}>{FILTER_EMPTY_MESSAGES[selectedFilter]}</Text>
						</View>
					)
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	searchShell: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#CBD5E1",
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 12,
		paddingVertical: 2,
		marginBottom: 12,
	},
	searchInput: {
		flex: 1,
		height: 42,
		fontFamily: Fonts.regular,
		fontSize: 13,
		color: "#0F172A",
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 16,
		paddingBottom: 24,
		paddingTop: 12,
	},
	emptyListContent: {
		flexGrow: 1,
	},
	filterRow: {
		gap: 6,
		paddingBottom: 6,
	},
	filterChip: {
		// flexDirection: "row",
		alignItems: "center",
		gap: 4,
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 16,
		backgroundColor: "#FFF",
		borderWidth: 1,
		borderColor: "#CBD5E1",
	},
	filterChipActive: {
		backgroundColor: FILTER_ACCENT,
		borderColor: FILTER_ACCENT,
	},
	filterChipText: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: "#334155",
	},
	filterChipTextActive: {
		color: "#FFFFFF",
	},
	filterCountBadge: {
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		paddingHorizontal: 4,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#E2E8F0",
	},
	filterCountBadgeActive: {
		backgroundColor: "#FFFFFF24",
	},
	filterCountText: {
		fontFamily: Fonts.semiBold,
		fontSize: 10,
		color: "#0F172A",
	},
	filterCountTextActive: {
		color: "#FFFFFF",
	},
	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		gap: 10,
	},
	emptyTitle: {
		fontFamily: Fonts.semiBold,
		fontSize: 16,
		color: "#0F172A",
	},
	emptyText: {
		fontFamily: Fonts.regular,
		fontSize: 13,
		lineHeight: 19,
		color: "#64748B",
		textAlign: "center",
	},
});

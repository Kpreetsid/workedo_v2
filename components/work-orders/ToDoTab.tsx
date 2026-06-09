import {
	ActivityIndicator,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	View,
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

const FILTER_TITLES: Record<WorkerQueueFilterId, string> = {
	assigned: "Assigned to me",
	dueToday: "Due today",
	inProgress: "In progress",
	blockedWaiting: "Blocked or waiting",
	allOpen: "All open",
};

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

	const queueSummary = useMemo(() => {
		const totalAssigned = counts.assigned;
		const totalDueToday = counts.dueToday;
		const totalBlockedWaiting = counts.blockedWaiting;
		const totalInProgress = counts.inProgress;

		if (selectedFilter === "assigned") {
			return totalAssigned > 0
				? `${totalAssigned} active work order${totalAssigned === 1 ? "" : "s"} assigned to you.`
				: "You are clear right now. New assignments will show up here first.";
		}

		if (selectedFilter === "dueToday") {
			return totalDueToday > 0
				? `${totalDueToday} assigned work order${totalDueToday === 1 ? "" : "s"} needs attention today.`
				: "Nothing assigned to you is due today.";
		}

		if (selectedFilter === "inProgress") {
			return totalInProgress > 0
				? `${totalInProgress} work order${totalInProgress === 1 ? "" : "s"} is already in motion.`
				: "No in-progress work orders yet.";
		}

		if (selectedFilter === "blockedWaiting") {
			return totalBlockedWaiting > 0
				? `${totalBlockedWaiting} work order${totalBlockedWaiting === 1 ? "" : "s"} needs unblock or follow-up.`
				: "No blocked or waiting jobs assigned to you.";
		}

		return `${counts.allOpen} open work order${counts.allOpen === 1 ? "" : "s"} is visible in mobile.`;
	}, [counts, selectedFilter]);

	const renderWorkOrder = useCallback(
		({ item }: { item: WorkOrder }) => <WorkOrderCard item={item} variant="worker" currentUser={user} />,
		[user]
	);

	return (
		<View style={styles.container}>
			<View style={styles.heroCard}>
				<View style={styles.heroTopRow}>
					<View style={{ flex: 1 }}>
						<Text style={styles.heroEyebrow}>Worker queue</Text>
						<Text style={styles.heroTitle}>My Work</Text>
						<Text style={styles.heroSubtitle}>
							Use this screen to find assigned jobs fast, spot blockers, and jump straight into execution work.
						</Text>
					</View>
					<View style={styles.heroCountCard}>
						<Text style={styles.heroCountValue}>{counts.assigned}</Text>
						<Text style={styles.heroCountLabel}>Assigned</Text>
					</View>
				</View>

				<View style={styles.quickStatsRow}>
					<View style={styles.quickStatCard}>
						<Text style={styles.quickStatLabel}>Due Today</Text>
						<Text style={styles.quickStatValue}>{counts.dueToday}</Text>
					</View>
					<View style={styles.quickStatCard}>
						<Text style={styles.quickStatLabel}>In Progress</Text>
						<Text style={styles.quickStatValue}>{counts.inProgress}</Text>
					</View>
					<View style={styles.quickStatCard}>
						<Text style={styles.quickStatLabel}>Blocked</Text>
						<Text style={styles.quickStatValue}>{counts.blockedWaiting}</Text>
					</View>
				</View>

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
			</View>

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
						<View style={styles.filterRow}>
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
						</View>

						<View style={styles.activeFilterCard}>
							<Text style={styles.activeFilterTitle}>{FILTER_TITLES[selectedFilter]}</Text>
							<Text style={styles.activeFilterHelper}>
								{WORKER_QUEUE_FILTERS.find((filter) => filter.id === selectedFilter)?.helper}
							</Text>
							<Text style={styles.activeFilterSummary}>{queueSummary}</Text>
						</View>
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
	heroCard: {
		marginHorizontal: 16,
		marginTop: 12,
		marginBottom: 10,
		padding: 16,
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E2E8F0",
		shadowColor: "#0F172A",
		shadowOpacity: 0.05,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
		gap: 14,
	},
	heroTopRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 12,
	},
	heroEyebrow: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: FILTER_ACCENT,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	heroTitle: {
		fontFamily: Fonts.bold,
		fontSize: 22,
		color: "#0F172A",
		marginTop: 2,
	},
	heroSubtitle: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		lineHeight: 18,
		color: "#475569",
		marginTop: 6,
	},
	heroCountCard: {
		minWidth: 88,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderRadius: 14,
		backgroundColor: "#EEF4FF",
		alignItems: "center",
	},
	heroCountValue: {
		fontFamily: Fonts.bold,
		fontSize: 26,
		color: "#1D4ED8",
	},
	heroCountLabel: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: "#1E40AF",
		marginTop: 4,
	},
	quickStatsRow: {
		flexDirection: "row",
		gap: 10,
	},
	quickStatCard: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderRadius: 12,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E2E8F0",
	},
	quickStatLabel: {
		fontFamily: Fonts.medium,
		fontSize: 11,
		color: "#64748B",
	},
	quickStatValue: {
		fontFamily: Fonts.bold,
		fontSize: 20,
		color: "#0F172A",
		marginTop: 6,
	},
	searchShell: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#CBD5E1",
		backgroundColor: "#F8FAFC",
		paddingHorizontal: 12,
		paddingVertical: 2,
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
	},
	emptyListContent: {
		flexGrow: 1,
	},
	filterRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginBottom: 12,
	},
	filterChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 999,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#CBD5E1",
	},
	filterChipActive: {
		backgroundColor: FILTER_ACCENT,
		borderColor: FILTER_ACCENT,
	},
	filterChipText: {
		fontFamily: Fonts.medium,
		fontSize: 12,
		color: "#334155",
	},
	filterChipTextActive: {
		color: "#FFFFFF",
	},
	filterCountBadge: {
		minWidth: 22,
		height: 22,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 999,
		backgroundColor: "#E2E8F0",
		paddingHorizontal: 6,
	},
	filterCountBadgeActive: {
		backgroundColor: "#FFFFFF24",
	},
	filterCountText: {
		fontFamily: Fonts.semiBold,
		fontSize: 11,
		color: "#0F172A",
	},
	filterCountTextActive: {
		color: "#FFFFFF",
	},
	activeFilterCard: {
		backgroundColor: "#F8FAFC",
		borderRadius: 14,
		padding: 14,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		marginBottom: 14,
	},
	activeFilterTitle: {
		fontFamily: Fonts.bold,
		fontSize: 16,
		color: "#0F172A",
	},
	activeFilterHelper: {
		fontFamily: Fonts.medium,
		fontSize: 12,
		color: "#475569",
		marginTop: 4,
	},
	activeFilterSummary: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		color: "#334155",
		marginTop: 8,
		lineHeight: 18,
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

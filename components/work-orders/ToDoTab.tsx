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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Fonts from "@/constants/Typography";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { getWorkOrdersPaginated } from "@/src/services/work-order.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { WorkOrder } from "@/src/types/workOrder";
import { isAssignedToUser, isCreatedByUser } from "@/src/utils/workerWorkOrders";

const FILTER_ACCENT = "#1F6FEB";
const PAGE_SIZE = 25;
const MY_WORK_STATUSES = [
	"Open",
	"Blocked",
	"Waiting-on-Parts",
	"Waiting-on-Permit",
	"In-Progress",
	"On-Hold",
	"Approved",
	"Rejected",
] as const;
type SummaryBucketKey = "assignedToMe" | "createdByMe";
type SummaryBucketPaginationState = {
	page: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	loaded: boolean;
};

const mergeWorkOrders = (current: WorkOrder[], incoming: WorkOrder[]) => {
	const merged = [...current];
	const seenIds = new Set(current.map((order) => String(order?.id || order?._id || order?.order_no || "")));

	for (const order of incoming) {
		const orderId = String(order?.id || order?._id || order?.order_no || "");
		if (orderId && seenIds.has(orderId)) {
			continue;
		}

		merged.push(order);
		if (orderId) {
			seenIds.add(orderId);
		}
	}

	return merged;
};

const createEmptyBucketState = (): Record<SummaryBucketKey, SummaryBucketPaginationState> => ({
	assignedToMe: { page: 0, totalItems: 0, totalPages: 0, hasNextPage: true, loaded: false },
	createdByMe: { page: 0, totalItems: 0, totalPages: 0, hasNextPage: true, loaded: false },
});

const getSearchHaystack = (workOrder: WorkOrder) => {
	const assetName = workOrder?.asset?.asset_name || "";
	const locationName = workOrder?.location?.location_name || "";
	const reporter = (workOrder as WorkOrder & { reporter?: any })?.reporter;
	const creatorName = [
		workOrder?.createdBy?.firstName,
		workOrder?.createdBy?.lastName,
		workOrder?.createdBy?.username,
		reporter?.firstName,
		reporter?.lastName,
		reporter?.username,
	]
		.filter(Boolean)
		.join(" ");
	const assigneeNames = (Array.isArray(workOrder?.assignedUsers) ? workOrder.assignedUsers : [])
		.map((entry: any) => [entry?.user?.firstName, entry?.user?.lastName].filter(Boolean).join(" "))
		.filter(Boolean)
		.join(" ");

	return [
		workOrder?.order_no,
		workOrder?.title,
		workOrder?.description,
		workOrder?.priority,
		workOrder?.status,
		assetName,
		locationName,
		creatorName,
		assigneeNames,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
};

export default function ToDoTab() {
	const { user } = useAuthStore();
	const [searchText, setSearchText] = useState("");
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [bucketState, setBucketState] = useState<Record<SummaryBucketKey, SummaryBucketPaginationState>>(createEmptyBucketState);
	const [selectedSection, setSelectedSection] = useState<SummaryBucketKey>("assignedToMe");

	const getSummaryRequestParams = useCallback((bucketKey: SummaryBucketKey, page: number, limit: number) => {
		return {
			page,
			limit,
			pageType: bucketKey,
			sort: "createdAt",
			order: "desc",
			status: [...MY_WORK_STATUSES],
		};
	}, []);

	const matchesSummaryBucket = useCallback(
		(bucketKey: SummaryBucketKey, workOrder: WorkOrder) => {
			const isAssigned = isAssignedToUser(workOrder, user);
			const isCreated = isCreatedByUser(workOrder, user);
			const isCompleted = String(workOrder?.status || "").trim() === "Completed";

			switch (bucketKey) {
				case "assignedToMe":
					return !isCompleted && isAssigned;
				case "createdByMe":
					return !isCompleted && !isAssigned && isCreated;
				default:
					return false;
			}
		},
		[user]
	);

	const hasNextSummaryPage = useCallback((state: Record<SummaryBucketKey, SummaryBucketPaginationState>) => {
		return (["assignedToMe", "createdByMe"] as SummaryBucketKey[]).some((bucketKey) => {
			const bucket = state[bucketKey];
			return !bucket.loaded || bucket.hasNextPage;
		});
	}, []);

	const fetchSummaryBucketPage = useCallback(
		async (
			state: Record<SummaryBucketKey, SummaryBucketPaginationState>,
			bucketKey: SummaryBucketKey
		): Promise<{
			rows: WorkOrder[];
			nextState: SummaryBucketPaginationState;
		}> => {
			const currentBucketState = state[bucketKey];
			if (currentBucketState.loaded && !currentBucketState.hasNextPage) {
				return { rows: [], nextState: currentBucketState };
			}

			const nextPage = currentBucketState.page + 1;
			const response = await getWorkOrdersPaginated(getSummaryRequestParams(bucketKey, nextPage, PAGE_SIZE));
			const rows = Array.isArray(response?.data) ? (response.data as WorkOrder[]) : [];
			const filteredRows = rows.filter((order) => matchesSummaryBucket(bucketKey, order));

			return {
				rows: filteredRows,
				nextState: {
					page: Number(response?.pagination?.page || nextPage),
					totalItems: Number(response?.pagination?.totalItems || 0),
					totalPages: Number(response?.pagination?.totalPages || 0),
					hasNextPage: Boolean(response?.pagination?.hasNextPage),
					loaded: true,
				},
			};
		},
		[getSummaryRequestParams, matchesSummaryBucket]
	);

	const fetchWorkOrders = async (options: { reset?: boolean; refresh?: boolean } = {}) => {
		const reset = Boolean(options.reset);
		const isRefresh = Boolean(options.refresh);
		const workingBucketState = reset ? createEmptyBucketState() : bucketState;

		if (loadingMore && !reset) {
			return;
		}

		if (isRefresh) {
			setRefreshing(true);
		} else if (reset) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			const requestBucketKeys = (["assignedToMe", "createdByMe"] as SummaryBucketKey[]).filter((key) => {
				const bucket = workingBucketState[key];
				return !bucket.loaded || bucket.hasNextPage;
			});

			if (!requestBucketKeys.length) {
				setHasNextPage(false);
				return;
			}

			const results = await Promise.all(
				requestBucketKeys.map((bucketKey) => fetchSummaryBucketPage(workingBucketState, bucketKey))
			);

			const nextBucketState = { ...workingBucketState };
			requestBucketKeys.forEach((bucketKey, index) => {
				nextBucketState[bucketKey] = results[index].nextState;
			});

			const nextOrders = results.flatMap((result) => result.rows);
			setBucketState(nextBucketState);
			setWorkOrders((current) => (reset ? nextOrders : mergeWorkOrders(current, nextOrders)));
			setHasNextPage(hasNextSummaryPage(nextBucketState));
		} catch (error) {
			console.log("worker queue fetch error", error);
			if (reset) {
				setWorkOrders([]);
				setBucketState(createEmptyBucketState());
				setHasNextPage(false);
			}
		} finally {
			setLoading(false);
			setRefreshing(false);
			setLoadingMore(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchWorkOrders({ reset: true });
			return () => {
				setSearchText("");
			};
		}, [])
	);

	const normalizedSearch = useMemo(() => String(searchText || "").trim().toLowerCase(), [searchText]);

	const assignedOrders = useMemo(
		() =>
			workOrders
				.filter((workOrder) => isAssignedToUser(workOrder, user))
				.filter((workOrder) => !normalizedSearch || getSearchHaystack(workOrder).includes(normalizedSearch)),
		[normalizedSearch, user, workOrders]
	);

	const createdByMeOrders = useMemo(
		() =>
			workOrders
				.filter((workOrder) => !isAssignedToUser(workOrder, user))
				.filter((workOrder) => isCreatedByUser(workOrder, user))
				.filter((workOrder) => !normalizedSearch || getSearchHaystack(workOrder).includes(normalizedSearch)),
		[normalizedSearch, user, workOrders]
	);

	useEffect(() => {
		if (selectedSection === "assignedToMe" && !assignedOrders.length && createdByMeOrders.length) {
			setSelectedSection("createdByMe");
			return;
		}

		if (selectedSection === "createdByMe" && !createdByMeOrders.length && assignedOrders.length) {
			setSelectedSection("assignedToMe");
		}
	}, [assignedOrders.length, createdByMeOrders.length, selectedSection]);

	const sectionOptions = useMemo(
		() => [
			{
				key: "assignedToMe" as const,
				label: "Assigned to Me",
				helper: "Jobs owned by you",
				count: assignedOrders.length,
			},
			{
				key: "createdByMe" as const,
				label: "Created by Me",
				helper: "Jobs you raised",
				count: createdByMeOrders.length,
			},
		],
		[assignedOrders.length, createdByMeOrders.length]
	);

	const visibleOrders = useMemo(
		() => (selectedSection === "assignedToMe" ? assignedOrders : createdByMeOrders),
		[assignedOrders, createdByMeOrders, selectedSection]
	);

	const renderRow = useCallback(
		({ item }: { item: WorkOrder }) => <WorkOrderCard item={item} variant="worker" currentUser={user} />,
		[user]
	);

	const renderSectionChip = useCallback(
		(section: { key: SummaryBucketKey; label: string; helper: string; count: number }) => {
			const isActive = section.key === selectedSection;

			return (
				<Pressable
					key={section.key}
					style={[styles.sectionChip, isActive && styles.sectionChipActive]}
					onPress={() => setSelectedSection(section.key)}
				>
					<View style={styles.sectionChipTopRow}>
						<Text style={[styles.sectionChipLabel, isActive && styles.sectionChipLabelActive]}>{section.label}</Text>
						<View style={[styles.sectionChipCountBadge, isActive && styles.sectionChipCountBadgeActive]}>
							<Text style={[styles.sectionChipCountText, isActive && styles.sectionChipCountTextActive]}>
								{section.count}
							</Text>
						</View>
					</View>
					<Text style={[styles.sectionChipHelper, isActive && styles.sectionChipHelperActive]}>{section.helper}</Text>
				</Pressable>
			);
		},
		[selectedSection]
	);

	const handleLoadMore = useCallback(() => {
		if (loading || refreshing || loadingMore || !hasNextPage) {
			return;
		}

		fetchWorkOrders();
	}, [hasNextPage, loading, loadingMore, refreshing]);

	return (
		<View style={styles.container}>
			<FlatList
				data={visibleOrders}
				keyExtractor={(item, index) => `${item.id || item._id || item.order_no}-${selectedSection}-${index}`}
				renderItem={renderRow}
				style={styles.list}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={() => fetchWorkOrders({ reset: true, refresh: true })}
						tintColor={FILTER_ACCENT}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.35}
				contentContainerStyle={[
					styles.listContent,
					visibleOrders.length === 0 && !loading ? styles.emptyListContent : undefined,
				]}
				ListHeaderComponent={
					<View style={styles.headerBlock}>
						<View style={styles.searchShell}>
							<Ionicons name="search" size={16} color="#64748B" />
							<TextInput
								value={searchText}
								onChangeText={setSearchText}
								placeholder="Search order, asset, location, or creator"
								placeholderTextColor="#94A3B8"
								style={styles.searchInput}
							/>
							{searchText ? (
								<Pressable onPress={() => setSearchText("")} hitSlop={8}>
									<Ionicons name="close-circle" size={18} color="#94A3B8" />
								</Pressable>
							) : null}
						</View>

						<View style={styles.sectionSwitcherRow}>{sectionOptions.map(renderSectionChip)}</View>
					</View>
				}
				ListFooterComponent={
					loadingMore ? (
						<View style={styles.footerLoader}>
							<ActivityIndicator size="small" color={FILTER_ACCENT} />
							<Text style={styles.footerLoaderText}>Loading more work orders...</Text>
						</View>
					) : null
				}
				ListEmptyComponent={
					loading ? (
						<View style={styles.emptyState}>
							<ActivityIndicator size={28} color={FILTER_ACCENT} />
							<Text style={styles.emptyText}>Loading your work queue...</Text>
						</View>
					) : (
						<View style={styles.emptyState}>
							<Ionicons name="briefcase-outline" size={24} color="#94A3B8" />
							<Text style={styles.emptyTitle}>No work orders found</Text>
							<Text style={styles.emptyText}>
								{selectedSection === "assignedToMe"
									? "You do not have any active work orders assigned to you right now."
									: "You do not have any active work orders created by you right now."}
							</Text>
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
	headerBlock: {
		marginBottom: 6,
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
	sectionSwitcherRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 12,
	},
	sectionChip: {
		flex: 1,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#E2E8F0",
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 12,
		paddingVertical: 12,
	},
	sectionChipActive: {
		borderColor: "#C084FC",
		backgroundColor: "#FCFAFF",
	},
	sectionChipTopRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 8,
	},
	sectionChipLabel: {
		flex: 1,
		fontFamily: Fonts.semiBold,
		fontSize: 13,
		color: "#0F172A",
	},
	sectionChipLabelActive: {
		color: "#6D28D9",
	},
	sectionChipHelper: {
		marginTop: 6,
		fontFamily: Fonts.regular,
		fontSize: 11,
		lineHeight: 16,
		color: "#64748B",
	},
	sectionChipHelperActive: {
		color: "#7C3AED",
	},
	sectionChipCountBadge: {
		minWidth: 28,
		height: 24,
		borderRadius: 999,
		paddingHorizontal: 8,
		backgroundColor: "#EEF2F6",
		alignItems: "center",
		justifyContent: "center",
	},
	sectionChipCountBadgeActive: {
		backgroundColor: "#E9D5FF",
	},
	sectionChipCountText: {
		fontFamily: Fonts.semiBold,
		fontSize: 11,
		color: "#475467",
	},
	sectionChipCountTextActive: {
		color: "#6D28D9",
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
	footerLoader: {
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	footerLoaderText: {
		fontFamily: Fonts.regular,
		fontSize: 11,
		color: "#64748B",
	},
});

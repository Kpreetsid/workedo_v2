import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import Fonts from "@/constants/Typography";
import { alarmsHistory } from "@/src/services/alarms.service";
import { AlarmItem } from "@/src/types/alarm";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import moment from "moment";
import { FlashList } from "@shopify/flash-list";

const TABS = ["Un-Addressed", "Addressed"] as const;
type TabType = (typeof TABS)[number];

export default function Alarms() {
	const [selectedTab, setSelectedTab] = useState<TabType>("Un-Addressed");
	const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
	const indicatorX = useSharedValue(0);
	const indicatorWidth = useSharedValue(0);

	// data per tab
	const [addressedData, setAddressedData] = useState<AlarmItem[]>([]);
	const [unAddressedData, setUnAddressedData] = useState<AlarmItem[]>([]);

	// pagination per tab
	const [pageByTab, setPageByTab] = useState<{ [K in TabType]: number }>({
		"Un-Addressed": 1,
		"Addressed": 1,
	});
	const [hasMoreByTab, setHasMoreByTab] = useState<{ [K in TabType]: boolean }>({
		"Un-Addressed": true,
		"Addressed": true,
	});

	// loading flags
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);

	// request in-flight locks per tab to prevent duplicate calls
	const inFlightByTab = useRef<{ [K in TabType]: boolean }>({
		"Un-Addressed": false,
		"Addressed": false,
	});

	// FlashList end-reached momentum guard (prevents multiple rapid fires)
	const canLoadMoreRef = useRef(true);

	const { childAssets } = useOverviewStore(); // not used in payload below, but kept for future

	const setActivePage = (tab: TabType, updater: (p: number) => number) =>
		setPageByTab((prev) => ({ ...prev, [tab]: updater(prev[tab]) }));

	const currentData = useMemo(
		() => (selectedTab === "Un-Addressed" ? unAddressedData : addressedData),
		[selectedTab, unAddressedData, addressedData]
	);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }],
		width: indicatorWidth.value,
	}));

	const fetchAlarmsHistory = async (opts: { tab: TabType; reset?: boolean }) => {
		const { tab, reset = false } = opts;

		// hard guard to avoid duplicate requests for same tab
		if (inFlightByTab.current[tab]) return;
		inFlightByTab.current[tab] = true;

		const pageNo = reset ? 1 : pageByTab[tab];

		const payload = {
			// asset_list: [
			//   "63c7f822736aba41f8729c33",
			//   "63c7f85c736aba41f8729c34",
			//   "63c7f867736aba41f8729c35",
			// ],
			asset_list: childAssets.map((item) => item.id),
			pageNo,
			selectedTab: tab === "Un-Addressed" ? "unAddressedAlarms" : "addressedAlarms",
		};

		try {
			const res = await alarmsHistory(payload);
			console.log('res = ', res)
			const newAddressed = (res?.addressedAlarms ?? []) as AlarmItem[];
			const newUnAddressed = (res?.unAddressedAlarms ?? []) as AlarmItem[];

			if (tab === "Un-Addressed") {
				setUnAddressedData((prev) => (reset ? newUnAddressed : [...prev, ...newUnAddressed]));
				setHasMoreByTab((prev) => ({
					...prev,
					["Un-Addressed"]: newUnAddressed.length > 0, // or use res.hasMore if provided
				}));
			} else {
				setAddressedData((prev) => (reset ? newAddressed : [...prev, ...newAddressed]));
				setHasMoreByTab((prev) => ({
					...prev,
					["Addressed"]: newAddressed.length > 0,
				}));
			}

			// only bump page for non-reset calls where new items arrived
			if (!reset) {
				const gotItems = tab === "Un-Addressed" ? newUnAddressed.length > 0 : newAddressed.length > 0;
				if (gotItems) setActivePage(tab, (p) => p + 1);
			} else {
				// ensure page is 2 after a reset if we got anything (so next fetch will request page 2)
				const gotItems = tab === "Un-Addressed" ? newUnAddressed.length > 0 : newAddressed.length > 0;
				setActivePage(tab, () => (gotItems ? 2 : 1));
			}
		} finally {
			inFlightByTab.current[tab] = false;
		}
	};

	// initial load for default tab
	useEffect(() => {
		// If you require childAssets, gate here:
		// if (childAssets.length === 0) return;
		fetchAlarmsHistory({ tab: selectedTab, reset: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // run once

	// when tab changes: reset that tab and fetch page 1
	useEffect(() => {
		setPageByTab((prev) => ({ ...prev, [selectedTab]: 1 }));
		setHasMoreByTab((prev) => ({ ...prev, [selectedTab]: true }));
		fetchAlarmsHistory({ tab: selectedTab, reset: true });
		// reset momentum guard for new list
		canLoadMoreRef.current = true;
	}, [selectedTab]);

	// ---- UI handlers ----
	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchAlarmsHistory({ tab: selectedTab, reset: true });
		setRefreshing(false);
	};

	const handleEndReached = async () => {
		if (!canLoadMoreRef.current) return;               // momentum guard
		if (loadingMore) return;                           // already loading
		if (!hasMoreByTab[selectedTab]) return;            // no more data
		if (inFlightByTab.current[selectedTab]) return;    // request in-flight

		setLoadingMore(true);
		try {
			await fetchAlarmsHistory({ tab: selectedTab, reset: false });
		} finally {
			setLoadingMore(false);
			// prevent additional calls until momentum starts again
			canLoadMoreRef.current = false;
		}
	};

	const onMomentumScrollBegin = () => {
		canLoadMoreRef.current = true;
	};

	const handleTabLayout = (e: LayoutChangeEvent, index: number) => {
		const { x, width } = e.nativeEvent.layout;
		setTabLayouts((prev) => {
			const next = [...prev];
			next[index] = { x, width };
			return next;
		});
		if (index === 0 && selectedTab === "Un-Addressed") {
			indicatorX.value = x;
			indicatorWidth.value = width;
		}
	};

	const handleTabPress = (tab: TabType, index: number) => {
		setSelectedTab(tab);
		const layout = tabLayouts[index];
		if (layout) {
			indicatorX.value = withTiming(layout.x, { duration: 200 });
			indicatorWidth.value = withTiming(layout.width, { duration: 200 });
		}
	};

	const renderCard = (item: AlarmItem) => (
		<View key={item.id} style={styles.card}>
			<View style={styles.cardHeader}>
				<View>
					<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
						<View>
							<Text style={styles.assetTitle}>{item.sensor_location}</Text>
							<Text style={styles.assetSubtitle}>
								{item.signal_type} - {item.trend_type}
							</Text>
						</View>

						<View style={[styles.statusTag, item.priority === "Critical" ? styles.dangerTag : styles.resolvedTag]}>
							<View style={[styles.statusDot, { backgroundColor: item.priority === "Critical" ? "#FF5C5C" : "#4CAF50" }]} />
							<Text style={[styles.statusText, { color: item.priority === "Critical" ? "#FF5C5C" : "#4CAF50" }]}>
								{item.priority}
							</Text>
						</View>
					</View>

					<View style={[styles.row, { width: "100%" }]}>
						<View>
							<Text style={styles.smallLabel}>Set Threshold</Text>
							<Text style={styles.value}>{item.threshold_value}</Text>
						</View>
						<View>
							<Text style={styles.smallLabel}>Observed Value</Text>
							<Text style={styles.value}>{item.observed_value}</Text>
						</View>
					</View>
				</View>
			</View>

			<Text style={styles.timestamp}>{moment(item.timestamp).format("MMM DD, YYYY, h:mm A")}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Alarms</Text>

			<View style={styles.tabsContainer}>
				<View style={styles.tabRow}>
					{TABS.map((tab, index) => (
						<TouchableOpacity
							key={tab}
							onLayout={(e) => handleTabLayout(e, index)}
							onPress={() => handleTabPress(tab, index)}
							style={styles.tab}
							activeOpacity={0.7}
						>
							<Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
						</TouchableOpacity>
					))}
					<Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
				</View>

				<View style={{ marginTop: 16 }}>
					<FlashList
						data={currentData}
						keyExtractor={(i) => String(i.id)}
						renderItem={({ item }) => renderCard(item)}
						// estimatedItemSize={132}
						refreshing={refreshing}
						onRefresh={handleRefresh}
						onEndReached={handleEndReached}
						onEndReachedThreshold={0.4}
						onMomentumScrollBegin={onMomentumScrollBegin}
						ListEmptyComponent={() => {
							return (
								// show no alarms found
								<View style={styles.noAlarmsFound}>
									<Text style={styles.noAlarmsFoundText}>No alarms found</Text>
								</View>
							);
						}}
						ListFooterComponent={
							loadingMore ? (
								<View style={{ paddingVertical: 12, alignItems: "center" }}>
									<Text style={{ color: "#999", fontSize: 12 }}>Loading more…</Text>
								</View>
							) : null
						}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		flex: 1, // ensure list gets height
	},
	title: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 12,
	},
	tabsContainer: {
		backgroundColor: "#fff",
		borderRadius: 15,
		paddingVertical: 10,
		shadowColor: "#000",
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		flex: 1, // allow list to expand
	},
	tabRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		position: "relative",
		paddingHorizontal: 20,
	},
	tab: {
		alignItems: "center",
		paddingVertical: 6,
	},
	tabText: {
		fontFamily: Fonts.medium,
		fontSize: 13,
		color: "#999",
	},
	activeTabText: {
		color: "#742BDE",
	},
	indicator: {
		height: 2,
		backgroundColor: "#742BDE",
		borderRadius: 2,
		position: "absolute",
		bottom: 0,
		left: 0,
	},
	card: {
		backgroundColor: "#D9D9D915",
		borderRadius: 14,
		padding: 16,
		marginBottom: 12,
		marginHorizontal: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "#D9D9D9",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		flexShrink: 1,
	},
	assetTitle: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
		marginBottom: 2,
	},
	assetSubtitle: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#666",
	},
	statusTag: {
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 3,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	dangerTag: {
		backgroundColor: "rgba(255, 92, 92, 0.1)",
	},
	resolvedTag: {
		backgroundColor: "rgba(76, 175, 80, 0.1)",
	},
	statusDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		marginRight: 4,
	},
	statusText: {
		fontSize: 11,
		fontFamily: Fonts.medium,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
		flexShrink: 1,
	},
	smallLabel: {
		fontSize: 11,
		color: "#A0A0A0",
		fontFamily: Fonts.regular,
	},
	value: {
		fontSize: 10,
		color: "#201F23",
		fontFamily: Fonts.medium,
		marginTop: 2,
	},
	timestamp: {
		alignSelf: "flex-end",
		fontSize: 9,
		color: "#999",
		fontFamily: Fonts.light,
	},
	noAlarmsFound: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 20,
	},
	noAlarmsFoundText: {
		fontSize: 14,
		fontFamily: Fonts.medium,
		color: "#999",
	},
});
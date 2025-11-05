import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import Fonts from "@/constants/Typography";
import { alarmsHistory } from "@/src/services/alarms.service";
import { AlarmItem } from "@/src/types/alarm";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import moment from "moment";
import { FlashList } from "@shopify/flash-list";
import AlarmCard from "../alarms/AlarmCard";

const TABS = ["Un-Addressed", "Addressed"] as const;
type TabType = (typeof TABS)[number];

export default function Alarms() {
	const [selectedTab, setSelectedTab] = useState<TabType>("Un-Addressed");
	const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
	const indicatorX = useSharedValue(0);
	const indicatorWidth = useSharedValue(0);

	const [data, setData] = useState<AlarmItem[]>([]);
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const { childAssets } = useOverviewStore();

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }],
		width: indicatorWidth.value,
	}));

	const fetchAlarmsHistory = async (nextPage = 1) => {
		if (loadingMore) return;
		setLoadingMore(true);

		const payload = {
			asset_list: childAssets.map((item) => item.id),
			selectedTab: selectedTab === "Un-Addressed" ? "unAddressedAlarms" : "addressedAlarms",
			page: nextPage,
		};

		console.log("payload for alarms = ", payload);

		try {
			const res = await alarmsHistory(payload);
			console.log("res = ", res);

			const newAlarms =
				(selectedTab === "Un-Addressed"
					? res?.unAddressedAlarms ?? []
					: res?.addressedAlarms ?? []) as AlarmItem[];

			// Attach asset names
			const alarmsWithName = newAlarms.map((alarm) => ({
				...alarm,
				asset_name: childAssets.find((a) => a.id === alarm.asset_id)?.asset_name,
			}));

			// Append or replace data
			if (nextPage === 1) {
				setData(alarmsWithName);
			} else {
				setData((prev) => [...prev, ...alarmsWithName]);
			}

			// ✅ if fewer results than expected, stop further calls
			if (newAlarms.length === 0 || newAlarms.length < 10) {
				setHasMore(false);
			}
		} catch (error) {
			console.log("error = ", error);
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		console.log('data = ', data)
	}, [data])

	// 🔁 reset when tab changes
	useEffect(() => {
		if (childAssets.length === 0) return;
		setPage(1);
		setHasMore(true);
		setData([]);
		fetchAlarmsHistory(1);
	}, [selectedTab, childAssets]);

	// 🚀 Infinite scroll
	const handleEndReached = () => {
		console.log("Reached end, loading next page...");
		if (loadingMore || !hasMore) return;
		setPage((prev) => prev + 1);
	};

	// ✅ fetch when page changes
	// useEffect(() => {
	// 	if (childAssets.length === 0) return;
	// 	fetchAlarmsHistory(page);
	// }, [page]);

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
						data={data}
						keyExtractor={(i) => String(i.id)}
						renderItem={({ item }) => AlarmCard(item)}
						onEndReached={handleEndReached}
						onEndReachedThreshold={0.4}
						// onMomentumScrollBegin={onMomentumScrollBegin}
						ListEmptyComponent={() => (
							<View style={styles.noAlarmsFound}>
								<Text style={styles.noAlarmsFoundText}>No alarms found</Text>
							</View>
						)}
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
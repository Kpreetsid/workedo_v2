import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	LayoutChangeEvent,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
} from "react-native-reanimated";
import Fonts from "@/constants/Typography";
import { alarmsHistory } from "@/src/services/alarms.service";
import { AlarmItem } from "@/src/types/alarm";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { FlashList } from "@shopify/flash-list";
import AlarmCard from "../alarms/AlarmCard";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

const TABS = ["Un-Addressed", "Addressed"] as const;
type TabType = (typeof TABS)[number];

export default function Alarms() {
	const [selectedTab, setSelectedTab] = useState<TabType>("Un-Addressed");

	const [data, setData] = useState<AlarmItem[]>([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const { childAssets } = useOverviewStore();
	const [loading, setLoading] = useState(false);

	// ----------------------------
	// TAB INDICATOR (UI ONLY)
	// ----------------------------
	const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
		[]
	);
	const indicatorX = useSharedValue(0);
	const indicatorWidth = useSharedValue(0);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: indicatorX.value }],
		width: indicatorWidth.value,
	}));

	// ----------------------------
	// FETCH ALARMS (PAGINATED)
	// ----------------------------
	const fetchAlarmsHistory = async (pageToLoad = 1) => {
		if (!childAssets.length) {
			setData([]);
			setPage(1);
			setTotalPages(1);
			setHasMore(false);
			setLoading(false);
			setLoadingMore(false);
			return;
		}

		setLoading(true)
		console.log('pageToLoad = ', pageToLoad)
		if (loadingMore) return;

		setLoadingMore(true);

		const payload = {
			asset_list: childAssets.map((item) => item.id),
			selectedTab:
				selectedTab === "Un-Addressed"
					? "unAddressedAlarms"
					: "addressedAlarms",
			pageNo: pageToLoad,
		};

		console.log('alarm payload = ', payload);

		try {
			const res = await alarmsHistory(payload);
			console.log(res)

			const newAlarms =
				selectedTab === "Un-Addressed"
					? res?.unAddressedAlarms ?? []
					: res?.addressedAlarms ?? [];

			const alarmsWithName = newAlarms.map((alarm: any) => ({
				...alarm,
				asset_name: childAssets.find(
					(a) => a.id === alarm.asset_id
				)?.asset_name,
			}));

			if (pageToLoad === 1) {
				setData(alarmsWithName);
			} else {
				// setData((prev) => [...prev, ...alarmsWithName]);
				setData(alarmsWithName);
			}

			const currentPage = pageToLoad;
			const total = res?.totalPages ?? 1;

			setPage(currentPage);
			setTotalPages(total);
			setHasMore(currentPage < total);
		} catch (error) {
			console.log("alarms error =", error);
		} finally {
			setLoadingMore(false);
			setLoading(false)
		}
	};

	// ----------------------------
	// RESET ON TAB / ASSET CHANGE
	// ----------------------------
	useEffect(() => {
		if (childAssets.length === 0) {
			setPage(1);
			setTotalPages(1);
			setHasMore(false);
			setData([]);
			setLoading(false);
			setLoadingMore(false);
			return;
		}

		setPage(1);
		setTotalPages(1);
		setHasMore(true);
		setData([]);

		fetchAlarmsHistory(1);
	}, [selectedTab, childAssets]);

	useEffect(() => {
		console.log(data)
	}, [data]);

	// ----------------------------
	// INFINITE SCROLL
	// ----------------------------
	const handleEndReached = () => {
		if (loadingMore) return;
		if (!hasMore) return;

		const nextPage = page + 1;
		fetchAlarmsHistory(nextPage);
	};

	// ----------------------------
	// TAB UI HELPERS
	// ----------------------------
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

	// ----------------------------
	// RENDER
	// ----------------------------
	return (
		<View style={styles.container}>
			<View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text style={styles.title}>Alarms</Text>

				<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
					{/* <Pressable style={{ backgroundColor: '#D9D9D9', width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 200 }}>
						<Ionicons name="chevron-back" size={20} />
					</Pressable> */}

					<Pressable style={{ backgroundColor: '#fff', width: 30, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 200 }} onPress={handleEndReached}>
						{
							loading ? <ActivityIndicator size="small" color="#742BDE" /> : <Ionicons name="chevron-forward" size={20} />
						}
					</Pressable>
				</View>
			</View>

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
							{/* <Image source={require('../../assets/images/Addressed.png')} style={{ width: 20, height: 20 }} /> */}
							{tab === "Un-Addressed" ? (
								<Ionicons
									name="alert-circle-outline"
									size={20}
									style={styles.tabIcon}
									color={selectedTab === tab ? "#742BDE" : "#999"}
								/>
							) : (
								<Ionicons
									name="checkmark-circle-outline"
									size={20}
									style={styles.tabIcon}
									color={selectedTab === tab ? "#742BDE" : "#999"}
								/>
							)}

							<Text
								style={[
									styles.tabText,
									selectedTab === tab && styles.activeTabText,
								]}
							>
								{tab}
							</Text>
						</TouchableOpacity>
					))}
					<Animated.View
						pointerEvents="none"
						style={[styles.indicator, indicatorStyle]}
					/>
				</View>

				{
					loading && <View style={{ marginVertical: 5 }}>
						<ActivityIndicator size="small" color="#742BDE" />
					</View>
				}

				<View style={{ flex: 1, paddingBottom: 20 }}>
					{data.length > 0 ? (
						data.map((item) => (
							<AlarmCard key={String(item.id)} item={item} />
						))
					) : (
						!loading && (
							<View style={styles.noAlarmsFound}>
								<Text style={styles.noAlarmsFoundText}>
									No Alarm History Data Found.
								</Text>
							</View>
						)
					)}

					{loadingMore && (
						<View style={{ paddingVertical: 12, alignItems: "center" }}>
							<Text style={{ color: "#999", fontSize: 12 }}>
								Loading more…
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		flex: 1,
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
		flex: 1,
	},
	tabRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		position: "relative",
		paddingHorizontal: 20,
	},
	tab: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
	},
	tabIcon: {
		marginRight: 6,
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
		position: "absolute",
		bottom: 0,
		left: 0,
	},
	noAlarmsFound: {
		alignItems: "center",
		marginVertical: 20,
	},
	noAlarmsFoundText: {
		fontSize: 14,
		fontFamily: Fonts.bold,
		color: "#000069",
	},
});

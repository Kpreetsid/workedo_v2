import { cloneElement, ComponentType, isValidElement, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import PagerView, { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import Fonts from "@/constants/Typography";
import { useGestureLock } from "@/src/store/useGestureLock";

interface TabConfig {
	label: string;
	icon?: ReactElement<{ color?: string }>;
	component: ReactNode | (() => React.JSX.Element)
}

interface SegmentedPagerProps {
	tabs: TabConfig[];
	comingFrom?: string;
	initialPage?: number;
	containerStyle?: StyleProp<ViewStyle>;
	tabStyle?: StyleProp<ViewStyle>;
	activeTabStyle?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	activeTextStyle?: StyleProp<TextStyle>;
	onPageChange?: (index: number) => void;
}

console.log("[SegmentedPager] rendering PagerView now");

export default function SegmentedPager({ tabs, comingFrom, initialPage = 0, containerStyle, tabStyle, activeTabStyle, textStyle, activeTextStyle, onPageChange }: SegmentedPagerProps) {

	const gestureLocked = useGestureLock((s) => s.locked);
	
	console.log('initial page = ', initialPage)
	const pagerRef = useRef<PagerView>(null);
	const [activeTab, setActiveTab] = useState(initialPage);

	const [mountedTabs, setMountedTabs] = useState([initialPage]);

	const handleTabPress = (index: number) => {
		setActiveTab(index);
		pagerRef.current?.setPage(index);
	};

	// const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
	// 	setActiveTab(e.nativeEvent.position);
	// };

	const onPageSelected = (e: PagerViewOnPageSelectedEvent) => {
		const pos = e.nativeEvent.position;
		setMountedTabs((prev) =>
			prev.includes(pos) ? prev : [...prev, pos]
		);
		setActiveTab(pos);
		onPageChange?.(pos);
	};

	return (
		<>
			{/* Tabs */}
			<View style={[styles.tabRow, containerStyle, comingFrom === "preventive" ? { height: 50 } : { height: 40 }]}>
				{tabs.map((tab, index) => {
					const isActive = index === activeTab;
					return (
						<Pressable
							key={index}
							style={[
								styles.tab,
								comingFrom === "preventive"
									? { flex: 1, height: 42 }
									: { width: "auto", height: 32 },
								tabStyle,
								isActive && [styles.activeTab, activeTabStyle],
							]}
							onPress={() => handleTabPress(index)}
						>
							{isValidElement(tab?.icon) ? cloneElement(tab.icon, { color: isActive ? "#FFFFFF" : "#000000" }) : null}


							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								adjustsFontSizeToFit={comingFrom === "preventive"}
								minimumFontScale={0.8}
								style={[
									styles.tabText,
									comingFrom === "preventive" && styles.tabTextPreventive,
									textStyle,
									isActive && [styles.activeTabText, activeTextStyle],
								]}
							>
								{tab.label}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{/* Pager */}
			<PagerView
				style={styles.pager}
				initialPage={initialPage}
				ref={pagerRef}
				onPageSelected={onPageSelected}
				scrollEnabled={!gestureLocked}
			>
				{tabs.map((tab, index) => (
					<View key={index.toString()} style={styles.page}>
						{
							mountedTabs.includes(index) &&
							(typeof tab.component === "function"
								? tab.component()       // ✅ call it if it’s a function component
								: tab.component)        // ✅ otherwise just render the node directly
						}

					</View>
				))}
			</PagerView>

		</>
	);
}

const styles = StyleSheet.create({
	tabRow: {
		flexDirection: "row",
		backgroundColor: '#fff',
		borderRadius: 100,
		overflow: "hidden",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 5,
		height: 40,
		borderWidth: 0.1,
		borderColor: "#00000066",
		marginVertical: 10,
	},
	tab: {
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 10,
		height: 32,
		borderRadius: 100,
		flexDirection: "row",
		gap: 7,
	},
	activeTab: {
		backgroundColor: "#742BDE",
		borderColor: "#5552FE",
		borderWidth: 0.4,
	},
	tabText: {
		fontSize: 12,
		fontFamily: Fonts.light,
		color: "#000000",
		lineHeight: 18,
		flexShrink: 1,
	},
	tabTextPreventive: {
		fontSize: 10,
	},
	activeTabText: {
		color: "#fff",
		fontFamily: Fonts.light,
	},
	pager: {
		flex: 1,
	},
	page: {
		flex: 1,
	},
});

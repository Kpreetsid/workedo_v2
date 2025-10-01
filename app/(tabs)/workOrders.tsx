import { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import Fonts from "@/constants/Typography";
import { DoneIcon, ToDoIcon } from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import ToDoTab from "@/components/work-orders/ToDoTab";
import DoneTab from "@/components/work-orders/DoneTab";

export default function WorkOrders() {
	const [activeTab, setActiveTab] = useState<0 | 1>(0);
	const pagerRef = useRef<PagerView>(null);

	const handleTabPress = (index: 0 | 1) => {
		setActiveTab(index);
		pagerRef.current?.setPage(index);
	};

	return (
		<>
			<Header title="Work Orders" />
			<View style={styles.tabRow}>
				<Pressable style={[styles.tab, activeTab === 0 && styles.activeTab]} onPress={() => handleTabPress(0)}>
					<ToDoIcon color={activeTab === 0 ? "#FFFFFF" : "#000000"} />
					<Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>To Do</Text>
				</Pressable>

				<Pressable style={[styles.tab, activeTab === 1 && styles.activeTab]} onPress={() => handleTabPress(1)}>
					<DoneIcon color={activeTab === 1 ? "#FFFFFF" : "#000000"} />
					<Text style={[styles.tabText, activeTab === 1 && styles.activeTabText,]}>Done</Text>
				</Pressable>
			</View>

			<PagerView style={styles.pager} initialPage={0} ref={pagerRef} onPageSelected={(e) => setActiveTab(e.nativeEvent.position as 0 | 1)}>
				<View key="1" style={styles.page}>
					<ToDoTab />
				</View>
				<View key="2" style={styles.page}>
					<DoneTab />
				</View>
			</PagerView>
		</>
	);
}

const styles = StyleSheet.create({
	tabRow: {
		flexDirection: "row",
		backgroundColor: "#FFFFFF",
		borderRadius: 100,
		overflow: "hidden",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		width: 200,
		height: 40,
		borderWidth: 0.1,
		borderColor: "#00000066",
		marginVertical: 10
	},
	tab: {
		alignItems: "center",
		justifyContent: "center",
		width: 95,
		height: 32,
		borderRadius: 100,
		flexDirection: "row",
		gap: 7
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

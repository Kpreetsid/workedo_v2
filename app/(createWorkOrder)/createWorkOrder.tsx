import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SceneMap, TabView } from 'react-native-tab-view'
import Header from '@/components/global/Header';
import NewWorkOrder from '@/components/create-work-order/newWorkOrder';
import TaskScreen from '@/components/create-work-order/TaskScreen';
import FormsScreen from '@/components/create-work-order/FormsScreen';

const GeneralInfo = () => (
	<View style={styles.scene}>
		<NewWorkOrder />
	</View>
);

const Task = () => (
	<View style={styles.scene}>
		<TaskScreen />
	</View>
);

const Forms = () => (
	<View style={styles.scene}>
		<FormsScreen />
	</View>
);

const renderScene = ({ route }: { route: { key: string } }) => {
	switch (route.key) {
		case "general":
			return <GeneralInfo />;
		case "task":
			return <Task />;
		case "forms":
			return <Forms />;
		default:
			return null;
	}
};

const createWorkOrder = () => {
	const layout = Dimensions.get("window");
	const [index, setIndex] = useState(0);

	const [routes] = useState([
		{ key: "general", title: "General Info" },
		{ key: "task", title: "Task" },
		{ key: "forms", title: "Forms" },
	]);

	const renderTabBar = () => (
		<View style={styles.tabBar}>
			{routes.map((route, i) => {
				const isActive = i === index;
				return (
					<TouchableOpacity
						key={route.key}
						style={[styles.tabItem, isActive && styles.activeTab]}
						onPress={() => setIndex(i)}
					>
						<Text style={[styles.tabText, isActive && styles.activeTabText]}>
							{route.title}
						</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);

	return (
		<View style={{ flex: 1, backgroundColor: '#f9f9ff' }}>

			<Header title="Create Work Order" />
			{renderTabBar()}

			<TabView
				navigationState={{ index, routes }}
				renderScene={renderScene}
				onIndexChange={setIndex}
				initialLayout={{ width: layout.width }}
				renderTabBar={() => null}
			/>
		</View>
	)
}

export default createWorkOrder


const styles = StyleSheet.create({
	tabBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginTop: 20,
		marginBottom: 10,
	},
	tabItem: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 30,
	},
	activeTab: {
		backgroundColor: "#742BDE",
	},
	tabText: {
		fontSize: 14,
		color: "#000",
	},
	activeTabText: {
		color: "#fff",
		fontWeight: "600",
	},
	scene: {
		flex: 1,
		// padding: 20,
	},
});
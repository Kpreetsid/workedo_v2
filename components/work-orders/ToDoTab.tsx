import { Pressable, Text, View, StyleSheet, ToastAndroid } from "react-native";
import Fonts from "@/constants/Typography";
import { useEffect, useState } from "react";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import { FlashList } from "@shopify/flash-list";
import { getWorkOrders } from "@/src/services/work-order.service";
import { AssignedUser, WorkOrder } from "@/src/types/workOrder";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function ToDoTab() {
	const [selectedButton, setSelectedButton] = useState<number>(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
	const [createdByMeWorkOrders, setCreatedByMeWorkOrders] = useState<WorkOrder[]>([]);
	const [openForAllWorkOrders, setOpenForAllWorkOrders] = useState<WorkOrder[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const loggedInUser = useAuthStore((state) => state.user);
	console.log('user in state = ', loggedInUser);

	useEffect(() => {
		fetchWorkOrders();
	}, [])

	const fetchWorkOrders = async () => {
		console.log("fetch work orders");

		try {
			const res = await getWorkOrders('todo');

			if (res?.status && res?.data) {
				const allWorkOrders = res.data as WorkOrder[];

				// Work orders assigned to logged-in user
				const assignedToUser = allWorkOrders.filter((item) =>
					item.assignedUsers?.some(
						(user: AssignedUser) => user?.userId === loggedInUser?.id
					)
				);

				// Work orders created by logged-in user
				const createdByUser = allWorkOrders.filter(
					(item) => item?.createdBy === loggedInUser?.id
				);

				// ✅ Update both states once
				setWorkOrders(assignedToUser.reverse());
				setCreatedByMeWorkOrders(createdByUser.reverse());
				setOpenForAllWorkOrders(allWorkOrders.reverse());

				console.log("assignedToUser =", assignedToUser.length);
				console.log("createdByUser =", createdByUser.length);
			}
		} catch (error: any) {
			console.log("error =", error);
			ToastAndroid.show(error?.message || "Something went wrong", ToastAndroid.LONG);
		}
	};

	useEffect(() => {
		console.log('work orders final = ', createdByMeWorkOrders);
	}, [createdByMeWorkOrders])

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchWorkOrders();
		setRefreshing(false);
	};

	return (
		<>
			<View style={styles.buttonContainer}>
				{["Assigned To Me", "Created By Me", "Open For All"].map((text, index) => (
					<Pressable key={index} style={[styles.filterButton, { backgroundColor: selectedButton === index ? "#3F009A" : "#3F009A14" }]} onPress={() => setSelectedButton(index)}>
						<Text style={[styles.buttonText, {
							color: selectedButton === index ? "#FFFFFF" : "#000000",
							fontFamily: selectedButton === index ? Fonts.regular : Fonts.extraLight
						}]}>{text}</Text>
					</Pressable>
				))}
			</View>

			<FlashList
				data={selectedButton === 0 ? workOrders : selectedButton === 1 ? createdByMeWorkOrders : openForAllWorkOrders}
				removeClippedSubviews={false}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContainer}
				renderItem={({ item }) => <WorkOrderCard item={item} isSelected={selectedId === item.id} />}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			// selection for the work orders
			// onPress={() => setSelectedId(item.id)}
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
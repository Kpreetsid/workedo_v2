import { Pressable, Text, View, StyleSheet, ToastAndroid, FlatList, ActivityIndicator } from "react-native";
import Fonts from "@/constants/Typography";
import { useCallback, useEffect, useState } from "react";
import WorkOrderCard from "@/src/components/work-orders/WorkOrderCard";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { getWorkOrders } from "@/src/services/work-order.service";
import { AssignedUser, WorkOrder } from "@/src/types/workOrder";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { useFocusEffect } from "expo-router";

export default function ToDoTab() {
	const [selectedButton, setSelectedButton] = useState<number>(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

	const [assignedToMe, setAssignedToMe] = useState<WorkOrder[]>([]);
	const [createdByMeWorkOrders, setCreatedByMeWorkOrders] = useState<WorkOrder[]>([]);
	const [openForAllWorkOrders, setOpenForAllWorkOrders] = useState<WorkOrder[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const [loading, setLoading] = useState(false)

	const loggedInUser = useAuthStore((state) => state.user);
	console.log('user in state = ', loggedInUser);

	const data =
		selectedButton === 0 ? assignedToMe :
			selectedButton === 1 ? createdByMeWorkOrders :
				openForAllWorkOrders;

	useFocusEffect(
		useCallback(() => {
			setLoading(true)
			fetchWorkOrders();
		}, [])
	);

	const fetchWorkOrders = async () => {
		console.log("fetch work orders");

		try {
			const res = await getWorkOrders('todo');
			console.log("work orders = ", res);

			if (res?.status && res?.data) {
				// filter whose status != "Completed" if selected
				const allWorkOrders = res.data as WorkOrder[];
				setWorkOrders(allWorkOrders);
				setLoading(false)
			}
		} catch (error: any) {
			console.log("error =", error);
			ToastAndroid.show(error?.message || "Something went wrong", ToastAndroid.SHORT);
			setLoading(false)
		}
	};

	useEffect(() => {
		if (!workOrders.length) return;

		let assigned = [];
		let created = [];
		let open = [];

		for (let i = 0; i < workOrders.length; i++) {
			const wo = workOrders[i];

			const isAssigned = wo.assignedUsers?.some(
				u => u.userId === loggedInUser?.id
			);
			const isCreated = wo.created_by === loggedInUser?.id;

			// If assigned to me, add to workOrderList
			if (isAssigned) {
				assigned.push(wo);
			}

			// If created by me and not already in workOrderList, add to createdByMeWorkOrders
			if (isCreated && !assigned.some(a => a.id === wo.id)) {
				created.push(wo);
			}

			// If neither assigned to me nor created by me, and not in workOrderList, add to openForAllWorkOrders
			if (!isAssigned && !isCreated && !assigned.some(a => a.id === wo.id)) {
				open.push(wo);
			}
		}


		console.log('assigned = ', assigned);
		console.log('created = ', created);
		console.log('open = ', open);
		setAssignedToMe([...assigned].reverse());
		setCreatedByMeWorkOrders([...created].reverse());
		setOpenForAllWorkOrders([...open].reverse());
	}, [workOrders]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchWorkOrders();
		setRefreshing(false);
	};

	const renderWorkOrderItem = useCallback(
		({ item }: { item: WorkOrder }) => <WorkOrderCard item={item} isSelected={selectedId === item.id} />,
		[selectedId]
	);

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

			{
				loading && <View style={{ marginTop: 20 }}>
					<ActivityIndicator size={28} />
				</View>
			}

			<FlatList
				data={
					selectedButton === 0
						? assignedToMe
						: selectedButton === 1
							? createdByMeWorkOrders
							: openForAllWorkOrders
				}

				keyExtractor={(item) => item.id.toString()}
				renderItem={renderWorkOrderItem}
				removeClippedSubviews={false}
				refreshing={refreshing}
				onRefresh={handleRefresh}
				contentContainerStyle={styles.listContainer}
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
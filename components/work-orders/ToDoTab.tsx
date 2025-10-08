import {Pressable, Text, View, StyleSheet} from "react-native";
import Fonts from "@/constants/Typography";
import { useState } from "react";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import {FlashList} from "@shopify/flash-list";

type WorkOrder = {
	id: string;
	title: string;
	requestedBy: string;
	createdOn: string;
	status: "Open" | "Closed";
	priority: "Low" | "Medium" | "High";
	image: string;
};
const mockData: WorkOrder[] = [
	{
		id: "#WO - 111",
		title: "Test by ashmit",
		requestedBy: "Aman Bhambra",
		createdOn: "Sep 20, 2025",
		status: "Open",
		priority: "Low",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 112",
		title: "Inspection Needed",
		requestedBy: "Rahul Mehta",
		createdOn: "Sep 18, 2025",
		status: "Open",
		priority: "Medium",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 113",
		title: "Fix AC Issue",
		requestedBy: "Priya Sharma",
		createdOn: "Sep 16, 2025",
		status: "Open",
		priority: "High",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 114",
		title: "Routine Maintenance",
		requestedBy: "Suresh Kumar",
		createdOn: "Sep 14, 2025",
		status: "Open",
		priority: "Medium",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 115",
		title: "Generator Repair",
		requestedBy: "Meena Rani",
		createdOn: "Sep 13, 2025",
		status: "Closed",
		priority: "High",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 116",
		title: "Water Leak Check",
		requestedBy: "Rohit Verma",
		createdOn: "Sep 11, 2025",
		status: "Open",
		priority: "Low",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 117",
		title: "Replace Light Bulbs",
		requestedBy: "Anjali Singh",
		createdOn: "Sep 10, 2025",
		status: "Closed",
		priority: "Low",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 118",
		title: "Elevator Service",
		requestedBy: "Deepak Sharma",
		createdOn: "Sep 09, 2025",
		status: "Open",
		priority: "Medium",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 119",
		title: "HVAC Filter Change",
		requestedBy: "Neha Gupta",
		createdOn: "Sep 07, 2025",
		status: "Open",
		priority: "High",
		image: "https://placehold.co/60x60/png",
	},
	{
		id: "#WO - 120",
		title: "Safety Inspection",
		requestedBy: "Arjun Patel",
		createdOn: "Sep 05, 2025",
		status: "Closed",
		priority: "Medium",
		image: "https://placehold.co/60x60/png",
	},
];

export default function ToDoTab() {
	const [selectedButton, setSelectedButton] = useState<number>(0);
	const [selectedId, setSelectedId] = useState<string | null>(null);

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
				data={mockData}
				removeClippedSubviews={false}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContainer}
				renderItem={({ item }) => <WorkOrderCard item={item} isSelected={selectedId === item.id} />}
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
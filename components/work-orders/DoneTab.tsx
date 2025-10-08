import {FlatList, StyleSheet} from "react-native";
import WorkOrderCard from "@/components/work-orders/WorkOrderCard";
import {useState} from "react";

type WorkOrder = {
    id: string;
    title: string;
    requestedBy: string;
    createdOn: string;
    status: "Open" | "Closed" | "Completed";
    priority: "Low" | "Medium" | "High";
    image: string;
};
const mockData: WorkOrder[] = [
    {
        id: "#WO - 201",
        title: "Air Conditioner Maintenance",
        requestedBy: "Aman Bhambra",
        createdOn: "Sep 20, 2025",
        status: "Completed",
        priority: "Low",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 202",
        title: "Generator Checkup",
        requestedBy: "Rahul Mehta",
        createdOn: "Sep 19, 2025",
        status: "Completed",
        priority: "Medium",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 203",
        title: "Electrical Wiring Fix",
        requestedBy: "Priya Sharma",
        createdOn: "Sep 18, 2025",
        status: "Completed",
        priority: "High",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 204",
        title: "Routine Safety Inspection",
        requestedBy: "Suresh Kumar",
        createdOn: "Sep 17, 2025",
        status: "Completed",
        priority: "Low",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 205",
        title: "Replace Water Pump",
        requestedBy: "Meena Rani",
        createdOn: "Sep 16, 2025",
        status: "Completed",
        priority: "High",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 206",
        title: "Check Fire Alarm",
        requestedBy: "Rohit Verma",
        createdOn: "Sep 15, 2025",
        status: "Completed",
        priority: "Medium",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 207",
        title: "Elevator Service",
        requestedBy: "Anjali Singh",
        createdOn: "Sep 14, 2025",
        status: "Completed",
        priority: "Low",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 208",
        title: "Painting Touch-Up",
        requestedBy: "Deepak Sharma",
        createdOn: "Sep 13, 2025",
        status: "Completed",
        priority: "Medium",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 209",
        title: "Replace HVAC Filter",
        requestedBy: "Neha Gupta",
        createdOn: "Sep 12, 2025",
        status: "Completed",
        priority: "High",
        image: "https://placehold.co/60x60/png",
    },
    {
        id: "#WO - 210",
        title: "Plumbing Leak Fix",
        requestedBy: "Arjun Patel",
        createdOn: "Sep 11, 2025",
        status: "Completed",
        priority: "Medium",
        image: "https://placehold.co/60x60/png",
    },
];

export default function DoneTab() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <FlatList
            data={mockData}
            removeClippedSubviews={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({item}) => <WorkOrderCard item={item} isSelected={selectedId === item.id} onPress={() => setSelectedId(item.id)}/>}
        />
    )
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12
    }
})
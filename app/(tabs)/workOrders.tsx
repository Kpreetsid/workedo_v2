import { DoneIcon, ToDoIcon } from "@/constants/IconProvider";
import Header from "@/src/components/global/Header";
import ToDoTab from "@/src/components/work-orders/ToDoTab";
import DoneTab from "@/src/components/work-orders/DoneTab";
import PlannerTab from "@/src/components/work-orders/PlannerTab";
import SegmentedPager from "@/src/components/global/SegmentPager";
import { useRouter } from "expo-router";
import CreateFAB from "@/src/components/global/CreateFAB";

export default function WorkOrders() {
	const router = useRouter();

	return (
		<>
			<Header title="Work Orders" />

			<SegmentedPager tabs={[
				{ label: "My Work", icon: <ToDoIcon />, component: () => <ToDoTab /> },
				{ label: "Planner", component: () => <PlannerTab /> },
				{ label: "Completed", icon: <DoneIcon />, component: () => <DoneTab /> }]}
			/>

			<CreateFAB label="Create Work Order" onPress={() => router.push("/createWorkOrder")} />
		</>
	);
}

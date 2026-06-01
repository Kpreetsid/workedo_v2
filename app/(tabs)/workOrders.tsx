import { DoneIcon, ToDoIcon } from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import ToDoTab from "@/components/work-orders/ToDoTab";
import DoneTab from "@/components/work-orders/DoneTab";
import PlannerTab from "@/components/work-orders/PlannerTab";
import SegmentedPager from "@/components/global/SegmentPager";
import { useRouter } from "expo-router";
import CreateFAB from "@/components/global/CreateFAB";

export default function WorkOrders() {
	const router = useRouter();

	return (
		<>
			<Header title="Work Orders" />

			<SegmentedPager tabs={[
				{ label: "To Do", icon: <ToDoIcon />, component: () => <ToDoTab /> },
				{ label: "Planner", component: () => <PlannerTab /> },
				{ label: "Done", icon: <DoneIcon />, component: () => <DoneTab /> }]}
			/>

			<CreateFAB label="Create Work Order" onPress={() => router.push("/createWorkOrder")} />
		</>
	);
}

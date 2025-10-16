import { DoneIcon, ToDoIcon } from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import ToDoTab from "@/components/work-orders/ToDoTab";
import DoneTab from "@/components/work-orders/DoneTab";
import SegmentedPager from "@/components/global/SegmentPager";
import CreateFAB from "@/components/global/CreateFAB";
import { useRouter } from "expo-router";

export default function WorkOrders() {
	const router = useRouter();

	return (
		<>
			<Header title="Work Orders" />

			<SegmentedPager tabs={[
				{ label: "To Do", icon: <ToDoIcon />, component: () => <ToDoTab /> },
				{ label: "Done", icon: <DoneIcon />, component: () => <DoneTab /> }]}
			/>

			<CreateFAB label="Create Work Order" onPress={() => router.push("/newWorkOrder")} />
		</>
	);
}
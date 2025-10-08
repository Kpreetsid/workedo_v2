import {DoneIcon, ToDoIcon} from "@/constants/IconProvider";
import Header from "@/components/global/Header";
import ToDoTab from "@/components/work-orders/ToDoTab";
import DoneTab from "@/components/work-orders/DoneTab";
import SegmentedPager from "@/components/global/SegmentPager";

export default function WorkOrders() {
    return (
        <>
            <Header title="Work Orders"/>

            <SegmentedPager tabs={[
                {label: "To Do", icon: <ToDoIcon/>, component: <ToDoTab/>},
                {label: "Done", icon: <DoneIcon/>, component: <DoneTab/>}]}/>
        </>
    );
}

import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import moment from "moment";
import AssignInput from "../create-screens/AssignInput";
import DatePicker from "../global/DatePicker";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { FormField } from "../global/FormField";

export const AssignSection = ({ type }: { type: "workOrders" | "requests" }) => {
	const router = useRouter();
	const { setWorkForm } = useWorkOrderStore();

	const workOrderLocation = useWorkOrderStore((state) => state.location);
	const workRequestLocation = useWorkRequestStore((state) => state.location);

	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);

	return (
		<View>
			{/* --- Location --- */}
			{
				type === "requests" ?
					<FormField
						label="Location"
						type="location"
						placeholder="Enter Location"
						field="location"
						router={router}
						comingFrom="newWorkRequest"
						store={useWorkRequestStore}
						setterName="setWorkRequestForm"
					/>
					:
					<FormField
						label="Location"
						type="location"
						placeholder="Enter Location"
						field="location"
						router={router}
						comingFrom="newWorkOrder"
						store={useWorkOrderStore}
						setterName="setWorkForm"
					/>
			}


			{
				type === "requests" ?
					workRequestLocation && (
						<FormField
							label="Asset"
							type="asset"
							field="selected_asset"
							router={router}
							comingFrom="newWorkRequest"
							store={useWorkRequestStore}
							setterName="setWorkRequestForm"
						/>
					)
					:
					workOrderLocation && (
						<FormField
							label="Asset"
							type="asset"
							field="selected_asset"
							router={router}
							comingFrom="newWorkOrder"
							store={useWorkOrderStore}
							setterName="setWorkForm"
						/>
					)
			}

			{
				type === "workOrders" &&
				<View>

					{/* --- Assign User --- */}
					<FormField
						label="Assign User"
						type="user"
						field="assigned_users"
						router={router}
						comingFrom="newWorkOrder"
						store={useWorkOrderStore}
						setterName="setWorkForm" />

					{/* --- Start Date --- */}
					<FormField
						label="Start Date"
						type="date"
						field="start_date"
						router={router}
						comingFrom="newWorkOrder"
						store={useWorkOrderStore}
						setterName="setWorkForm"
						setActiveDateField={setActiveDateField}
						setIsDatePickerVisible={setIsDatePickerVisible}
					/>

					{/* --- End Date --- */}
					<FormField
						label="End Date"
						type="date"
						field="end_date"
						router={router}
						comingFrom="newWorkOrder"
						store={useWorkOrderStore}
						setterName="setWorkForm"
						setActiveDateField={setActiveDateField}
						setIsDatePickerVisible={setIsDatePickerVisible}
					/>

					{/* --- Date Picker --- */}
					<DatePicker
						visible={isDatePickerVisible}
						onClose={() => setIsDatePickerVisible(false)}
						onDateSelect={(date) => {
							const formattedDate = moment(date).format("YYYY-MM-DD");
							if (activeDateField) {
								setWorkForm(activeDateField, formattedDate);
							}
							setIsDatePickerVisible(false);
							setActiveDateField(null);
						}}
					/>
				</View>
			}
		</View>
	);
};

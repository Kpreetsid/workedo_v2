import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import moment from "moment";
import AssignInput from "../create-screens/AssignInput";
import DatePicker from "../global/DatePicker";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";

export const AssignSection = ({ type }: { type: "workOrders" | "requests" }) => {
	const router = useRouter();
	const { workForm, setWorkForm } = useWorkOrderStore();
	const { workRequestForm } = useWorkRequestStore();

	const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
	const [activeDateField, setActiveDateField] = useState<"start_date" | "end_date" | null>(null);

	return (
		<View>
			{/* --- Location --- */}
			<AssignInput
				label="Location"
				comingFrom="newWorkRequest"
				onPress={() =>
					router.push({
						pathname: "/selectLocation",
						params: { comingFrom: "newWorkRequest" },
					})
				}
			/>

			{
				type === "requests" ?
					workRequestForm.location && (
						<AssignInput
							label="Asset"
							comingFrom="newWorkRequest"
							onPress={() => router.push({
								pathname: "/selectAsset",
								params: { comingFrom: "newWorkRequest" }
							})}
						/>
					)
					:
					workForm.location && (
						<AssignInput
							label="Asset"
							comingFrom="newWorkOrder"
							onPress={() => router.push({
								pathname: "/selectAsset",
								params: { comingFrom: "newWorkOrder" }
							})}
						/>
					)
			}

			{
				type === "workOrders" &&
				<View>

					{/* --- Assign User --- */}
					<AssignInput
						label="Assign User"
						comingFrom="newWorkRequest"
						onPress={() =>
							router.push({
								pathname: "/selectUser",
								params: { comingFrom: "newWorkRequest" },
							})
						}
					/>

					{/* --- Start Date --- */}
					<AssignInput
						label="Start Date"
						comingFrom="newWorkRequest"
						onPress={() => {
							setActiveDateField("start_date");
							setIsDatePickerVisible(true);
						}}
					/>

					{/* --- End Date --- */}
					<AssignInput
						label="End Date"
						comingFrom="newWorkRequest"
						onPress={() => {
							setActiveDateField("end_date");
							setIsDatePickerVisible(true);
						}}
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

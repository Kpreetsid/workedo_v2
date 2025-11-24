import Header from "@/components/global/Header";
import { StyleSheet, ToastAndroid, View } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useRouter } from "expo-router";
import DropDownInput from "@/components/create-screens/DropDownInput";
import React, { useEffect, useRef, useState } from "react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { createPart } from "@/src/services/part.service";
import { FormField } from "@/components/global/FormField";

export default function CreatePart() {
	const router = useRouter();
	const { setPartFormValue, resetPartForm } = usePartFormStore();

	useEffect(() => {
		return () => {
			resetPartForm();
		}
	}, [])

	const handleSubmit = async () => {
		console.log('in handle submit');
		const data: any = usePartFormStore.getState();
		console.log("📦 Data:", data);

		// ✅ Basic validation
		const required = ["part_name", "description", "location", "part_number", "available_quantity", "min_stock_quantity", "unit_cost"];
		for (const field of required) {
			if (!data[field]) {
				const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
				ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		if (!data.location?.id) {
			ToastAndroid.show("Location is required", ToastAndroid.SHORT);
			return;
		}

		// ✅ Prepare payload for API
		const payload = {
			part_name: data.part_name.trim(),
			part_number: data.part_number.trim(),
			part_type: data.selected_part || "Spare 1",
			description: data.description.trim(),
			quantity: Number(data.available_quantity) || 0,
			min_quantity: Number(data.min_stock_quantity) || 0,
			unit: data.unit_cost.trim(), // if “unit” represents size/type (like kg, pcs)
			cost: Number(data.unit_cost) || 0,
			location_id: data.location?.id || "",
		};

		console.log("📦 Final Payload:", payload);

		try {
			const res = await createPart(payload);
			console.log("✅ Response:", res);

			ToastAndroid.show("Part created successfully!", ToastAndroid.SHORT);

			resetPartForm();
		} catch (error) {
			console.error("❌ Error creating part:", error);
			ToastAndroid.show("Failed to create part!", ToastAndroid.SHORT);
		}
	};

	return (
		<>
			<Header title="Create Part" />

			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: '#F5F7FA' }}>

				<View style={{ marginVertical: 5 }} />

				<FormField
					label="Part Name"
					placeholder="Enter Title"
					field="part_name"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Description"
					placeholder="Enter a message"
					field="description"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Location"
					type="location"
					placeholder="Enter Location"
					field="location"
					router={router}
					comingFrom="createPart"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>


				<FormField
					label="Select Spare Type"
					type="dropdown"
					field="selected_part"
					options={["Spare 1", "Spare 2", "Spare 3"]}
					router={router}
					comingFrom="createPart"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Part Number"
					placeholder="Type Number"
					field="part_number"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Available Quantity"
					placeholder="Enter Quantity"
					field="available_quantity"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Minimum Stock Quantity"
					placeholder="Enter Quantity"
					field="min_stock_quantity"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<FormField
					label="Unit Cost"
					placeholder="Enter Cost"
					field="unit_cost"
					store={usePartFormStore}
					setterName="setPartFormValue"
				/>

				<ActionButton label="Submit" onPress={handleSubmit} />
			</KeyboardAwareScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	descriptionInput: {
		height: 80,
		textAlignVertical: "top"
	}
})
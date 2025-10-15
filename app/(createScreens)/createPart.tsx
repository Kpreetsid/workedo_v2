import Header from "@/components/global/Header";
import { StyleSheet, ToastAndroid, View } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useRouter } from "expo-router";
import DropDownInput from "@/components/create-screens/DropDownInput";
import { useEffect, useRef, useState } from "react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { createPart } from "@/src/services/part.service";

export default function CreatePart() {
	const router = useRouter();
	const { partForm, setPartFormValue, resetPartForm } = usePartFormStore();

	const handleSubmit = async () => {
		const data: any = { ...partForm };

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

			<KeyboardAwareScrollView bottomOffset={30}>
				<View style={{ marginVertical: 5 }} />

				<FormInput
					label="Part Name"
					placeholder="Enter Title"
					value={partForm.part_name}
					onChangeText={(text) => setPartFormValue("part_name", text)}
				/>

				<FormInput
					label="Description"
					placeholder="Enter a message"
					inputStyle={styles.descriptionInput}
					value={partForm.description}
					onChangeText={(text) => setPartFormValue("description", text)}
				/>

				<AssignInput
					label="Location"
					comingFrom="createPart"
					onPress={() => router.push({
						pathname: "/selectLocation",
						params: { comingFrom: "createPart" }
					})}
				/>

				<DropDownInput
					label="Select Spare Type"
					value={partForm.selected_part}
					options={["Spare 1", "Spare 2", "Spare 3"]}
					onSelect={(val) => {
						setPartFormValue("selected_part", val);
					}}
				/>

				<FormInput
					label="Part Number"
					placeholder="Type Number"
					value={partForm.part_number}
					onChangeText={(text) => setPartFormValue("part_number", text)}
				/>

				<FormInput
					label="Available Quantity"
					placeholder="Enter Quantity"
					value={partForm.available_quantity}
					onChangeText={(text) => setPartFormValue("available_quantity", text)}
				/>

				<FormInput
					label="Minimum Stock Quantity"
					placeholder="Enter Quantity"
					value={partForm.min_stock_quantity}
					onChangeText={(text) => setPartFormValue("min_stock_quantity", text)}
				/>

				<FormInput
					label="Unit Cost"
					placeholder="Enter Cost"
					value={partForm.unit_cost}
					onChangeText={(text) => setPartFormValue("unit_cost", text)}
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


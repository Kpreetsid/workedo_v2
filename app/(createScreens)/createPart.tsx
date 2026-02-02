import Header from "@/components/global/Header";
import { StyleSheet, ToastAndroid, View } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import DropDownInput from "@/components/create-screens/DropDownInput";
import React, { useEffect, useRef, useState } from "react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { createPart, updateFullPart, updatePart } from "@/src/services/part.service";
import { FormField } from "@/components/global/FormField";
import LocationPickerModal from "@/components/create-work-order/LocationPickerModal";

export default function CreatePart() {
	const params: any = useLocalSearchParams();
	console.log('params = ', params);

	const data = params?.data;
	const isEdit = !!params?.data;

	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [partId, setPartId] = useState("");
	const { setPartFormValue, resetPartForm, isLoaded } = usePartFormStore();

	useEffect(() => {
		return () => {
			resetPartForm();
		}
	}, [])


	useEffect(() => {
		if (params?.data && !isLoaded) {
			const data = JSON.parse(params.data);
			console.log('data here in params = ', data);

			// all setters here
			setPartId(data?.id);
			setPartFormValue("part_name", data?.part_name);
			setPartFormValue("description", data?.description);
			setPartFormValue("location", data?.location);
			setPartFormValue("selected_part", data?.part_type);
			setPartFormValue("part_number", data?.part_number);
			setPartFormValue("available_quantity", String(data?.quantity) ?? "");
			setPartFormValue("min_stock_quantity", String(data?.min_quantity) ?? "");
			setPartFormValue("unit_cost", String(data?.cost) ?? "");
			setPartFormValue("uom", data?.unit);

			// finally mark as loaded ONCE
			setPartFormValue("isLoaded", true);
		}
	}, [params]);


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
			unit: data.uom,
			cost: Number(data.unit_cost) || 0,
			location_id: data.location?.id || "",
		};

		console.log("📦 Final Payload:", payload);

		try {
			if (params && params.data) {
				const res = await updateFullPart(partId, payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Part updated successfully!", ToastAndroid.SHORT);
					usePartFormStore.getState().resetPartForm();
					router.back();
				}
			} else {
				const res = await createPart(payload);
				console.log("✅ Response:", res);

				ToastAndroid.show("Part created successfully!", ToastAndroid.SHORT);
				router.back();
			}
		} catch (error) {
			console.error("❌ Error creating part:", error);
			ToastAndroid.show("Failed to create part!", ToastAndroid.SHORT);
		}
	};

	return (
		<>
			<Header title={isEdit ? "Edit Part" : "Create Part"} />

			<KeyboardAwareScrollView bottomOffset={30} style={{ backgroundColor: '#F5F7FA' }}>

				<View style={{ marginVertical: 5 }} />

				<FormField
					label="Part Name"
					placeholder="Enter Title"
					field="part_name"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Description"
					placeholder="Enter a message"
					field="description"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
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
					openPicker={() => {
						console.log('opening')
						setVisible(true)
					}}
				/>


				<LocationPickerModal
					visible={visible}
					onClose={() => setVisible(false)}
					comingFrom="createPart"
				/>


				<FormField
					label="Part Type"
					type="dropdown"
					field="selected_part"
					options={["Spare 1", "Spare 2", "Spare 3"]}
					router={router}
					comingFrom="createPart"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Part Number"
					placeholder="Type Number"
					field="part_number"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Available Quantity"
					placeholder="Enter Quantity"
					field="available_quantity"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
					showKeyboardType="numeric"
				/>

				<FormField
					label="Minimum Stock Quantity"
					placeholder="Enter Quantity"
					field="min_stock_quantity"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
					showKeyboardType="numeric"
				/>

				<FormField
					label="Unit of Measurement (UOM)"
					placeholder="Enter UOM"
					field="uom"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
				/>

				<FormField
					label="Unit Cost"
					placeholder="Enter Cost"
					field="unit_cost"
					store={usePartFormStore}
					setterName="setPartFormValue"
					styles={{ paddingHorizontal: 25 }}
					showKeyboardType="numeric"
				/>

				<ActionButton label={isEdit ? "Update" : "Create"} onPress={handleSubmit} />
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

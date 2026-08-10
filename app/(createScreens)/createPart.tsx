import Header from "@/components/global/Header";
import { StyleSheet, ToastAndroid, View } from "react-native";
import FormInput from "@/components/create-screens/FormInput";
import AssignInput from "@/components/create-screens/AssignInput";
import ActionButton from "@/components/create-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { createPart, getPartTypes, updateFullPart } from "@/src/services/part.service";
import { FormField } from "@/components/global/FormField";
import LocationPickerModal from "@/components/create-work-order/LocationPickerModal";

type PartTypeOption = {
	id: string;
	name: string;
};

const getEntityId = (value: any): string => {
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}

	return String(value?.id ?? value?._id ?? "");
};

const toFormString = (value: any): string => value == null ? "" : String(value);

export default function CreatePart() {
	const params: any = useLocalSearchParams();
	const rawEditData = Array.isArray(params?.data) ? params.data[0] : params?.data;
	const editData = useMemo(() => {
		if (!rawEditData || typeof rawEditData !== "string") return null;

		try {
			return JSON.parse(rawEditData);
		} catch (error: any) {
			console.error("Unable to read part edit data:", error);
			return null;
		}
	}, [rawEditData]);
	const isEdit = Boolean(rawEditData);

	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [partId, setPartId] = useState("");
	const { setPartFormValue, resetPartForm, isLoaded } = usePartFormStore();

	const [partTypes, setPartTypes] = useState<PartTypeOption[]>([]);

	useEffect(() => {
		fetchPartTypes();
		return () => {
			resetPartForm();
		}
	}, [])

	const fetchPartTypes = async () => {
		try {
			const res = await getPartTypes();
			console.log('res = ', res);
			if(res.status) {
				setPartTypes(res?.data || []);
			}
		} catch (error) {
			console.error('Error fetching part types:', error);
		}
	}

	useEffect(() => {
		if (!editData || isLoaded) return;

		const partTypeValue = editData.partTypeData ?? editData.part_type ?? editData.partType;
		if (!partTypeValue?.name && !partTypes.length) return;
		const partTypeId = getEntityId(partTypeValue);
		const partTypeName = partTypeValue?.name
			?? partTypes.find((part) => part.id === partTypeId || part.name === partTypeId)?.name
			?? "";
		const location = editData.location
			?? (editData.location_id ? { id: getEntityId(editData.location_id) } : null);

		setPartId(getEntityId(editData));
		setPartFormValue("part_name", toFormString(editData.part_name));
		setPartFormValue("description", toFormString(editData.description));
		setPartFormValue("location", location);
		setPartFormValue("selected_part", partTypeName);
		setPartFormValue("part_number", toFormString(editData.part_number));
		setPartFormValue("available_quantity", toFormString(editData.quantity));
		setPartFormValue("min_stock_quantity", toFormString(editData.min_quantity));
		setPartFormValue("unit_cost", toFormString(editData.cost));
		setPartFormValue("uom", toFormString(editData.unit));
		setPartFormValue("isLoaded", true);
	}, [editData, isLoaded, partTypes, setPartFormValue]);


	const handleSubmit = async () => {
		console.log('in handle submit');
		const data: any = usePartFormStore.getState();
		console.log("📦 Data:", data);
		const rawLocationId = data.location?.id ?? data.location?._id;
		const locationId =
			typeof data.location === "string" || typeof data.location === "number"
				? String(data.location)
				: rawLocationId
					? String(rawLocationId)
					: "";

		// ✅ Basic validation
		const required = ["part_name", "description", "location", "part_number", "available_quantity", "min_stock_quantity", "unit_cost"];
		for (const field of required) {
			if (!data[field]) {
				const label = field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
				ToastAndroid.show(`${label} is required`, ToastAndroid.SHORT);
				return;
			}
		}

		if (!locationId) {
			ToastAndroid.show("Location is required", ToastAndroid.SHORT);
			return;
		}

		// ✅ Prepare payload for API
		const selectedPartType = partTypes.find((part) =>
			part.name === data.selected_part || part.id === getEntityId(data.selected_part)
		);
		const originalPartType = editData?.partTypeData ?? editData?.part_type ?? editData?.partType;
		const payload = {
			part_name: data.part_name.trim(),
			part_number: data.part_number.trim(),
			part_type: selectedPartType?.id || getEntityId(originalPartType),
			description: data.description.trim(),
			quantity: Number(data.available_quantity) || 0,
			min_quantity: Number(data.min_stock_quantity) || 0,
			unit: data.uom,
			cost: Number(data.unit_cost) || 0,
			location_id: locationId,
			currency: "INR"
		};

		console.log("📦 Final Payload:", payload);

		try {
			if (isEdit) {
				const updateId = partId || getEntityId(editData);
				if (!updateId) {
					ToastAndroid.show("Unable to identify this part", ToastAndroid.SHORT);
					return;
				}

				const res = await updateFullPart(updateId, payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Part updated successfully!", ToastAndroid.SHORT);
					usePartFormStore.getState().resetPartForm();
					router.back();
				} else {
					ToastAndroid.show(res?.message || "Failed to update part!", ToastAndroid.SHORT);
				}
			} else {
				const res = await createPart(payload);
				console.log("✅ Response:", res);
				if (res?.status) {
					ToastAndroid.show("Part created successfully!", ToastAndroid.SHORT);
					usePartFormStore.getState().resetPartForm();
					router.dismissTo("/partsInventory");
				} else {
					ToastAndroid.show("Failed to create part!", ToastAndroid.SHORT);
				}
			}
		} catch (error: any) {
			console.error(`Error ${isEdit ? "updating" : "creating"} part:`, error);
			const errorMessage = error?.response?.data?.message
				|| error?.message
				|| `Failed to ${isEdit ? "update" : "create"} part!`;
			ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
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
					options={partTypes.map((part: any) => part.name)}
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

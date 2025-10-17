import AssignInput from "@/components/create-screens/AssignInput";
import DropDownInput from "@/components/create-screens/DropDownInput";
import FormInput from "@/components/create-screens/FormInput";
import React from "react";

export const FormField = React.memo(
	({
		label,
		placeholder,
		field,
		type = "text",
		options,
		router,
		comingFrom,
		store,
		setterName = "setPartFormValue",
		setActiveDateField,
		setIsDatePickerVisible
	}: {
		label: string;
		placeholder?: string;
		field: string;
		type?: "text" | "dropdown" | "location" | "asset" | "user" | "date";
		options?: string[];
		router?: any;
		comingFrom?: string;
		store: any; // the Zustand store hook you pass in
		setterName?: string; // optional: in case your setter name differs (like setWorkRequestForm)
		setActiveDateField?: any;
		setIsDatePickerVisible?: any;
	}) => {
		const value = store((s: any) => s[field]);
		const setValue = store((s: any) => s[setterName]);

		console.log(`Render → ${label}`, value);

		if (type === "dropdown") {
			return (
				<DropDownInput
					label={label}
					value={value}
					options={options || []}
					onSelect={(val) => setValue(field, val)}
				/>
			);
		}

		if (type === "location") {
			return (
				<AssignInput
					label={label}
					comingFrom={comingFrom}
					onPress={() =>
						router.push({
							pathname: "/selectLocation",
							params: { comingFrom },
						})
					}
				/>
			);
		}

		if (type === "asset") {
			return (
				<AssignInput
					label={label}
					comingFrom={comingFrom}
					onPress={() =>
						router.push({
							pathname: "/selectAsset",
							params: { comingFrom },
						})
					}
				/>
			);
		}

		if (type === "user") {
			return (
				<AssignInput
					label={label}
					comingFrom={comingFrom}
					onPress={() =>
						router.push({
							pathname: "/selectUser",
							params: { comingFrom },
						})
					}
				/>
			);
		}

		if (type === "date") {
			return (
				<AssignInput
					label={label}
					comingFrom={comingFrom}
					onPress={() => {
						setActiveDateField(field);
						setIsDatePickerVisible(true);
					}}
				/>
			);
		}

		return (
			<FormInput
				label={label}
				placeholder={placeholder}
				value={value}
				onChangeText={(text) => setValue(field, text)}
			/>
		);
	}
);
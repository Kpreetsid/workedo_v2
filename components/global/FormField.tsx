import AssignInput from "@/components/create-screens/AssignInput";
import DropDownInput from "@/components/create-screens/DropDownInput";
import FormInput from "@/components/create-screens/FormInput";
import React from "react";
import AssignInputNew from "../create-screens/AssignInputNew";

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
		setIsDatePickerVisible,
		required = true
	}: {
		label: string;
		placeholder?: string;
		field: string;
		type?: "text" | "dropdown" | "location" | "new-location" | "asset" | "new-asset" | "user" | "new-user" | "date" | "attachments";
		options?: string[];
		router?: any;
		comingFrom?: string;
		store: any; // the Zustand store hook you pass in
		setterName?: string; // optional: in case your setter name differs (like setWorkRequestForm)
		setActiveDateField?: any;
		setIsDatePickerVisible?: any;
		required?: boolean;
	}) => {
		const value = store((s: any) => s[field]);
		const setValue = store((s: any) => s[setterName]);

		console.log(`Render → ${label}`, value);


		if (type === "attachments") {
			return (
				<AssignInputNew
					label={label}
					field={field}
					placeholder={placeholder}
					comingFrom={comingFrom}
					store={store}
					displayKey="attachments"
					onPress={() => {}}
				/>
			);
		}

		if (type === "new-location") {
			return (
				<AssignInputNew
					label={label}
					field={field}
					placeholder={placeholder}
					comingFrom={comingFrom}
					store={store}
					displayKey="location_name"
					onPress={() =>
						router.push({
							pathname: "/selectLocation",
							params: { comingFrom },
						})
					}
				/>
			);
		}

		if (type === "new-asset") {
			return (
				<AssignInputNew
					label={label}
					field={field}
					placeholder={placeholder}
					comingFrom={comingFrom}
					store={store}
					displayKey="asset_name"
					onPress={() =>
						router.push({
							pathname: "/selectAsset",
							params: { comingFrom },
						})
					}
				/>
			);
		}


		if (type === "new-user") {
			return (
				<AssignInputNew
					label={label}
					field={field}
					placeholder={placeholder}
					comingFrom={comingFrom}
					store={store}
					setterName={setterName}
					required={false}
					displayKey="username"
					onPress={() =>
						router.push({
							pathname: "/selectUser",
							params: { comingFrom },
						})
					}
				/>
			);
		}

		if (type === "dropdown") {
			return (
				<DropDownInput
					label={label}
					field={field}
					store={store}
					options={options || []}
					displayKey={field}
					onSelect={(val) => setValue(field, val)}
				/>
			);
		}

		if (type === "location") {
			return (
				<AssignInput
					label={label}
					field={field}
					comingFrom={comingFrom}
					store={store}
					displayKey="location_name"
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
					field={field}
					store={store}
					displayKey="asset_name"
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
					field={field}
					store={store}
					displayKey="username"
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
					field={field}
					store={store}
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
				required={required}
				value={value}
				onChangeText={(text) => setValue(field, text)}
			/>
		);
	}
);
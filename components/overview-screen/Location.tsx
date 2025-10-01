import { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Dropdown from "@/components/overview-screen/DropDown";

interface Option {
	label: string;
	value: string;
}

const parentOptions: Option[] = [
	{ label: "Noida", value: "noida" },
	{ label: "Delhi", value: "delhi" },
	{ label: "Mumbai", value: "mumbai" },
	{ label: "Punjab", value: "punjab" },
	{ label: "Bihar", value: "bihar" },
	{ label: "Kolkata", value: "kolkata" },
	{ label: "Hyderabad", value: "hyderabad" },
	{ label: "Goa", value: "goa" },
	{ label: "Nepal", value: "nepal" },
	{ label: "SriLanka", value: "sriLanka" },
	{ label: "Bangladesh", value: "bangladesh" },
];

const childOptions: Option[] = [
	{ label: "Building A", value: "a" },
	{ label: "Building B", value: "b" },
];

export default function Location() {
	const [parentLocation, setParentLocation] = useState<string>("noida");
	const [childLocation, setChildLocation] = useState<string>("");
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	return (
		<>
			{openDropdown && (
				<TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpenDropdown(null)} />
			)}
			<View style={styles.container}>
				<Dropdown
					name="parent"
					label="Parent Location"
					options={parentOptions}
					value={parentLocation}
					onValueChange={setParentLocation}
					openDropdown={openDropdown}
					setOpenDropdown={setOpenDropdown}
				/>

				<Dropdown
					name="child"
					label="Child Location"
					options={childOptions}
					value={childLocation}
					onValueChange={setChildLocation}
					openDropdown={openDropdown}
					setOpenDropdown={setOpenDropdown}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		paddingTop: 20,
		paddingHorizontal: 20,
		alignItems: "center",
		gap: 25,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 99,
	},
});

import { Text, View, StyleSheet, Pressable, ViewStyle, TextStyle, GestureResponderEvent } from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { FC } from "react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";

interface AssignInputProps {
	label: string;
	comingFrom?: string;
	required?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	containerStyle?: ViewStyle;
	labelStyle?: TextStyle;
	buttonStyle?: ViewStyle;
	buttonTextStyle?: TextStyle;
}

const AssignInput: FC<AssignInputProps> = ({ label, comingFrom, required = true, onPress, containerStyle, labelStyle, buttonStyle, buttonTextStyle }) => {

	// console.log('coming from in assign input = ', label, comingFrom);

	const selectedPartLocation = usePreventiveStore((state) => state.location);
	const assignedUsers = usePreventiveStore((state) => state.assigned_users);
	const startDate = usePreventiveStore((state) => state.start_date);
	const selectedAsset = usePreventiveStore((state) => state.selected_asset);


	// newWorkOrder
	const workOrderLocation = useWorkOrderStore((state) => state.location);
	const workOrderUsers = useWorkOrderStore((state) => state.assigned_users);
	const workOrderStartDate = useWorkOrderStore((state) => state.start_date);
	const workOrderEndDate = useWorkOrderStore((state) => state.end_date);
	const workOrderAsset = useWorkOrderStore((state) => state.selected_asset);

	// newWorkRequest
	const workRequestLocation = useWorkRequestStore((state) => state.location);
	const workRequestAsset = useWorkRequestStore((state) => state.selected_asset);

	// create Part
	const partLocation = usePartFormStore((state) => state.location);

	return (
		<Pressable style={[styles.container, containerStyle]} onPress={onPress}>
			<View style={styles.labelContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
					<Text style={[styles.labelText, labelStyle]}>{label}</Text>
					{required && <Text style={styles.asterisk}>*</Text>}
				</View>

				{label === "Location" && comingFrom !== "newWorkOrder" && selectedPartLocation && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{selectedPartLocation?.location_name}</Text>
					</View>
				)}


				{label === "Location" && comingFrom === "newWorkOrder" && workOrderLocation && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workOrderLocation?.location_name}</Text>
					</View>
				)}


				{label === "Location" && comingFrom === "newWorkRequest" && workRequestLocation && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workRequestLocation?.location_name}</Text>
					</View>
				)}


				{label === "Location" && comingFrom === "createPart" && partLocation && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{partLocation?.location_name}</Text>
					</View>
				)}

				{label === "Assign User" && comingFrom !== "newWorkOrder" && assignedUsers?.length > 0 && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>
							{assignedUsers?.map((u: any) => u.username).join(", ")}
						</Text>
					</View>
				)}

				{label === "Assign User" && comingFrom === "newWorkOrder" && workOrderUsers?.length > 0 && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>
							{workOrderUsers?.map((u: any) => u.username).join(", ")}
						</Text>
					</View>
				)}

				{label === "Start Date" && comingFrom !== "newWorkOrder" && startDate && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{startDate}</Text>
					</View>
				)}

				{label === "Start Date" && comingFrom === "newWorkOrder" && workOrderStartDate && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workOrderStartDate}</Text>
					</View>
				)}

				{label === "Asset" && comingFrom !== "newWorkOrder" && selectedAsset && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{selectedAsset?.asset_name}</Text>
					</View>
				)}

				{label === "Asset" && comingFrom === "newWorkOrder" && workOrderAsset && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workOrderAsset?.asset_name}</Text>
					</View>
				)}


				{label === "Asset" && comingFrom === "newWorkRequest" && workRequestAsset && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workRequestAsset?.asset_name}</Text>
					</View>
				)}

				{label === "End Date" && comingFrom === "newWorkOrder" && workOrderEndDate && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{workOrderEndDate}</Text>
					</View>
				)}
			</View>
			<View style={[styles.buttonContainer, buttonStyle]}>
				<Text style={[styles.buttonText, buttonTextStyle]}>Assign</Text>
				<ArrowRight />
			</View>
		</Pressable>
	);
};

export default AssignInput;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#FFFFFF",
		marginHorizontal: 25,
		marginVertical: 7.5,
		borderRadius: 8,
		borderWidth: 0.6,
		borderColor: "#E1E8EE",
		height: 50,
		paddingHorizontal: 25,
	},
	labelContainer: {
		flexDirection: "column",
		alignItems: "flex-start",
		justifyContent: "space-between",
	},
	labelText: {
		fontSize: 11,
		fontFamily: Fonts.semiBold,
		color: "#201F23",
	},
	asterisk: {
		color: "#D63928",
		fontSize: 12,
		fontFamily: Fonts.regular,
		marginTop: -2,
		marginLeft: 2,
	},
	buttonContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#742BDE",
		width: 70,
		height: 28,
		justifyContent: "center",
		gap: 5,
		borderRadius: 5,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
});

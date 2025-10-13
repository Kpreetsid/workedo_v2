import { Text, View, StyleSheet, Pressable, ViewStyle, TextStyle, GestureResponderEvent } from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { FC } from "react";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";

interface AssignInputProps {
	label: string;
	required?: boolean;
	onPress?: (event: GestureResponderEvent) => void;
	containerStyle?: ViewStyle;
	labelStyle?: TextStyle;
	buttonStyle?: ViewStyle;
	buttonTextStyle?: TextStyle;
}

const AssignInput: FC<AssignInputProps> = ({ label, required = true, onPress, containerStyle, labelStyle, buttonStyle, buttonTextStyle }) => {
	const selectedPartLocation = usePreventiveStore((state) => state.formData.location);
	const assignedUsers = usePreventiveStore((state) => state.formData.assigned_users);
	const startDate = usePreventiveStore((state) => state.formData.start_date);
	const selectedAsset = usePreventiveStore((state) => state.formData.selected_asset);

	return (
		<View style={[styles.container, containerStyle]}>
			<View style={styles.labelContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
					<Text style={[styles.labelText, labelStyle]}>{label}</Text>
					{required && <Text style={styles.asterisk}>*</Text>}
				</View>

				{label === "Location" && selectedPartLocation && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{selectedPartLocation?.location_name}</Text>
					</View>
				)}

				{label === "Assign User" && assignedUsers?.length > 0 && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>
							{assignedUsers?.map((u: any) => u.username).join(", ")}
						</Text>
					</View>
				)}

				{label === "Start Date" && startDate && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{startDate}</Text>
					</View>
				)}

				{label === "Asset" && selectedAsset && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text style={[styles.labelText, { fontFamily: Fonts.light, fontSize: 10 }]}>{selectedAsset?.asset_name}</Text>
					</View>
				)}
			</View>
			<Pressable style={[styles.buttonContainer, buttonStyle]} onPress={onPress}>
				<Text style={[styles.buttonText, buttonTextStyle]}>Assign</Text>
				<ArrowRight />
			</Pressable>
		</View>
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

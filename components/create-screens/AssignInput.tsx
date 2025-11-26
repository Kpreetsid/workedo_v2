import {
	Text,
	View,
	StyleSheet,
	Pressable,
	ViewStyle,
	TextStyle,
	GestureResponderEvent,
} from "react-native";
import Fonts from "@/constants/Typography";
import { ArrowRight } from "@/constants/IconProvider";
import { FC } from "react";

interface AssignInputProps {
	label: string;
	field?: string;
	store?: any;
	type?: string;
	comingFrom?: string;
	displayKey?: string; // key to show (like username, asset_name)
	onPress?: (event: GestureResponderEvent) => void;
	required?: boolean;
	containerStyle?: ViewStyle;
	labelStyle?: TextStyle;
	buttonStyle?: ViewStyle;
	buttonTextStyle?: TextStyle;
}

const AssignInput: FC<AssignInputProps> = ({
	label,
	field,
	store,
	comingFrom,
	type,
	displayKey,
	required = true,
	onPress,
	containerStyle,
	labelStyle,
	buttonStyle,
	buttonTextStyle,
}) => {
	// ✅ Call Zustand hook only if both store and field exist
	let value: any = null;
	if (store && field) {
		console.log('store = ', store)
		console.log('field = ', field)

		try {
			value = store((state: any) => state[field]);
			console.log('store value = ', value);
		} catch (err) {
			value = null;
		}
	}

	// ✅ Render display value dynamically
	let displayValue: string | null = null;

	if (value) {
		if (Array.isArray(value)) {
			displayValue = value.map((item) => item?.[displayKey || "username"]).join(", ");
		} else if (typeof value === "object") {
			displayValue =
				value?.[displayKey || "name"] ||
				value?.name ||
				value?.title ||
				value?.toString?.();
		} else {
			displayValue = value;
		}

		console.log('display value = ', displayValue)
	}

	return (
		<Pressable style={[styles.container, containerStyle]} onPress={onPress}>
			<View style={styles.labelContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
					<Text style={[styles.labelText, labelStyle]}>{label}</Text>
					{required && <Text style={styles.asterisk}>*</Text>}
				</View>

				{displayValue && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
						<Text
							style={[
								styles.labelText,
								{ fontFamily: Fonts.light, fontSize: 10 },
							]}
							numberOfLines={1}
						>
							{displayValue}
						</Text>
					</View>
				)}
			</View>

			<View style={[styles.buttonContainer, buttonStyle]}>
				<Text style={[styles.buttonText, buttonTextStyle]}>
					{
						field === "tasks" ? "Create Task" : (field === "parts" ? "Add Parts" : "Assign")
					}
				</Text>
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
		flex: 1,
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
		// width: 70,
		paddingHorizontal: 10,
		height: 28,
		justifyContent: "center",
		gap: 5,
		borderRadius: 5,
		elevation: 5,
		shadowColor: "rgba(116, 43, 222, 0.80)",
		shadowOffset: {
			width: 2,
			height: 2,
		},
		shadowOpacity: 0.60,
		shadowRadius: 2,
	},
	buttonText: {
		fontSize: 10,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
		lineHeight: 20,
	},
});
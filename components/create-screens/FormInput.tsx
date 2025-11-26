import { View, Text, TextInput, TextInputProps, StyleSheet, ViewStyle, TextStyle, GestureResponderEvent, Pressable } from "react-native";
import Fonts from "@/constants/Typography";
import { FC } from "react";
import Dropdown from "../overview-screen/DropDown";
import DropDownInput from "./DropDownInput";

interface FormInputProps extends TextInputProps {
	label: string;
	required?: boolean;
	type?: "dropdown" | "text";
	selectedPart?: string;
	setSelectedPart?: (value: string) => void;
	onPress?: (event: GestureResponderEvent) => void;
	containerStyle?: ViewStyle;
	inputContainer?: ViewStyle;
	labelStyle?: TextStyle;
	inputStyle?: TextStyle;
}

const FormInput: FC<FormInputProps> = ({ label, required = true, type = "text", selectedPart, setSelectedPart, containerStyle, labelStyle, inputStyle, inputContainer, onPress, ...textInputProps }) => {

	return (
		<>
			{
				type === "text" ?
					<View style={[styles.container, containerStyle]}>
						<View style={styles.labelContainer}>
							<Text style={[styles.labelText, labelStyle]}>{label}</Text>
							{required && <Text style={styles.asterisk}>*</Text>}
						</View>

						<Pressable style={[styles.field, inputContainer]} onPress={onPress}>
							<TextInput
								style={[styles.inputField, inputStyle, (label === "Message" || label === "Description") && styles.messageInput]}
								placeholderTextColor="#6B788899"
								multiline={label === "Message" || label === "Description"}
								textAlignVertical="top"
								{...textInputProps}
							/>
						</Pressable>
					</View>
					:
					<DropDownInput label="Measuring Point Location" value={selectedPart} options={["DE", "NDE"]} onSelect={(val) => setSelectedPart!(val)} />
			}
		</>
	);
};

export default FormInput;

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 25,
		paddingVertical: 7.5,
	},
	labelContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 3,
	},
	labelText: {
		fontSize: 12,
		fontFamily: Fonts.semiBold,
		color: "#201f23",
		lineHeight: 20,
	},
	asterisk: {
		color: "#D63928",
		fontSize: 14,
		fontFamily: Fonts.regular,
		marginTop: -3,
		marginLeft: 2,
	},
	field: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: "#E1E8EE",
	},
	inputField: {
		padding: 10,
		fontSize: 12,
		color: "#1C1C1C",
		fontFamily: Fonts.light,
	},
	messageInput: {
		height: 80,
		textAlignVertical: "top"
	},
});

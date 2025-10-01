import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import Fonts from "../../constants/Typography";
import { Icons } from "@/constants/IconProvider";

interface FieldProps extends Omit<TextInputProps, "secureTextEntry" | "placeholder"> {
	icon: keyof typeof Icons;
	placeholder?: string;
	secure?: boolean;
	style?: ViewStyle;
}

export default function Field({ icon, placeholder, secure = false, style, ...rest }: FieldProps) {
	const IconComponent = Icons[icon];

	return (
		<View style={[styles.field, style]}>
			{IconComponent && <IconComponent />}
			<TextInput
				placeholder={placeholder}
				placeholderTextColor="#999"
				style={styles.inputField}
				secureTextEntry={secure}
				{...rest}
			/>
		</View>
	);
}


const styles = StyleSheet.create({
	field: {
		// flex: 1,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F6F4FF",
		borderRadius: 12,
		gap: 8,
		paddingLeft: 20
	},
	inputField: {
		flex: 1,
		fontSize: 11,
		color: "#1C1C1C",
		fontFamily: Fonts.regular
	},
})

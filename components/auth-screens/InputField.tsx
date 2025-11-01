import { TextInput, View, StyleSheet, TextInputProps, ViewStyle, Text, Pressable } from "react-native";
import Fonts from "../../constants/Typography";
import { Icons } from "@/constants/IconProvider";
import { Controller } from "react-hook-form";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";

interface FieldProps extends Omit<TextInputProps, "secureTextEntry" | "placeholder"> {
	icon?: keyof typeof Icons;
	placeholder?: string;
	secure?: boolean;
	style?: ViewStyle;

	name: string;
	control: any;
	rules?: any;
}

export default function Field({
	icon,
	placeholder,
	secure = false,
	style,
	name,
	control,
	rules,
	...rest
}: FieldProps) {
	const IconComponent = Icons[icon!];
	const [showPassword, setShowPassword] = useState(false);

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, value }, fieldState: { error } }) => (
				<View style={[styles.wrapper, style]}>
					<View style={styles.field}>
						{IconComponent && <IconComponent />}
						<TextInput
							placeholder={placeholder}
							placeholderTextColor="#999"
							style={styles.inputField}
							secureTextEntry={secure && !showPassword}
							value={value}
							onChangeText={onChange}
							multiline={name == "description" ? true : false}
						/>
						{
							secure && (
								<Pressable onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
									<Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color="#999" />
								</Pressable>
							)
						}
					</View>
					{error && <Text style={styles.error}>{error.message}</Text>}
				</View>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
	},
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
	error: {
		color: "red",
		fontSize: 11,
		marginTop: 2,
	},
	icon: {
		alignSelf: "center",
		marginRight: 20
	}
})
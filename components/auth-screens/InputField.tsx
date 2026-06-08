import { TextInput, View, StyleSheet, TextInputProps, ViewStyle, Text, Pressable } from "react-native";
import Fonts from "../../constants/Typography";
import { Icons } from "@/constants/IconProvider";
import { Controller } from "react-hook-form";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import CountrySelect from 'react-native-country-select';

interface FieldProps extends Omit<TextInputProps, "secureTextEntry" | "placeholder"> {
	icon?: keyof typeof Icons;
	placeholder?: string;
	secure?: boolean;
	style?: ViewStyle;

	name: string;
	control: any;
	rules?: any;
	readonly?: boolean;
	comingFrom?: string;
}

export default function Field({
	icon,
	placeholder,
	secure = false,
	style,
	name,
	control,
	rules,
	readonly = false,
	comingFrom,
	...rest
}: FieldProps) {
	const IconComponent = Icons[icon!];
	const [showPassword, setShowPassword] = useState(false);

	return (
		<Controller
			control={control}
			name={name}
			rules={rules}
			render={({ field: { onChange, value }, fieldState: { error } }) => {

				// 🔥 SPECIAL UI FOR PHONE FIELD ONLY
				if (name === "phone") {
					const [selectedCountry, setSelectedCountry] = useState({
						flag: "🇮🇳",
						callingCode: "+91",
						cca2: ""
					});

					const [modalVisible, setModalVisible] = useState(false);

					return (
						<View style={[styles.wrapper, style]}>

							{/* Phone input container */}
							<View style={styles.phoneContainer}>

								<Text style={styles.floatingLabel}>
									{placeholder} {rules?.required && <Text style={{ color: "red" }}>*</Text>}
								</Text>

								{/* Country Picker */}
								<Pressable
									style={styles.flagBox}
									onPress={() => setModalVisible(true)}
								>
									<Text style={styles.flag}>{selectedCountry.flag}</Text>
									<Ionicons name="chevron-down" size={14} color="#333" />
								</Pressable>

								{/* Dial Code */}
								<Text style={styles.dialCode}>
									{selectedCountry.callingCode}
								</Text>

								{/* Phone Input */}
								<TextInput
									style={styles.phoneInput}
									// placeholder={placeholder}
									keyboardType="phone-pad"
									placeholderTextColor="#222"
									onChangeText={(text) => {
										const cleaned = text.replace(/[^0-9]/g, "");
										const fullNumber = `${selectedCountry.callingCode}${cleaned}`;
										onChange({
											countryCode: selectedCountry.callingCode,
											number: cleaned,
											full: selectedCountry.callingCode + cleaned,
											flag: selectedCountry.flag,
											country: selectedCountry, // optional
										});

									}}
									value={value?.number ?? ""}
								/>

							</View>

							{/* Country Modal */}
							<CountrySelect
								visible={modalVisible}
								onClose={() => setModalVisible(false)}
								onSelect={(country) => {
									const digitsOnly = value?.number ?? ""; // we already stored number separated

									onChange({
										countryCode: country.idd.root,
										number: digitsOnly,
										full: country.idd.root + digitsOnly,
										flag: country.flag,
										country: country.cca2,
									});

									setSelectedCountry({
										flag: country.flag,
										callingCode: country.idd.root,
										cca2: country.cca2
									});
									setModalVisible(false);
								}}
								searchPlaceholder="Search country"
							/>

							{error && <Text style={styles.error}>{error.message}</Text>}
						</View>
					);
				}

				// 🔥 DEFAULT UI (unchanged)
				return (
					<View style={[styles.wrapper, style]}>
						<View style={
							[
								styles.field,
								name == "description" ? { height: 83 } : { height: 50 },
								comingFrom === "editProfile" && { backgroundColor: "#F6F4FF" }
							]
						}
						>

							<Text style={[styles.floatingLabel, comingFrom === "editProfile" && { opacity: 0.5 }]}>
								{placeholder} {rules?.required && <Text style={{ color: "red" }}>*</Text>}
							</Text>

							{IconComponent && <IconComponent />}
							<TextInput
								readOnly={readonly}
								placeholderTextColor="#222"
								style={[styles.inputField]}
								// , comingFrom === "editProfile" && { opacity: 0.5 }
								secureTextEntry={secure && !showPassword}
								value={value}
								onChangeText={onChange}
								multiline={name == "description"}
							/>
							{secure && (
								<Pressable
									onPress={() => setShowPassword(!showPassword)}
									style={styles.icon}
								>
									<Ionicons
										name={showPassword ? "eye" : "eye-off"}
										size={18}
										color="#999"
									/>
								</Pressable>
							)}
						</View>
						{error && <Text style={styles.error}>{error.message}</Text>}
					</View>
				);
			}}
		/>
	);
}

const styles = StyleSheet.create({
	floatingLabel: {
		position: "absolute",
		top: -8,
		left: 16,
		backgroundColor: "#fff",
		paddingHorizontal: 6,
		fontSize: 10,
		color: "#1C1C1C",
		zIndex: 10,
	},

	wrapper: {
		width: "100%",
	},

	/* ------------------ PHONE FIELD STYLES ------------------ */

	countryBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "transparent",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},

	flag: {
		fontSize: 18,
		marginRight: 6,
	},

	countryCode: {
		fontSize: 13,
		fontFamily: Fonts.semiBold,
		color: "#1C1C1C",
	},

	phoneInput: {
		flex: 1,
		fontSize: 13,
		color: "#1C1C1C",
		fontFamily: Fonts.regular,
	},

	/* ------------------ DEFAULT FIELD ------------------ */
	field: {
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		// backgroundColor: "orange",
		// backgroundColor: "#F6F4FF",
		backgroundColor: "#fff",
		borderRadius: 12,
		gap: 8,
		paddingLeft: 20,
		borderWidth: 1,
		// borderColor: 'red',
		// borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#F0EDFF'
	},

	inputField: {
		flex: 1,
		fontSize: 11,
		color: "#1C1C1C",
		fontFamily: Fonts.regular,
	},

	error: {
		color: "red",
		fontSize: 10,
		marginTop: 2,
	},

	icon: {
		alignSelf: "center",
		marginRight: 20,
	},


	phoneContainer: {
		flexDirection: "row",
		alignItems: "center",
		// backgroundColor: "#F6F4FF",
		backgroundColor: "#fff",
		borderRadius: 12,
		paddingHorizontal: 12,
		height: 50,
		gap: 10,
		borderWidth: 1,
		borderColor: '#F0EDFF'
	},

	flagBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "transparent",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},


	dialCode: {
		fontSize: 13,
		fontFamily: Fonts.regular,
		color: "#222",
	},


});

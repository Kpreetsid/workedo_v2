import { StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import { Logo } from "@/constants/IconProvider";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import Field from "@/components/auth-screens/InputField";
import ActionButton from "@/components/auth-screens/ActionButton";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useForm } from "react-hook-form";
import { registerService } from "@/src/services/auth.service";
import { AuthPayload, useAuthFlowStore } from "@/src/store/useAuthFlowStore";

type RegisterFormValues = {
	companyName: string;
	industryType: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: any;
	username: string;
	password: string;
	confirmPassword: string;
	description?: string;
};

export default function RegisterScreen() {
	const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<RegisterFormValues>({
		defaultValues: {
			companyName: "",
			industryType: "",
			firstName: "",
			lastName: "",
			email: "",
			phone: "",
			username: "",
			password: "",
			confirmPassword: "",
			description: "",
		},
	});

	const password = watch("password");

	const { setAuthFlow } = useAuthFlowStore();

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			console.log('form values = ', values);

			let payload: AuthPayload = {
				"firstName": values.firstName,
				"lastName": values.lastName,
				"username": values.username,
				"email": values.email,
				"isFirstUser": true,
				"phone_no": {
					"number": values.phone.number,
					"internationalNumber": values.phone.full,
					"nationalNumber": values.phone.number,
					"e164Number": values.phone.full,
					"countryCode": values.phone.country,
					"dialCode": values.phone.countryCode
				},
				"password": values.password,
				"account_name": values.companyName,
				"type": values.industryType,
				"description": values.description ?? ""
			}
			console.log('payload sign up = ', payload);

			setAuthFlow("signUp", payload);

			// You can send the data to your registerService here
			try {
				const res = await registerService(payload);
				console.log('res sign up = ', res);
				if (res?.status) {
					ToastAndroid.show(res.message, ToastAndroid.LONG);
					router.push("/otpVerification");
				}
			} catch (e: any) {
				console.log('error in sign up = ', e);
				ToastAndroid.show(e.message, ToastAndroid.LONG);
			}
		} catch (err: any) {
			console.error("Register failed:", err?.message || err);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bottomOffset={30}>
				<AuthHeader title="Already have an account?" btnText="Log In" onPress={() => router.push("/")} />
				<View style={styles.logoContainer}><Logo /></View>

				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />
					<Text style={styles.title}>Join Us Today! 🚀</Text>
					<Text style={styles.subtitle}>Create Your Account Below</Text>

					<View style={styles.row}>
						<Field
							icon="company"
							name="companyName"
							control={control}
							placeholder="Company Name"
							rules={{ required: "Company Name is required" }}
							style={{ flex: 1 }}
						/>
						<Field
							icon="industry"
							name="industryType"
							control={control}
							placeholder="Industry Type"
							rules={{ required: "Industry Type is required" }}
							style={{ flex: 1 }}
						/>
					</View>

					<View style={styles.row}>
						<Field
							icon="person"
							name="firstName"
							control={control}
							placeholder="First Name"
							rules={{
								required: "First name is required",
								// pattern: {
								// 	value: /^[0-9]{10,15}$/,
								// 	message: "Enter a valid phone number",
								// },
							}}
							style={{ flex: 1 }}
						/>
						<Field
							icon="person"
							name="lastName"
							control={control}
							placeholder="Last Name"
							rules={{
								// required: "Last name is required",
								// minLength: {
								// 	value: 2,
								// 	message: "Username must be at least 2 characters",
								// },
								// maxLength: {
								// 	value: 10000,
								// 	message: "Username must be less than 10000 characters",
								// },
								// pattern: {
								// 	value: /^[a-zA-Z0-9_]+$/,
								// 	message: "Only letters, numbers, and underscores are allowed",
								// },
							}}
							style={{ flex: 1 }}
						/>
					</View>

					<View style={styles.row}>
						<Field
							icon="email"
							name="email"
							control={control}
							placeholder="Email ID"
							rules={{
								required: "Email is required",
								pattern: {
									value: /\S+@\S+\.\S+/,
									message: "Enter a valid email address",
								},
							}}
							style={{ flex: 1 }}
						/>
						<Field
							icon="person"
							name="username"
							control={control}
							placeholder="Username"
							rules={{
								required: "Username is required",
								// minLength: {
								// 	value: 2,
								// 	message: "Username must be at least 2 characters",
								// },
								// maxLength: {
								// 	value: 10000,
								// 	message: "Username must be less than 10000 characters",
								// },
								// pattern: {
								// 	value: /^[a-zA-Z0-9_]+$/,
								// 	message: "Only letters, numbers, and underscores are allowed",
								// },
							}}
							style={{ flex: 1 }}
						/>
					</View>


					<View style={styles.row}>
						<Field
							icon="lock"
							name="password"
							control={control}
							placeholder="Password"
							secure
							rules={{
								required: "Password is required",
								minLength: { value: 8, message: "Password must be at least 8 characters" },
							}}
							style={{ flex: 1 }}
						/>
						<Field
							icon="lock"
							name="confirmPassword"
							control={control}
							placeholder="Confirm Password"
							secure
							rules={{
								required: "Please confirm your password",
								validate: (value: any) => value === password || "Passwords do not match",
							}}
							style={{ flex: 1 }}
						/>
					</View>


					<View style={styles.row}>
						<Field
							name="phone"
							control={control}
							placeholder="Phone Number"
							rules={{
								required: "Phone number is required",
								// pattern: {
								// 	value: /^[0-9]{10,15}$/,
								// 	message: "Enter a valid phone number",
								// },
							}}
							style={{ flex: 1 }}
						/>
					</View>

					<Field
						name="description"
						control={control}
						placeholder="Description"
						rules={{
							required: "Description is required",
							maxLength: { value: 200, message: "Description too long" },
						}}
						style={{ width: "100%", ...styles.input, ...styles.description }}
					/>

					<ActionButton
						label={isSubmitting ? "Registering..." : "Register"}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					/>

					<Text style={styles.terms}>
						By continuing, you agree to our
					</Text>
					<View style={styles.policyRow}>
						<Text style={styles.link}>Terms of Service</Text>
						<Text style={styles.dot}> • </Text>
						<Text style={styles.link}>Privacy Policy</Text>
						<Text style={styles.dot}> • </Text>
						<Text style={styles.link}>Content Policies</Text>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#742BDE",
	},
	logoContainer: {
		alignSelf: "center",
		marginVertical: 70,
	},
	handle: {
		width: 75,
		height: 5,
		borderRadius: 2,
		backgroundColor: "#D9D9D9",
		alignSelf: "center",
		marginBottom: 15,
	},
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 16,
		paddingTop: 20,
	},
	cardShadow: {
		width: '92%',
		height: 30,
		backgroundColor: '#D6B8FF',
		alignSelf: "center",
		borderTopLeftRadius: 100,
		borderTopRightRadius: 100,
		position: 'absolute',
		top: -10,
		zIndex: -1,
	},
	title: {
		fontSize: 20,
		fontFamily: Fonts.semiBold,
		textAlign: "center",
		color: "#000000",
	},
	subtitle: {
		fontSize: 12,
		textAlign: "center",
		color: "#00000099",
		fontFamily: Fonts.light,
		marginBottom: 30,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 12,
	},
	input: {
		backgroundColor: "#F6F4FF",
		borderRadius: 12,
		fontSize: 11,
		color: "#1C1C1C",
		fontFamily: Fonts.regular,
		marginBottom: 12,
	},
	description: {
		height: 83,
		backgroundColor: '#fff',
		textAlignVertical: "top",
	},
	terms: {
		textAlign: "center",
		fontSize: 12,
		color: "#444",
		marginTop: 25,
		fontFamily: Fonts.regular,
	},
	policyRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 4,
		flexWrap: "wrap",
		paddingHorizontal: 16,
		marginBottom: 20,
	},
	link: {
		fontSize: 12,
		color: "#6C3EFF",
		fontFamily: Fonts.light
	},
	dot: {
		color: "#444",
		fontSize: 12,
	},
});

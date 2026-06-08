import { View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid } from "react-native";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo } from "@/constants/IconProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import ActionButton from "@/components/auth-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useForm } from "react-hook-form";
import Field from "@/components/auth-screens/InputField";

import { loginService } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { storage } from "@/src/storage/mmkv";
import { migrateLegacyAuthToken, setAuthToken } from "@/src/storage/secureAuth";
import { useEffect } from "react";
import { useRouter } from "expo-router";

type LoginFormValues = {
	username: string;
	password: string;
};

export default function Login() {
	const router = useRouter();
	const {
		control,
		handleSubmit,
		formState: { isSubmitting }
	} = useForm<LoginFormValues>({
		defaultValues: {
			username: "",
			password: ""
			// username: "abhay_test",
			// username: "test",
			// password: "12345"
		},
	});

	const setUser = useAuthStore((state) => state.setUser);

	useEffect(() => {
		migrateLegacyAuthToken();
	}, []);

	const onSubmit = async (values: LoginFormValues) => {
		try {
			const res = await loginService(values.username, values.password);

			if (res?.error || res?.error?.message === "Invalid credentials") {
				const errorMsg =
					res?.error?.message ||
					"Login failed. Please check your credentials.";
				ToastAndroid.show(errorMsg, ToastAndroid.SHORT);
				return;
			}

			if (res?.status) {
				await setAuthToken(res?.data?.token);
				storage.set('user', JSON.stringify(res?.data?.userDetails));
				setUser(res?.data?.userDetails);
				ToastAndroid.show("Login successful!", ToastAndroid.SHORT);
				router.replace("/overview");
			}

		} catch (err: any) {
			console.error("Login failed:", err);
			const errMsg = err?.message || "Something went wrong. Please try again.";
			ToastAndroid.show(errMsg, ToastAndroid.SHORT);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<AuthHeader title="Don't have an account yet?" btnText="Get Started" onPress={() => router.push("/signUp")} />
				<View style={styles.logoContainer}>
					<Logo />
				</View>

				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />
					<Text style={styles.title}>Welcome Back! 👋</Text>
					<Text style={styles.subtitle}>Enter Your Details Below</Text>

					<View style={styles.col}>
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
								// 	value: 1000,
									// message: "Username must be less than 1000 characters",
								// },
								// pattern: {
								// 	value: /^[a-zA-Z0-9_]+$/,
								// 	message: "Only letters, numbers, and underscores are allowed",
								// },
							}}
						/>

						{/* Password Field */}
						<Field
							icon="lock"
							name="password"
							control={control}
							placeholder="Password"
							secure
							rules={{
								required: "Password is required",
								// minLength: { value: 8, message: "At least 8 characters" },
							}}
						/>
					</View>

					<ActionButton
						label={isSubmitting ? "Logging in..." : "Login"}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
					/>

					<TouchableOpacity style={styles.forgotBtn} onPress={() => {
						router.push("/(auth)/forgotPassword")
					}}>
						<Text style={styles.forgotText}>Forgot Your Password?</Text>
					</TouchableOpacity>

				</View>

				<View style={styles.imageContainer}>
					<Image source={require("../../assets/images/presage.png")} style={styles.image} />
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: "100%",
		backgroundColor: "#742BDE",
	},
	logoContainer: {
		alignSelf: "center",
		marginVertical: 70,
	},
	card: {
		flex: 1,
		height: "75%",
		backgroundColor: "#fff",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 16,
		paddingTop: 10,
		position: "relative",
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
	handle: {
		width: 75,
		height: 5,
		borderRadius: 2,
		backgroundColor: "#D9D9D9",
		alignSelf: "center",
		marginBottom: 15,
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
		marginBottom: 40,
	},
	col: {
		flexDirection: "column",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 12,
	},
	forgotBtn: {
		marginVertical: 20,
		zIndex: 1,
	},
	forgotText: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		textAlign: "center",
	},
	imageContainer: {
		width: "100%",
		height: "25%",
		backgroundColor: "#fff",
	},
	image: {
		width: "100%",
		height: "100%",
		backgroundColor: '#fff'
	},
	errorText: {
		color: "red",
		fontSize: 12,
		marginTop: -8,
		marginBottom: 8,
		fontFamily: Fonts.regular,
	},
})

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
		formState: { isSubmitting },
	} = useForm<LoginFormValues>({
		defaultValues: {
			username: "",
			password: "",
		},
	});

	const setUser = useAuthStore((state) => state.setUser);

	useEffect(() => {
		const user = storage.getString("user");
		if (user) {
			setUser(JSON.parse(user));
			router.replace("/overview");
		}
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
				storage.set("token", res?.data?.token);
				storage.set("user", JSON.stringify(res?.data?.userDetails));
				setUser(res?.data?.userDetails);
				ToastAndroid.show("Login successful!", ToastAndroid.SHORT);
				router.replace("/overview");
			}
		} catch (err: any) {
			const errMsg = err?.message || "Something went wrong. Please try again.";
			ToastAndroid.show(errMsg, ToastAndroid.SHORT);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
			>
				<AuthHeader
					title="Don't have an account yet?"
					btnText="Get Started"
					onPress={() => router.push("/signUp")}
				/>

				<View style={styles.hero}>
					<View style={styles.logoContainer}>
						<Logo />
					</View>

					<View style={styles.loginShell}>
						<View style={styles.card}>
							<Text style={styles.title}>Login</Text>
							<Text style={styles.subtitle}>Welcome Back!</Text>

							<View style={styles.formBlock}>
								<Field
									icon="person"
									name="username"
									control={control}
									placeholder="Username"
									rules={{
										required: "Username is required",
									}}
								/>

								<Field
									icon="lock"
									name="password"
									control={control}
									placeholder="Password"
									secure
									rules={{
										required: "Password is required",
									}}
								/>
							</View>

							<TouchableOpacity
								style={styles.forgotBtn}
								onPress={() => router.push("/(auth)/forgotPassword")}
							>
								<Text style={styles.forgotText}>Forgot Password</Text>
							</TouchableOpacity>

							<ActionButton
								label={isSubmitting ? "Signing in..." : "Sign in"}
								onPress={handleSubmit(onSubmit)}
								disabled={isSubmitting}
								icon
								style={styles.actionButton}
							/>
						</View>

						<View style={styles.illustrationPane}>
							<Image
								source={require("../../assets/images/presage.png")}
								style={styles.illustration}
							/>
							<Text style={styles.illustrationCaption}>
								Presage CMMS keeps your maintenance workflow clear, connected, and ready for action.
							</Text>
						</View>
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
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 28,
	},
	hero: {
		flex: 1,
		paddingHorizontal: 18,
		paddingTop: 28,
		paddingBottom: 20,
	},
	logoContainer: {
		alignSelf: "center",
		marginBottom: 28,
	},
	loginShell: {
		backgroundColor: "#FFFFFF",
		borderRadius: 28,
		overflow: "hidden",
		shadowColor: "#2C0C61",
		shadowOpacity: 0.18,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
		elevation: 8,
	},
	card: {
		paddingHorizontal: 22,
		paddingTop: 28,
		paddingBottom: 24,
	},
	title: {
		fontSize: 28,
		fontFamily: Fonts.semiBold,
		textAlign: "left",
		color: "#742BDE",
	},
	subtitle: {
		fontSize: 16,
		textAlign: "left",
		color: "#8E76BE",
		fontFamily: Fonts.regular,
		marginTop: 6,
		marginBottom: 22,
	},
	formBlock: {
		gap: 16,
		marginBottom: 8,
	},
	forgotBtn: {
		alignSelf: "flex-start",
		marginBottom: 18,
		marginTop: 6,
	},
	forgotText: {
		fontFamily: Fonts.medium,
		fontSize: 12,
		textAlign: "left",
		color: "#742BDE",
	},
	actionButton: {
		height: 56,
		borderRadius: 12,
		marginTop: 0,
		backgroundColor: "#742BDE",
		shadowColor: "#742BDE",
		shadowOpacity: 0.22,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	illustrationPane: {
		backgroundColor: "#F6F1FF",
		paddingHorizontal: 22,
		paddingTop: 18,
		paddingBottom: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	illustration: {
		width: "100%",
		height: 96,
		backgroundColor: "transparent",
		resizeMode: "contain",
	},
	illustrationCaption: {
		marginTop: 14,
		fontSize: 12,
		lineHeight: 18,
		color: "#6F5A93",
		fontFamily: Fonts.regular,
		textAlign: "center",
		paddingHorizontal: 10,
	},
});

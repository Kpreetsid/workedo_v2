import { BackHandler, View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid } from "react-native";
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
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

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

	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
				BackHandler.exitApp();
				return true;
			});

			return () => subscription.remove();
		}, [])
	);

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
				<View style={styles.hero}>
					<View style={styles.logoContainer}>
						<Logo />
					</View>

					<View style={styles.loginShell}>
						<View style={styles.card}>
							<View style={styles.sheetHandle} />
							<Text style={styles.title}>Welcome Back! 👋</Text>
							<Text style={styles.subtitle}>Enter Your Details Below</Text>

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

							<ActionButton
								label={isSubmitting ? "Signing in..." : "Sign in"}
								onPress={handleSubmit(onSubmit)}
								disabled={isSubmitting}
								icon
								style={styles.actionButton}
							/>

							<TouchableOpacity
								style={styles.forgotBtn}
								onPress={() => router.push("/(auth)/forgotPassword")}
							>
								<Text style={styles.forgotText}>Forgot your password?</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.illustrationPane}>
							<Image
								source={require("../../assets/images/presage_old.png")}
								style={styles.illustration}
							/>
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
		marginBottom: 34,
		marginTop: 18,
	},
	loginShell: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
		borderBottomLeftRadius: 28,
		borderBottomRightRadius: 28,
		overflow: "hidden",
		shadowColor: "#2C0C61",
		shadowOpacity: 0.18,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
		elevation: 8,
	},
	card: {
		paddingHorizontal: 22,
		paddingTop: 14,
		paddingBottom: 12,
		alignItems: "center",
	},
	sheetHandle: {
		width: 92,
		height: 6,
		borderRadius: 999,
		backgroundColor: "#DDD8E7",
		marginBottom: 18,
	},
	title: {
		fontSize: 22,
		fontFamily: Fonts.semiBold,
		textAlign: "center",
		color: "#111827",
	},
	subtitle: {
		fontSize: 15,
		textAlign: "center",
		color: "#8B8B94",
		fontFamily: Fonts.regular,
		marginTop: 6,
		marginBottom: 22,
	},
	formBlock: {
		gap: 16,
		marginBottom: 18,
		width: "100%",
	},
	forgotBtn: {
		alignSelf: "center",
		marginTop: 14,
		marginBottom: 6,
	},
	forgotText: {
		fontFamily: Fonts.medium,
		fontSize: 12,
		textAlign: "center",
		color: "#4B5563",
	},
	actionButton: {
		height: 56,
		borderRadius: 12,
		marginTop: 0,
		width: "100%",
		backgroundColor: "#742BDE",
		shadowColor: "#742BDE",
		shadowOpacity: 0.22,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	illustrationPane: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 0,
		paddingTop: 0,
		paddingBottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	illustration: {
		width: "100%",
		height: 300,
		resizeMode: "contain",
	},
});

import { View, Text, StyleSheet, TouchableOpacity, Image, ToastAndroid } from "react-native";
import { router } from "expo-router";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo } from "@/constants/IconProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import ActionButton from "@/components/auth-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Field from "@/components/auth-screens/InputField";
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "@/src/services/auth.service";
import { useAuthFlowStore } from "@/src/store/useAuthFlowStore";

interface ForgotPasswordFormValues {
	email: string;
}

export default function ForgotPassword() {
	const { setAuthFlow } = useAuthFlowStore();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting }
	} = useForm<ForgotPasswordFormValues>({
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		console.log('on submit', data);

		try {
			let obj = {
				// "email": "test@gmail.com"
				"email": data.email
			}
			console.log(obj);
			const userRes = await sendPasswordResetEmail(obj);
			console.log('userRes in forgot password = ', userRes);
			if (userRes.status) {
				ToastAndroid.show(userRes?.message, ToastAndroid.SHORT);
				setAuthFlow("resetPassword", obj);
				router.push("/otpVerification");
			}
		} catch (e: any) {
			console.log('e in forgot password = ', e);
			ToastAndroid.show(e?.message, ToastAndroid.SHORT);
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
				<AuthHeader />
				<View style={styles.hero}>
					<View style={styles.logoContainer}><Logo /></View>
					<View style={styles.card}>
						<View style={styles.sheetHandle} />
						<Text style={styles.title}>Reset Password</Text>
						<Text style={styles.subtitle}>Enter your registered email to receive verification code.</Text>

						<View style={styles.col}>
							<Field icon="email" placeholder="Email ID" name="email" control={control} rules={{
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: "Please enter a valid email address",
								},
							}} />
						</View>

						<ActionButton
							label={isSubmitting ? "Sending..." : "Submit Now"}
							onPress={handleSubmit(onSubmit)}
							disabled={isSubmitting}
							style={styles.actionButton}
						/>

						<View style={styles.imageContainer}>
							<Image source={require("../../assets/images/presage_old.png")} style={styles.image} />
						</View>
					</View>
				</View>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
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
	card: {
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
	sheetHandle: {
		width: 92,
		height: 6,
		borderRadius: 999,
		backgroundColor: "#DDD8E7",
		alignSelf: "center",
		marginTop: 14,
		marginBottom: 18,
	},
	title: {
		fontSize: 22,
		fontFamily: Fonts.semiBold,
		textAlign: "center",
		color: "#742BDE",
	},
	subtitle: {
		fontSize: 15,
		textAlign: "center",
		color: "#8B8B94",
		fontFamily: Fonts.regular,
		marginTop: 6,
		marginBottom: 22,
		paddingHorizontal: 28,
	},
	col: {
		paddingHorizontal: 22,
		marginBottom: 18,
	},
	actionButton: {
		height: 56,
		borderRadius: 12,
		marginHorizontal: 22,
		marginTop: 0,
		marginBottom: 12,
		backgroundColor: "#742BDE",
		shadowColor: "#742BDE",
		shadowOpacity: 0.22,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	imageContainer: {
		width: "100%",
		backgroundColor: "#FFFFFF",
	},
	image: {
		width: "100%",
		height: 300,
		resizeMode: "contain",
	},
})

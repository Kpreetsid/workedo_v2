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
			email: "waleedimtiaz30@gmail.com",
		},
	});

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		console.log('on submit', data);

		try {
			let obj = {
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
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<AuthHeader />
				<View style={styles.logoContainer}><Logo /></View>
				<View style={styles.card}>
					<View style={styles.handle} />
					<Text style={styles.title}>Reset Password</Text>
					<Text style={styles.subtitle}>Enter your registered email to receive verification code.</Text>

					<View style={styles.col}>
						<Field icon="email" placeholder="Email ID" name="email" control={control} rules={{
							required: "Email is required",
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // standard email regex
								message: "Please enter a valid email address",
							},
						}} />
					</View>

					<ActionButton label={isSubmitting ? "Sending..." : "Submit Now"} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />

				</View>
				<Image source={require("../../assets/images/presage.png")} style={styles.image} />
			</KeyboardAwareScrollView>
		</SafeAreaView>
	)
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
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 16,
		paddingTop: 20,
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
		color: "#742BDE",
	},
	subtitle: {
		fontSize: 12,
		textAlign: "center",
		color: "#00000099",
		fontFamily: Fonts.light,
		marginBottom: 40,
		paddingHorizontal: 30
	},
	col: {
		flexDirection: "column",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 15,
	},
	image: {
		position: "absolute",
		bottom: 0,
		right: 0,
	}
})

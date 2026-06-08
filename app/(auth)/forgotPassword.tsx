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
		try {
			let obj = {
				// "email": "test@gmail.com"
				"email": data.email
			}
			const userRes = await sendPasswordResetEmail(obj);
			if (userRes.status) {
				ToastAndroid.show(userRes?.message, ToastAndroid.SHORT);
				setAuthFlow("resetPassword", obj);
				router.push("/otpVerification");
			}
		} catch (e: any) {
			ToastAndroid.show(e?.message, ToastAndroid.SHORT);
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<AuthHeader />
				<View style={styles.logoContainer}><Logo /></View>
				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />
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

					<ActionButton label={isSubmitting ? "Sending..." : "Submit Now"} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />

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
})

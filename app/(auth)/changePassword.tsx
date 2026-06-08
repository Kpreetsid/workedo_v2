import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import AuthHeader from "../../components/auth-screens/AuthHeader";
import { Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Logo } from "../../constants/IconProvider";
import Field from "../../components/auth-screens/InputField";
import ActionButton from "../../components/auth-screens/ActionButton";
import { router } from "expo-router";
import Fonts from "../../constants/Typography";
import { useForm } from "react-hook-form";
import { changePassword } from "@/src/services/auth.service";
import { useAuthFlowStore } from "@/src/store/useAuthFlowStore";

export default function ChangePassword() {
	const {
		control,
		handleSubmit
	} = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const payload = useAuthFlowStore((state) => state.payload);
	const flowType = useAuthFlowStore((state) => state.flowType);

	const onSubmit = async (data: any) => {
		if (data.password !== data.confirmPassword) {
			ToastAndroid.show("Passwords do not match!", ToastAndroid.SHORT);
			return;
		}

		console.log("Submitted Data:", data);

		if (flowType !== "resetPassword") {
			router.push({
				pathname: "/registrationComplete",
				params: { type: "resetPassword" },
			});
		} else {
			try {
				let finalPayload = {
					"email": payload?.email,
					"newPassword": data.password,
					"confirmNewPassword": data.confirmPassword
				}
				console.log('form values = ', finalPayload);

				try {
					const res = await changePassword(finalPayload);
					console.log('res otp = ', res);
					if (res?.status) {
						ToastAndroid.show(res.message, ToastAndroid.SHORT);
						router.replace("/");
					}
				} catch (e: any) {
					console.log('error in otp = ', e);
					ToastAndroid.show(e.message, ToastAndroid.SHORT);
				}
			} catch (err: any) {
				console.error("Register failed:", err?.message || err);
			}
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<AuthHeader />
				<View style={styles.logoContainer}><Logo /></View>
				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />
					<Text style={styles.title}>Change Password</Text>
					<Text style={styles.subtitle}>Enter your new password.</Text>

					<View style={styles.col}>
						<Field
							icon="lock"
							placeholder="Enter new password"
							secure={true}
							control={control}
							name="password"
							rules={{
								required: "Password is required",
								minLength: { value: 5, message: "At least 5 characters" },
							}}
						/>

						<Field
							icon="lock"
							placeholder="Confirm new password"
							secure={true}
							control={control}
							name="confirmPassword"
							rules={{
								required: "Confirm Password is required",
								minLength: { value: 5, message: "At least 5 characters" },
							}}
						/>
					</View>

					<ActionButton
						label="Submit"
						onPress={handleSubmit(onSubmit)}
					/>

					<TouchableOpacity style={styles.cancelButton} onPress={() => router.replace("/")}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
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
	cancelButton: {
		width: "100%",
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 15,
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
		borderWidth: 0.5,
		borderColor: "#742BDE",
		zIndex: 10
	},
	cancelButtonText: {
		color: "#742BDE",
		fontFamily: Fonts.medium,
		lineHeight: 18,
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

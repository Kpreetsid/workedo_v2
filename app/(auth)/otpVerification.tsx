import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo, OTPEmailIcon } from "@/constants/IconProvider";
import { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import { router, useLocalSearchParams } from "expo-router";
import ActionButton from "@/components/auth-screens/ActionButton";
import { OTPVerificationService, resetPasswordOTPSendService } from "@/src/services/auth.service";
import { useAuthFlowStore } from "@/src/store/useAuthFlowStore";

export default function OTPVerification() {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [timer, setTimer] = useState(59);
	const inputs = useRef<TextInput[]>([]);
	const [userData, setUserData] = useState<any>(null);

	const payload = useAuthFlowStore((state) => state.payload);
	const flowType = useAuthFlowStore((state) => state.flowType);

	console.log('payload otp verification = ', payload);
	console.log('flowType otp verification = ', flowType);

	// useEffect(() => {
	// 	if (timer > 0) {
	// 		const interval = setInterval(() => setTimer((t) => t - 1), 1000);
	// 		return () => clearInterval(interval);
	// 	}
	// }, [timer]);

	const handleChange = (text: string, index: number) => {
		const newOtp = [...otp];
		newOtp[index] = text;
		setOtp(newOtp);

		if (text && index < otp.length - 1) {
			inputs.current[index + 1]?.focus();
		} else if (!text && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	const handleResend = () => {
		setTimer(59);
		setOtp(["", "", "", "", "", ""]);
	};

	const verifyPin = async () => {
		console.log('in verify pin');
		if (otp.join('') === '') {
			ToastAndroid.show('Please enter OTP', ToastAndroid.LONG);
			return;
		}

		// check 6 digit condition
		if (otp.join('').length < 6) {
			ToastAndroid.show('Please enter 6 digit OTP', ToastAndroid.LONG);
			return;
		}

		console.log('flow type = ', flowType);

		if (flowType === "resetPassword") {
			try {
				console.log('form values = ', payload);

				let finalPayload = { ...payload, verificationCode: otp.join('') };
				console.log('payload verify OTP = ', finalPayload);

				try {
					const res = await resetPasswordOTPSendService(finalPayload);
					console.log('res otp = ', res);
					if (res?.status) {
						ToastAndroid.show(res.message, ToastAndroid.LONG);
						router.push({ pathname: "/changePassword", params: { type: "resetPassword", payload: JSON.stringify(userData) } });
					}
				} catch (e: any) {
					console.log('error in otp = ', e);
					ToastAndroid.show(e.message, ToastAndroid.LONG);
				}
			} catch (err: any) {
				console.error("Register failed:", err?.message || err);
			}


		} else {
			try {
				console.log('form values = ', payload);

				let finalPayload = { ...payload, verificationCode: otp.join('') };
				console.log('payload verify OTP = ', finalPayload);

				try {
					const res = await OTPVerificationService(finalPayload);
					console.log('res otp = ', res);
					if (res?.status) {
						ToastAndroid.show(res.message, ToastAndroid.LONG);
						router.push("/registrationComplete")
					}
				} catch (e: any) {
					console.log('error in otp = ', e);
					ToastAndroid.show(e.message, ToastAndroid.LONG);
				}
			} catch (err: any) {
				console.error("Register failed:", err?.message || err);
			}
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<AuthHeader />
			<View style={styles.logoContainer}><Logo /></View>

			<KeyboardAwareScrollView contentContainerStyle={styles.sheetContainer} keyboardShouldPersistTaps="handled" bottomOffset={30}>
				<View style={styles.handle} />
				<View style={styles.iconContainer}>
					<OTPEmailIcon />
				</View>

				<Text style={styles.title}>OTP Verification</Text>

				<Text style={styles.subtitle}>
					One Time Password (OTP) has been sent via Email to{" "}
					<Text style={styles.email}>{userData?.email}</Text>
				</Text>

				<Text style={styles.instruction}>Enter the OTP below to verify it.</Text>

				<View style={styles.otpContainer}>
					{otp.map((digit, index) => (
						<TextInput
							key={index}
							ref={(ref) => {
								if (ref) inputs.current[index] = ref;
							}}
							style={styles.otpBox}
							maxLength={1}
							keyboardType="numeric"
							value={digit}
							onChangeText={(text) => handleChange(text, index)}
						/>
					))}
				</View>

				<Text style={styles.resendText}>
					Resend OTP : <Text style={styles.timer}>00:{timer.toString().padStart(2, "0")}</Text>
				</Text>

				<ActionButton
					label={flowType === "resetPassword" ? "Continue" : "Verify OTP"}
					icon={true}
					onPress={() => {
						verifyPin()
					}}
				/>

				<Text style={styles.bottomText}>
					If you didn't receive code!{" "}
					<Text style={styles.resendLink} onPress={handleResend}>Resend</Text>
				</Text>
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
	handle: {
		width: 75,
		height: 5,
		borderRadius: 2,
		backgroundColor: "#D9D9D9",
		alignSelf: "center",
	},
	sheetContainer: {
		flexGrow: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		paddingHorizontal: 20,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingTop: 20,
	},
	iconContainer: {
		padding: 20,
		marginVertical: 15
	},
	title: {
		fontSize: 18,
		fontFamily: Fonts.semiBold,
		color: "#000",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#656565",
		textAlign: "center",
		marginHorizontal: 20,
	},
	email: {
		color: "#000",
		fontFamily: Fonts.semiBold,
	},
	instruction: {
		marginTop: 25,
		marginBottom: 10,
		fontFamily: Fonts.regular,
		color: "#999999",
		fontSize: 11,
	},
	otpContainer: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 15,
		marginVertical: 15,
	},
	otpBox: {
		width: 45,
		height: 40,
		borderRadius: 4,
		borderWidth: 0.8,
		borderColor: "#656566",
		textAlign: "center",
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#000",
		backgroundColor: "#fff",
		elevation: 5,
		textAlignVertical: "center",
		includeFontPadding: false,
		paddingTop: 0,
		paddingBottom: 0,
	},
	resendText: {
		fontSize: 9,
		color: "#666",
		marginBottom: 25,
		fontFamily: Fonts.light,
		textAlign: "right",
	},
	timer: {
		color: "#656566",
		fontFamily: Fonts.semiBold,
		textAlign: "right",
	},
	bottomText: {
		marginTop: 20,
		color: "#888",
		fontFamily: Fonts.regular,
		fontSize: 12
	},
	resendLink: {
		color: "#742BDE",
		fontFamily: Fonts.semiBold,
		fontSize: 12
	},
})
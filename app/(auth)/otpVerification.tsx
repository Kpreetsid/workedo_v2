import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo, OTPEmailIcon } from "@/constants/IconProvider";
import { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Fonts from "@/constants/Typography";
import { router } from "expo-router";
import ActionButton from "@/components/auth-screens/ActionButton";
import { OTPVerificationService, resetPasswordOTPSendService, sendPasswordResetEmail } from "@/src/services/auth.service";
import { useAuthFlowStore } from "@/src/store/useAuthFlowStore";

export default function OTPVerification() {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [timer, setTimer] = useState(59);
	const inputs = useRef<TextInput[]>([]);
	const [userData, setUserData] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	const payload = useAuthFlowStore((state) => state.payload);
	const flowType = useAuthFlowStore((state) => state.flowType);

	console.log('payload otp verification = ', payload);
	console.log('flowType otp verification = ', flowType);

	useEffect(() => {
		if (userData) {
			return;
		}
		setUserData(payload);
	}, []);

	useEffect(() => {
		// setUserData({email: payload});
		if (timer > 0) {
			const interval = setInterval(() => setTimer((t) => t - 1), 1000);
			return () => clearInterval(interval);
		}
		return undefined;
	}, [timer]);

	useEffect(() => {
		console.log('user data = ', userData)
	}, [userData])

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

	const handleResend = async () => {
		console.log('on resend = ', payload);
		setLoading(true)

		try {
			let obj = {
				"email": payload?.email
			}
			const userRes = await sendPasswordResetEmail(obj);
			if (userRes.status) {
				ToastAndroid.show(userRes?.message, ToastAndroid.SHORT);

				// reset the timer and otp fields
				setTimer(59);
				setOtp(["", "", "", "", "", ""]);
			}
			setLoading(false)
		} catch (e: any) {
			ToastAndroid.show(e?.message, ToastAndroid.SHORT);
			setLoading(false)
		}
	};

	const verifyPin = async () => {
		console.log('in verify pin');
		if (otp.join('') === '') {
			ToastAndroid.show('Please enter OTP', ToastAndroid.SHORT);
			return;
		}

		// check 6 digit condition
		if (otp.join('').length < 6) {
			ToastAndroid.show('Please enter 6 digit OTP', ToastAndroid.SHORT);
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
						ToastAndroid.show(res.message, ToastAndroid.SHORT);
						router.push({ pathname: "/changePassword", params: { type: "resetPassword", payload: JSON.stringify(userData) } });
					}
				} catch (e: any) {
					console.log('error in otp = ', e);
					ToastAndroid.show(e.message, ToastAndroid.SHORT);
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
						ToastAndroid.show(res.message, ToastAndroid.SHORT);
						router.push("/registrationComplete")
					}
				} catch (e: any) {
					console.log('error in otp = ', e);
					ToastAndroid.show(e.message, ToastAndroid.SHORT);
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
				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />
					<View style={styles.iconContainer}>
						<OTPEmailIcon />
					</View>

					<Text style={styles.title}>OTP Verification</Text>

					<Text style={styles.subtitle}>
						One Time Password (OTP) has been sent via Email to{" "}
						{
							userData && <Text style={styles.email}>{userData?.email}</Text>
						}
					</Text>

					<Text style={styles.instruction}>Enter the 6 digit Verification Code!</Text>

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
						style={styles.actionButton}
						label={flowType === "resetPassword" ? "Continue" : "Verify OTP"}
						icon={flowType === "resetPassword" ? false : true}
						onPress={() => {
							verifyPin()
						}}
					/>

					<Text style={styles.bottomText}>
						If you didn't receive code!{" "}
						{
							loading ? (
								<Text style={styles.resendLink}>Resending...</Text>
							) : (
								<Text style={styles.resendLink} onPress={handleResend}>Resend</Text>
							)
						}
					</Text>
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
		width: "100%",
		paddingHorizontal: 16,
		alignItems: "center",
		backgroundColor: "#fff",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
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
	},
	sheetContainer: {
		flexGrow: 1,
		// backgroundColor: "#fff",
		alignItems: "center",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingTop: 20,
	},
	iconContainer: {
		padding: 20,
		// marginVertical: 15
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
		width: 35,
		height: 35,
		borderRadius: 4,
		borderWidth: 0.4,
		borderColor: "#665566",
		textAlign: "center",
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		color: "#000",
		backgroundColor: "#fff",
		elevation: 2,
		shadowColor: "#b6b6b6ff",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		textAlignVertical: "center",
		includeFontPadding: false,
		paddingTop: 0,
		paddingBottom: 0,
	},
	resendText: {
		width: "80%",
		fontSize: 9,
		color: "#666",
		marginBottom: 5,
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
	actionButton: {
		width: "90%",
		paddingHorizontal: 16,
	}
})

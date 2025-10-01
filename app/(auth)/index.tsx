import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import { Logo } from "@/constants/IconProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import ActionButton from "@/components/auth-screens/ActionButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Field from "@/components/auth-screens/InputField";

export default function Login() {
	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<AuthHeader title="Don't have an account yet?" btnText="Get Started" onPress={() => router.push("/signUp")} />
				<View style={styles.logoContainer}><Logo /></View>
				<View style={styles.card}>
					<View style={styles.handle} />
					<Text style={styles.title}>Welcome Back! 👋</Text>
					<Text style={styles.subtitle}>Enter Your Details Below</Text>

					<View style={styles.col}>
						<Field icon="person" placeholder="Username" />
						<Field icon="lock" placeholder="Password" secure={true} />
					</View>

					<ActionButton label="Login" onPress={() => router.push("/overview")} />

					<TouchableOpacity style={styles.forgotBtn}>
						<Text style={styles.forgotText}>Forgot Your Password?</Text>
					</TouchableOpacity>
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
	},
	forgotText: {
		fontFamily: Fonts.regular,
		fontSize: 12,
		textAlign: "center",
	},
	image: {
		position: "absolute",
		bottom: 0,
		right: 0,
	}
})

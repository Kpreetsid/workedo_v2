import { View, Text, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import { Logo } from "@/constants/IconProvider";
import AuthHeader from "@/components/auth-screens/AuthHeader";
import Field from "@/components/auth-screens/InputField";
import ActionButton from "@/components/auth-screens/ActionButton";
import { router } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function RegisterScreen() {
	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bottomOffset={30}>
				<AuthHeader title="Already have an account?" btnText="Log In" onPress={() => router.push("/")} />
				<View style={styles.logoContainer}><Logo /></View>

				<View style={styles.card}>
					<View style={styles.handle} />
					<Text style={styles.title}>Join Us Today! 🚀</Text>
					<Text style={styles.subtitle}>Create Your Account Below</Text>

					<View style={styles.row}>
						<Field icon="company" placeholder="Company Name" style={{ flex: 1 }} />
						<Field icon="industry" placeholder="Industry Type" style={{ flex: 1 }} />
					</View>

					<View style={styles.row}>
						<Field icon="person" placeholder="Full Name" style={{ flex: 1 }} />
						<Field icon="email" placeholder="Email ID" style={{ flex: 1 }} />
					</View>

					<View style={styles.row}>
						<Field icon="phone" placeholder="Phone Number" style={{ flex: 1 }} />
						<Field icon="person" placeholder="User Name" style={{ flex: 1 }} />
					</View>

					<View style={styles.row}>
						<Field icon="lock" placeholder="Password" secure style={{ flex: 1 }} />
						<Field icon="lock" placeholder="Confirm Password" secure style={{ flex: 1 }} />
					</View>

					<TextInput
						style={[styles.input, styles.description]}
						placeholder="Description"
						placeholderTextColor="#999"
						multiline
					/>

					<ActionButton label="Register" onPress={() => console.info("Register Pressed")} />

					<Text style={styles.terms}>
						By continuing, you agree to our
					</Text>
					<View style={styles.policyRow}>
						<Text style={styles.link}>Terms of Service</Text>
						<Text style={styles.dot}> • </Text>
						<Text style={styles.link}>Privacy Policy</Text>
						<Text style={styles.dot}> • </Text>
						<Text style={styles.link}>Content Policies</Text>
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
		marginBottom: 15,
	},
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		paddingHorizontal: 16,
		paddingTop: 20,
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
		marginBottom: 30,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 12,
	},
	input: {
		backgroundColor: "#F6F4FF",
		borderRadius: 12,
		paddingHorizontal: 20,
		fontSize: 11,
		color: "#1C1C1C",
		fontFamily: Fonts.regular,
		marginBottom: 12,
	},
	description: {
		height: 83,
		textAlignVertical: "top",
	},
	terms: {
		textAlign: "center",
		fontSize: 12,
		color: "#444",
		marginTop: 25,
		fontFamily: Fonts.regular,
	},
	policyRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 4,
		flexWrap: "wrap",
		paddingHorizontal: 16,
	},
	link: {
		fontSize: 12,
		color: "#6C3EFF",
		fontFamily: Fonts.light
	},
	dot: {
		color: "#444",
		fontSize: 12,
	},
});

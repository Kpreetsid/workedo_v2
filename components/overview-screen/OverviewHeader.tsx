import { Image, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Drawer, PrevisionLogo } from "@/constants/IconProvider";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { endpoints } from "@/src/api/endpoints";

export default function OverviewHeader() {
	const router = useRouter();
	const { user } = useAuthStore();
	console.log('user in overview header = ', user)

	const first = user?.firstName?.[0] || "";
	const last = user?.lastName?.[0] || "";
	const initials = (first + last).toUpperCase();

	return (
		<SafeAreaView edges={["top"]} style={styles.safeArea}>
			<View style={styles.headerContainer}>

				<TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
					<Drawer />
				</TouchableOpacity>

				<PrevisionLogo />

				{
					user?.user_profile_img ?
						<TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.push("/myAccount")}>
							<Image source={{ uri: `${endpoints.baseURL}/user_profile_img/${user?.user_profile_img}` }} style={styles.avatar} resizeMode="cover" />
						</TouchableOpacity>
						:
						<TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => router.push("/myAccount")}>
							<View style={[styles.avatar, { backgroundColor: '#666', borderRadius: 100 }]}>
								<Text style={styles.avatarInitials}>{initials}</Text>
							</View>
						</TouchableOpacity>
				}


			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#fff",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 10,
	},
	iconButton: {
		padding: 4,
	},
	avatar: {
		width: 33,
		height: 33,
		borderRadius: 17,
		justifyContent: "center",
		alignItems: "center",
	},
	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
});

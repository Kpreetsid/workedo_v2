import { Image, TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { Drawer } from "@/constants/IconProvider";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/state/auth/useAuthStore";
import { endpoints } from "@/src/services/api/endpoints";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationStore } from "@/src/state/notifications/useNotificationStore";
import { socketManager } from "@/src/services/socket/socketManager";
import { useSocketEvent } from "@/src/services/socket/socketHooks";

const PRESAGE_LOGO = require("@/assets/images/presage.png");

export default function OverviewHeader() {
	const router = useRouter();
	const { user } = useAuthStore();
	const [imgError, setImgError] = useState(false);

	const first = user?.firstName?.[0] || "";
	const last = user?.lastName?.[0] || "";
	const initials = (first + last).toUpperCase();

	const imgUri = `${endpoints.baseURL}/user_profile_img/${user?.user_profile_img}`;
	const showFallback = !imgUri || imgError;

	const { unreadCount, fetchNotifications, addNotification } = useNotificationStore();

	useEffect(() => {
		socketManager.connect();
		fetchNotifications();
	}, []);

	useSocketEvent('notification', (newNotif) => {
		addNotification(newNotif);
	});

	return (
		<SafeAreaView edges={["top"]} style={styles.safeArea}>
			<View style={styles.headerContainer}>
				
				<View style={styles.leftGroup}>
					{/* <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
						<Drawer />
					</TouchableOpacity> */}

					<Image
						source={PRESAGE_LOGO}
						style={[styles.logo, { marginLeft: 12 }]}
						resizeMode="contain"
					/>
				</View>

				<View style={styles.rightGroup}>
					<TouchableOpacity 
						style={styles.notificationButton} 
						activeOpacity={0.8}
						onPress={() => router.push("/notifications")}
					>
						<Ionicons name="notifications-outline" size={26} color="#333" />
						{unreadCount > 0 && (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>
									{unreadCount > 99 ? '99+' : unreadCount}
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.iconButton, { marginLeft: 16 }]}
						activeOpacity={0.8}
						onPress={() => router.push("/myAccount")}
					>

					{showFallback ? (
						<View style={[styles.avatar, { backgroundColor: "#666", borderRadius: 100 }]}>
							<Text style={styles.avatarInitials}>{initials}</Text>
						</View>
					) : (
						<Image
							source={{ uri: imgUri }}
							style={styles.avatar}
							resizeMode="cover"
							onError={() => setImgError(true)} // 👈 fallback trigger
						/>
					)}

					</TouchableOpacity>
				</View>

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
		width: '100%',
	},
	leftGroup: {
		flexDirection: "row",
		alignItems: "center",
	},
	rightGroup: {
		flexDirection: "row",
		alignItems: "center",
	},
	notificationButton: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 4,
	},
	badge: {
		position: 'absolute',
		top: -2,
		right: -4,
		backgroundColor: '#A259FF',
		borderRadius: 10,
		minWidth: 18,
		height: 18,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 4,
		borderWidth: 1.5,
		borderColor: '#fff',
	},
	badgeText: {
		color: '#fff',
		fontSize: 10,
		fontWeight: 'bold',
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
	logo: {
		width: 52,
		height: 40,
	},
});

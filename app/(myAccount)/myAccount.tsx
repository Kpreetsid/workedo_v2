import { View, Text, StyleSheet, TouchableOpacity, Pressable, Image, FlatList, Alert, ToastAndroid, Modal } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Fonts from "../../constants/Typography";
import { ArrowBack, CalendarIcon, Calender, StatusIcon } from "@/constants/IconProvider";
import { Entypo, EvilIcons, Feather, Ionicons, MaterialIcons, Octicons, SimpleLineIcons } from "@expo/vector-icons";
import { useState } from "react";
import { storage } from "@/src/storage/mmkv";
import { useAuthStore } from "@/src/store/useAuthStore";
import { endpoints } from "@/src/api/endpoints";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getProfileService, updateUser, updateUserInfo, uploadImage } from "@/src/services/auth.service";
import { useOverviewStore } from "@/src/store/useOverviewStore";
import { useAssetStore } from "@/src/store/useAssetStore";
import { useGatewayStore } from "@/src/store/useGatewayStore";
import { useLocationStore } from "@/src/store/useLocationStore";
import { usePartFormStore } from "@/src/store/usePartFormStore";
import { usePreventiveStore } from "@/src/store/usePreventiveStore";
import { useUserFormStore } from "@/src/store/useUserFormStore";
import { useWorkOrderStore } from "@/src/store/useWorkOrderStore";
import { useWorkRequestStore } from "@/src/store/useWorkRequestStore";
import FormInput from "@/components/create-screens/FormInput";
import ActionButton from "@/components/create-screens/ActionButton";
import Header from "@/components/global/Header";
import moment from "moment";
import { useCreateAssetStore } from "@/src/store/useCreateAsset";
import { useCreateLocationStore } from "@/src/store/useCreateLocationStore";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useGlobal } from "@/hooks/useGlobal";

const accountSettingsData = [
	{ id: "1", icon: "notifications-none", label: "Notification Settings" },
	{ id: "2", icon: "wifi-off", label: "Offline Settings" },
	{ id: "3", icon: "calendar-month", label: "Date Format" },
	{ id: "4", icon: "calendar-view-week", label: "First Day of the Week" },
	{ id: "5", icon: "language", label: "Language" },
];

const supportData = [
	{ id: "1", icon: "contact-support", label: "Contact Support" },
	{ id: "2", icon: "school", label: "Academy" },
];

export default function MyAccount() {
	const [activeTab, setActiveTab] = useState<"Profile" | "Account" | "Support">("Profile");
	const [editVisible, setEditVisible] = useState(false);
	const { user, setUser } = useAuthStore();
	console.log('my account = ', user);

	const [imgError, setImgError] = useState(false);

	const { pickImage } = useImageUpload();
	const { logout } = useGlobal();

	const first = user?.firstName?.[0] || "";
	const last = user?.lastName?.[0] || "";
	const initials = (first + last).toUpperCase();

	const imgUri = `${endpoints.baseURL}/user_profile_img/${user?.user_profile_img}`;
	const showFallback = !imgUri || imgError;

	const renderListItem = (item: { id: string; icon: string; label: string }) => (
		<Pressable style={styles.listItem}>
			<View style={styles.listContent}>
				<MaterialIcons name={item.icon as any} size={18} color="#000" />
				<Text style={styles.listLabel}>{item.label}</Text>
			</View>
			<Ionicons name="chevron-forward" size={18} color="#5E17EB" />
		</Pressable>
	);

	function handleEdit() {
		console.log("Edit");
		router.push('editProfile')
		// setEditVisible(true);
	}

	const onSubmit = async (formValues: any) => {
		const payload = buildUpdatePayload(formValues, user);
		console.log('payload to update = ', payload);
		// return;
		const res = await updateUserInfo(payload, user?.id);
		console.log('res = ', res);
		if (res.status) {
			setUser(res.data);
			setEditVisible(false);
		}
	};

	const buildUpdatePayload = (form: any, originalUser: any) => {
		return {
			firstName: form.firstName?.trim() ?? originalUser.firstName,
			lastName: form.lastName?.trim() ?? originalUser.lastName,
			phone_no: form.phone_no ? form.phone_no : originalUser.phone_no
		};
	};

	const parsePhone = (input: string) => {
		const cleaned = input.replace(/\D/g, ""); // remove spaces, dashes, etc.

		return {
			number: input,
			internationalNumber: `+91 ${input}`,
			nationalNumber: input,
			e164Number: `+91${cleaned}`,
			countryCode: "IN",
			dialCode: "+91",
		};
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<View style={styles.headerIcons}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowBack /></TouchableOpacity>
					<Text style={styles.headerTitle}>My Account</Text>
				</View>
				<View style={styles.headerIcons}>
					<TouchableOpacity style={styles.iconBtn}>
						<Ionicons name="notifications-off-sharp" size={15} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.iconBtn} onPress={handleEdit}>
						<Entypo name="edit" size={15} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.iconBtn} onPress={logout}>
						<MaterialIcons name="logout" size={15} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>


			<View style={styles.userInfoContainer}>


				<TouchableOpacity
					style={styles.profilePhoto}
					activeOpacity={0.8}
					onPress={() => router.push("/myAccount")}
				>

					{showFallback ? (
						<View style={{ width: '100%', height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
							<Text style={styles.avatarInitials}>{initials}</Text>
						</View>
					) : (
						<Image
							source={{ uri: imgUri }}
							style={styles.profilePhotoImage}
							resizeMode="cover"
							onError={() => setImgError(true)} // 👈 fallback trigger
						/>
					)}

				</TouchableOpacity>

				{/* {
					user?.user_profile_img ?
						<TouchableOpacity style={styles.profilePhoto} onPress={() => Alert.alert('Upload Photo', 'Select source', [
							{ text: 'Camera', onPress: () => pickImage(true) },
							{ text: 'Gallery', onPress: () => pickImage(false) },
							{ text: 'Cancel', style: 'cancel' },
						])}>
							<Image
								source={{ uri: `${endpoints.baseURL}user_profile_img/${user?.user_profile_img}?t=${Date.now()}` }}
								style={styles.profilePhotoImage} resizeMode="contain"
							/>
						</TouchableOpacity>
						:
						<TouchableOpacity
							style={styles.profilePhoto}
							onPress={() => Alert.alert('Upload Photo', 'Select source', [
								{ text: 'Camera', onPress: () => pickImage(true) },
								{ text: 'Gallery', onPress: () => pickImage(false) },
								{ text: 'Cancel', style: 'cancel' },
							])}>
							<View style={{ width: '100%', height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
								<Text style={styles.avatarInitials}>{initials}</Text>
							</View>
						</TouchableOpacity>
				} */}

				<Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
				<Text style={styles.designationText}>{user?.user_role}</Text>
			</View>

			<View style={styles.card}>
				<View style={styles.cardShadow} />
				<View style={styles.handle} />

				<View style={styles.sheetContainer}>

					<View style={styles.contentContainer}>
						{activeTab === "Profile" && (
							<>
								<View style={styles.infoBox}>
									<Feather name="mail" size={18} color="#000" />
									<Text style={styles.infoText}>{user?.email}</Text>
								</View>

								<View style={styles.infoBox}>
									<Feather name="phone" size={18} color="#000" />
									<Text style={styles.infoText}>{user?.phone_no?.internationalNumber || user?.mobileNumber?.internationalNumber}</Text>
								</View>

								<View style={styles.infoBox}>
									<Octicons name="person" size={18} color="#000" />
									<Text style={styles.infoText}>{`${user?.firstName} ${user?.lastName}`}</Text>
								</View>

								<View style={styles.infoBox}>
									<SimpleLineIcons name="briefcase" size={18} color="#000" />
									<Text style={styles.infoText}>{user?.user_role}</Text>
								</View>

								<View style={styles.infoBox}>
									<StatusIcon />
									<Text style={styles.infoText}>{user?.user_status}</Text>
								</View>

								<View style={styles.infoBox}>
									<CalendarIcon />
									<Text style={styles.infoText}>{moment(user?.createdOn).format('DD/MM/YYYY')}</Text>
								</View>
							</>
						)}

						{activeTab === "Account" && (
							<FlatList
								data={accountSettingsData}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => renderListItem(item)}
								showsVerticalScrollIndicator={false}
							/>
						)}

						{activeTab === "Support" && (
							<FlatList
								data={supportData}
								keyExtractor={(item) => item.id}
								renderItem={({ item }) => renderListItem(item)}
								showsVerticalScrollIndicator={false}
							/>
						)}
					</View>
				</View>
			</View>
			{/* {
				activeTab !== "Account" && (
					<Image source={require("../../assets/images/presage.png")} style={styles.image} />
				)
			} */}
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#742BDE",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 25,
		paddingVertical: 15,
	},
	backButton: {
		padding: 5,
	},
	headerTitle: {
		fontSize: 16,
		fontFamily: Fonts.semiBold,
		lineHeight: 20,
		letterSpacing: 0.15,
		color: "#FFFFFF",
	},
	headerIcons: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 12
	},
	iconBtn: {
		backgroundColor: "#8544E2",
		height: 28,
		width: 28,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 15
	},
	profilePhoto: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 0.5,
		borderColor: "#FFFFFF",
	},
	profilePhotoImage: {
		width: "100%",
		height: "100%",
		borderRadius: 40,
		objectFit: "cover",
	},
	userInfoContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 25,
	},
	nameText: {
		fontSize: 20,
		fontFamily: Fonts.semiBold,
		color: "#FFFFFF",
		marginTop: 10
	},
	designationText: {
		fontSize: 12,
		fontFamily: Fonts.regular,
		color: "#FFFFFF",
	},
	card: {
		flex: 1,
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
	sheetContainer: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		paddingTop: 10,
	},
	tabContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginHorizontal: 10,
		marginBottom: 20,
		gap: 5
	},
	tabButton: {
		borderWidth: 1,
		borderColor: "#A259FF",
		borderRadius: 25,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	activeTab: {
		backgroundColor: "#742BDE",
	},
	tabText: {
		fontSize: 13,
		fontFamily: Fonts.regular,
		color: "#742BDE",
	},
	activeTabText: {
		color: "#FFFFFF",
		fontFamily: Fonts.semiBold,
	},
	contentContainer: {
		flex: 1,
		marginHorizontal: 20,
	},
	infoBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F0EDFF",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginBottom: 15,
		gap: 12
	},
	infoText: {
		fontSize: 13,
		fontFamily: Fonts.regular,
		color: "#000000",
		lineHeight: 16,
	},
	listItem: {
		backgroundColor: "#F0EDFF80",
		borderRadius: 8,
		paddingVertical: 14,
		paddingHorizontal: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	listContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	listLabel: {
		fontSize: 13,
		fontFamily: Fonts.regular,
		color: "#1C1C1C",
		lineHeight: 17
	},
	image: {
		position: "absolute",
		bottom: 0,
		right: 0,
	},
	avatarInitials: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 20,
	},
	modalWrapper: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		padding: 20,
	},
	modalBox: {
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
	},
	btnRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	closeBtn: {
		backgroundColor: "#71767B",
		paddingHorizontal: 20,
	},
	updateBtn: {
		backgroundColor: "#A259FF",
		paddingHorizontal: 20,
	},
})

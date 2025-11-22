import { Alert, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { useAuthStore } from '@/src/store/useAuthStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Fonts from '@/constants/Typography';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { storage } from '@/src/storage/mmkv';
import { useGlobal } from '@/hooks/useGlobal';
import { ArrowBack } from '@/constants/IconProvider';
import { Image } from 'expo-image';
import { endpoints } from '@/src/api/endpoints';
import { useImageUpload } from '@/hooks/useImageUpload';
import FormInput from '@/components/create-screens/FormInput';
import Field from '@/components/auth-screens/InputField';
import { useForm } from 'react-hook-form';
import ActionButton from '@/components/auth-screens/ActionButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { updateUserInfo } from '@/src/services/auth.service';

type UpdateProfileFormValues = {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	status: string;
	role: string;
	phone: any;
};


const EditProfile = () => {
	const router = useRouter();
	const { user, setUser } = useAuthStore();
	const { logout } = useGlobal();
	const { pickImage } = useImageUpload();

	const first = user?.firstName?.[0] || "";
	const last = user?.lastName?.[0] || "";
	const initials = (first + last).toUpperCase();

	const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<UpdateProfileFormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			status: "",
			username: "",
			role: "",
			phone: {
				countryCode: "",
				number: "",
				full: "",
				flag: "",
				country: ""
			}
		},
	});

	useEffect(() => {
		if (user) {
			reset({
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				email: user.email,
				status: user.user_status,
				role: user.user_role,

				phone: {
					countryCode: user.phone_no.countryCode,
					number: user.phone_no.number,
					full: user.phone_no.full,
					flag: user.phone_no.flag,
					country: user.phone_no.country,
				},
			});
		}
	}, [user]);


	const onSubmit = async (formValues: any) => {
		const payload = buildUpdatePayload(formValues, user);
		console.log('payload to update = ', payload);
		const res = await updateUserInfo(payload, user?.id);
		console.log('res = ', res);
		if (res.status) {
			setUser(res.data);
			router.back();
			ToastAndroid.show("Profile Updated", ToastAndroid.SHORT);
		}
	};

	const buildUpdatePayload = (form: any, originalUser: any) => {
		return {
			firstName: form.firstName?.trim() ?? originalUser.firstName,
			lastName: form.lastName?.trim() ?? originalUser.lastName,
			phone_no: form.phone ?? originalUser.phone_no
		};
	};

	return (
		<KeyboardAwareScrollView>
			<SafeAreaView style={styles.container}>
				<View style={styles.headerContainer}>
					<View style={styles.headerIcons}>
						<TouchableOpacity onPress={() => router.back()} style={styles.backButton}><ArrowBack /></TouchableOpacity>
						<Text style={styles.headerTitle}>Edit Account</Text>
					</View>
					<View style={styles.headerIcons}>
						<TouchableOpacity style={styles.iconBtn}>
							<Ionicons name="notifications-off-sharp" size={15} color="#fff" />
						</TouchableOpacity>
						<TouchableOpacity style={styles.iconBtn} onPress={logout}>
							<MaterialIcons name="logout" size={15} color="#fff" />
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.userInfoContainer}>

					{
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
					}

					<Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
					<Text style={styles.designationText}>{user?.user_role}</Text>
				</View>

				<View style={styles.card}>
					<View style={styles.cardShadow} />
					<View style={styles.handle} />

					<View style={styles.sheetContainer}>
						<Field
							icon="person"
							name="firstName"
							control={control}
							placeholder="First Name"
							rules={{
								required: "First name is required",
							}}
							style={{ flex: 1 }}
						/>


						<Field
							icon="person"
							name="lastName"
							control={control}
							placeholder="Last Name"
							rules={{}}
							style={{ flex: 1 }}
						/>


						<Field
							icon="person"
							name="username"
							control={control}
							placeholder="Username"
							rules={{
								required: "Username is required"
							}}
							readonly={true}
							style={{ flex: 1 }}
						/>


						<Field
							icon="email"
							name="email"
							control={control}
							placeholder="Email ID"
							rules={{
								required: "Email is required"
							}}
							readonly={true}
							style={{ flex: 1 }}
						/>

						<Field
							icon="email"
							name="status"
							control={control}
							placeholder="User Status"
							rules={{
								required: "User Status is required"
							}}
							readonly={true}
							style={{ flex: 1 }}
						/>

						<Field
							icon="email"
							name="role"
							control={control}
							placeholder="User Role"
							rules={{
								required: "User Role is required"
							}}
							readonly={true}
							style={{ flex: 1 }}
						/>

						<Field
							name="phone"
							control={control}
							placeholder="Phone Number"
							rules={{
								required: "Phone number is required",
							}}
							style={{ flex: 1 }}
						/>


						<TouchableOpacity style={styles.button} disabled={isSubmitting} onPress={handleSubmit(onSubmit)}>
							<Text style={styles.buttonText}>
								{isSubmitting ? "Updating..." : "Update User"}
							</Text>
						</TouchableOpacity>

					</View>
				</View>
			</SafeAreaView>
		</KeyboardAwareScrollView>
	)
}

export default EditProfile

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
		gap: 20,
		paddingHorizontal: 8,
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
	button: {
		alignSelf: 'flex-end',
		backgroundColor: "#742BDE",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 200,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 50
	},
	buttonText: {
		color: "#fff",
		fontFamily: Fonts.medium,
		fontSize: 14,
		textAlign: 'center',
	}
})
import { getProfileService, updateUser, uploadImage } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Alert } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

export function useImageUpload() {
	const { user, setUser } = useAuthStore();


	const pickImage = (fromCamera = false) => {
		const options: any = {
			mediaType: 'photo' as const,
			quality: 0.8,
		};

		if (fromCamera) {
			launchCamera(options, handleImageResponse);
		} else {
			launchImageLibrary(options, handleImageResponse);
		}
	};

	const handleImageResponse = async (response: any) => {
		if (response.didCancel) return;
		if (response.errorCode) {
			Alert.alert('Error', response.errorMessage || 'Image selection failed');
			return;
		}

		const asset = response.assets?.[0];
		if (!asset) return;

		console.log('Selected image: ', asset.uri);
		let updatedUser: any;

		try {
			updatedUser = await uploadImage(asset, user);
			console.log('Updated user: ', updatedUser);
			if(updatedUser) {
				setUser(updatedUser);
			}
		} catch (e) {
			console.log('e = ', e);
		}

		if (updatedUser) {
			try {
				const profileUpdate = await updateUser(updatedUser?.user_profile_img, user?.id);
				console.log('profileUpdate user: ', profileUpdate);
				if (profileUpdate.status) {
					setUser(profileUpdate.data);
					const latestUser = await getProfileService(user?.id);
					console.log('latest user = ', latestUser);
					if (latestUser?.status) {
						setUser(latestUser?.data[0]);
					}
				}
			} catch (error) {
				console.error('Error updating user:', error);
				Alert.alert('Error', 'Failed to update user profile image');
			}

		}
	};

	return {
		pickImage
	};
}

import { ToastAndroid } from 'react-native';
import { sendRequest } from '../api/api.service';
import { endpoints } from '../api/endpoints';
import { storage } from '../storage/mmkv';

const BASE_URL = 'https://new.presageinsights.ai/cmms_express/api/upload/user_profile_img';

export const loginService = async (username: string, password: string) => {
	const response = await sendRequest('POST', endpoints.auth.login, {
		username,
		password,
		device_type: 'mobile',
	});

	if (response?.token) {
		storage.set('token', response.token);
	}

	return response;
};

export const userDetails = async (userId: string, token: string) => {
	const url = `${endpoints.auth.details}/${userId}?access_token=${token}`;
	const response = await sendRequest('GET', url);
	return response;
}

export const logoutService = async () => {
	await sendRequest('POST', '/logout');
	storage.delete('token');
};

export const registerService = async (payload: Record<string, any>) => {
	return await sendRequest('POST', '/registration', payload);
};

export const getProfileService = async (id: string) => {
	return await sendRequest('GET', `${endpoints.user.profile}/${id}`);
};

export const OTPVerificationService = async (payload: Record<string, any>) => {
	return await sendRequest('POST', endpoints.auth.verifyOTP, payload);
};

export const sendPasswordResetEmail = async (payload: Record<string, any>) => {
	return await sendRequest('POST', endpoints.auth.resetPassword, payload);
};

export const resetPasswordOTPSendService = async (payload: Record<string, any>) => {
	return await sendRequest('POST', endpoints.auth.verifyOTPResetPassword, payload);
};

export const changePassword = async (payload: Record<string, any>) => {
	return await sendRequest('POST', endpoints.auth.changePassword, payload);
};

export const uploadProfileImage = async (payload: Record<string, any>) => {
	return await sendRequest('POST', endpoints.user.uploadProfileImage, payload);
};

export const updateUser = async (user_profile_img: string, id: string) => {
	console.log('fiaonf = ', `${endpoints.user.updateUser}/${id}`, { user_profile_img });
	return await sendRequest('PUT', `${endpoints.user.updateUser}/${id}`, { user_profile_img: user_profile_img });
};

export const uploadImage = async (asset: any, user: any) => {
	console.log('Uploading image...', asset);
	try {
		// Step 1: Show loader
		console.log('Uploading image...');
		const token = storage.getString('token');
		console.log('Token: ', token);
		console.log('user: ', user);

		// Step 2: Generate random name
		const randomName = Math.floor(Math.random() * 1000000);
		const fileName = `${randomName}.jpg`;

		// Step 3: Prepare form data
		const formData = new FormData();
		formData.append('files', {
			uri: asset.uri,
			name: fileName,
			type: 'image/jpeg',
		} as any);

		console.log('Form data: ', formData);
		console.log('BASEURL data: ', BASE_URL);

		// Step 4: Upload with axios or fetch
		const response = await fetch(BASE_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
				'Authorization': `Bearer ${token}`,
				'accountID': user?.account_id,
			},
			body: formData,
		});

		const result = await response.json();
		console.log('Upload success:', result);
		if (result?.status) {
			ToastAndroid.show('Image uploaded successfully!', ToastAndroid.LONG);
			return {
				...user,
				user_profile_img: result?.data?.[0]?.fileName,
			};
		}

		return result;

	} catch (error) {
		console.error('Upload failed:', error);
		ToastAndroid.show('Upload failed. Please try again.', ToastAndroid.LONG);
	}
};
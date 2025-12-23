import { ToastAndroid } from 'react-native';
import { sendRequest, sendRequestDemo } from '../api/api.service';
import { endpoints } from '../api/endpoints';
import { storage } from '../storage/mmkv';

export const locationTree = async () => {
	const url = `${endpoints.location.tree}`;
	// console.log('locations tree = ', url);
	return await sendRequest('GET', url);
};

export const topLevelAssets = async (location_id: string) => {
	const url = `${endpoints.location.topLevelAssets}?locationId=${location_id}&top_level=true`;
	return await sendRequest('GET', url);
}

export const assetsHealthLocation = async (payload: { org_id: string, asset_list: string[] }) => {
	const url = `${endpoints.location.assetsHealthLocation}`;
	return await sendRequestDemo('POST', url, payload);
}

export const fetchKPIFilterLocations = async () => {
	const url = `${endpoints.overview.kpi}`;
	return await sendRequest('GET', url);
}

export const fetchParentLocationDetails = async (data: any, type: string) => {
	let url = '';
	if (type === 'parent') {
		url = `${endpoints.overview.locationDetails}?parent_id=${data}`;
		// console.log('url parent = ', url);
	} else {
		url = `${endpoints.overview.locationDetails}?locationId=${data}`;
		// console.log('url child = ', url);
	}
	// console.log('url = ', url);
	return await sendRequest('GET', url);
}

export const childAssetsAgainstLocation = async (data: { levelOneLocations: string[], levelTwoLocations: string[] }) => {
	const url = `${endpoints.overview.childAssets}`;
	// console.log('url = ', url);
	return await sendRequest('POST', url, data);
}

export const assetHealthKPIHistory = async (data: { org_id: string, top_level_asset: string[], electric_asset: string[], non_electric_asset: string[] }) => {
	const url = `${endpoints.overview.assetHealthKPIHistory}`;
	// console.log('url = ', url);
	return await sendRequestDemo('POST', url, data);
}

export const mapUserToLocation = async (location_id: string) => {
	const url = `${endpoints.location.mapUserToLocations}?locationId=${location_id}`;
	return await sendRequest('GET', url);
}

export const createNewLocation = async (payload: any) => {
	const url = `${endpoints.location.createNewLocation}`;
	return await sendRequest('POST', url, payload);
}

export const updateNewLocation = async (id: string, payload: any) => {
	const url = `${endpoints.location.createNewLocation}/${id}`;
	return await sendRequest('PUT', url, payload);
}

export const copyLocation = async (id: string) => {
	const url = `${endpoints.location.copy}/${id}`;
	return await sendRequest('GET', url);
}

export const singleLocationData = async (locationId: string) => {
	const url = `${endpoints.location.get}/${locationId}`;
	return await sendRequest('GET', url);
}

export const deleteLocation = async (locationId: string) => {
	const url = `${endpoints.location.get}/${locationId}`;
	return await sendRequest('DELETE', url);
}

export const locationImageUpload = async (image: any, user: any) => {
	// console.log('Uploading image...', image);
	try {
		// Step 1: Show loader
		const token = storage.getString('token');
		// console.log('Token: ', token);
		// console.log('user: ', user);

		// Step 2: Generate random name
		const randomName = Math.floor(Math.random() * 1000000);
		const fileName = `${randomName}.jpg`;

		// Step 3: Prepare form data
		const formData = new FormData();
		formData.append('files', {
			uri: image.uri,
			name: fileName,
			type: 'image/jpeg',
		} as any);

		// console.log('Form data: ', formData);
		// console.log('BASEURL data: ', endpoints.baseURL + 'api/' + endpoints.location.uploadImage);

		// Step 4: Upload with axios or fetch
		const response = await fetch(endpoints.baseURL + 'api/' + endpoints.location.uploadImage, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
				'Authorization': `Bearer ${token}`,
				'accountID': user?.account_id,
			},
			body: formData,
		});

		const result = await response.json();
		// console.log('Upload success:', result);
		if (result?.status) {
			ToastAndroid.show('Image uploaded successfully!', ToastAndroid.LONG);
			return {
				image_path: result?.data?.[0]?.fileName,
			};
		}

		return result;

	} catch (error) {
		console.error('Upload failed:', error);
		ToastAndroid.show('Upload failed. Please try again.', ToastAndroid.LONG);
	}
};
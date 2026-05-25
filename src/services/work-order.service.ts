import { ToastAndroid } from "react-native";
import { sendRequest } from "../api/api.service";
import { endpoints } from "../api/endpoints";
import { storage } from "../storage/mmkv";

export const createWorkOrder = async (payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.createWorkOrder}`, payload);
};

export const workOrdersPaginated = async (pageType: string, page: number, limit: number = 20) => {
    let url = '';
    url = `${endpoints.workOrders.workOrders}/get-work-order?page=${page}&limit=${limit}&pageType=${pageType}&status=Open&status=In-Progress&status=On-Hold`;
    console.log('url for request = ', url);
    return await sendRequest('GET', url);
}

export const getWorkOrders = async (type: string) => {
    let url = '';
    if (type === 'todo') {
        url = `${endpoints.workOrders.workOrders}?status=Open&status=In-Progress&status=On-Hold`;
    } else if (type === 'done') {
        url = `${endpoints.workOrders.workOrders}?status=Completed`;
    }
    return await sendRequest('GET', url);
};

export const getWorkOrderDetails = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.workOrders}/${id}`);
}

export const updateWorkOrder = async (id: any, data: any) => {
    const url = `${endpoints.workOrders.workOrders}/${id}`;
    return await sendRequest("PUT", url, data);
};

export const patchWorkOrder = async (id: string, data: any) => {
    const url = `${endpoints.workOrders.workOrders}/${id}`;
    return await sendRequest("PATCH", url, data);
};

export const getFormData = async (id: string) => {
    console.log('init 123123 = ', id)
    const url = `${endpoints.preventive.getSOPs}/${id}`;
    return await sendRequest("GET", url);
};

export const deleteWorkOrder = async (id: string) => {
    return await sendRequest('DELETE', `${endpoints.workOrders.workOrders}/${id}`)
}

export const updateWorkOrderStatus = async (id: string, payload: any) => {
    return await sendRequest('PUT', `${endpoints.workOrders.updateWorkOrder}/${id}`, payload);
};

export const postComments = async (id: string, payload: any) => {
    return await sendRequest('POST', `${endpoints.workOrders.workOrders}/${id}/${endpoints.workOrders.postComments}`, payload);
};

export const getWorkOrderComments = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.workOrders}/${id}/${endpoints.workOrders.postComments}`);
};

export const getWorkOrderActivity = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.activity}/${id}`);
};

export const getWorkOrderHistory = async (id: string) => {
    return await sendRequest('GET', `${endpoints.workOrders.history}/${id}`);
};

export const deleteWorkOrderComment = async (workOrderID: string, commentID: string) => {
    return await sendRequest('DELETE', `${endpoints.workOrders.workOrders}/${workOrderID}/${endpoints.workOrders.postComments}/${commentID}`);
};

export const workOrderImageUpload = async (image: any, user: any) => {
    console.log('Uploading image...', image);
    try {
        // Step 1: Show loader
        const token = storage.getString('token');
        console.log('Token: ', token);
        console.log('user: ', user);

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

        console.log('Form data: ', formData);
        console.log('BASEURL data: ', endpoints.baseURL + 'api/' + endpoints.workOrders.uploadImage);

        // Step 4: Upload with axios or fetch
        const response = await fetch(endpoints.baseURL + 'api/' + endpoints.workOrders.uploadImage, {
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
            ToastAndroid.show('Image uploaded successfully!', ToastAndroid.SHORT);
            return result?.data?.[0]
        }

        return result;

    } catch (error) {
        console.error('Upload failed:', error);
        ToastAndroid.show('Upload failed. Please try again.', ToastAndroid.SHORT);
    }
};

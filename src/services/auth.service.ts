import { sendRequest } from '../api/api.service';
import { endpoints} from '../api/endpoints';
import { storage } from '../storage/mmkv';

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

export const logoutService = async () => {
    await sendRequest('POST', '/logout');
    storage.delete('token');
};

export const registerService = async (payload: Record<string, any>) => {
    return await sendRequest('POST', '/register', payload);
};

export const getProfileService = async () => {
    return await sendRequest('GET', '/user/profile');
};

import { sendRequest } from '../api/api.service';
import { storage } from '../storage/mmkv';

export const loginService = async (email: string, password: string) => {
    const data = await sendRequest('POST', '/login', { email, password });

    if (data?.token) {
        storage.set('token', data.token);
    }

    return data;
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

import axios from 'axios';
import { storage } from '../storage/mmkv';
import { useAuthStore } from '../store/useAuthStore';


const apiClientDemo = axios.create({
    baseURL: 'https://validate.presageinsights.ai/general/api/',
    timeout: 15000,
});

// 🔹 Instantly read token (synchronous)
apiClientDemo.interceptors.request.use((config) => {
    const token = storage.getString('token');
    const { user } = useAuthStore.getState();
    console.log('user in api client validate = ', user);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.id) {
        config.headers['X-User-ID'] = user.id;
        config.headers['X-Env'] = true;
    }

    return config;
});

// 🔹 Handle errors globally
apiClientDemo.interceptors.response.use(
    (response) => response,
    (error) => {
        // console.error('API Error:', error?.response || error);
        throw error?.response?.data || error;
    }
);

export default apiClientDemo;
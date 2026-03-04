import axios from 'axios';
import { storage } from '../storage/mmkv';
import { useAuthStore } from '../store/useAuthStore';

const apiClientDemo = axios.create({
    // baseURL: 'https://staging.presageinsights.ai/api/', // development
    baseURL: 'https://processor.presageinsights.ai/api/', // production
    timeout: 15000,
});

const getRequestUrl = (baseURL?: string, url?: string) => `${baseURL || ''}${url || ''}`;

// 🔹 Instantly read token (synchronous)
apiClientDemo.interceptors.request.use((config) => {
    const token = storage.getString('token');
    const { user } = useAuthStore.getState();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.id) {
        config.headers['X-User-ID'] = user.id;
        if(!config.baseURL?.includes('processor')) {
            config.headers['X-Env'] = true;
        }
    }

    const method = config.method?.toUpperCase() || 'GET';
    const requestUrl = getRequestUrl(config.baseURL, config.url);

    console.log(`[apiClientDemo][Request] ${method} ${requestUrl}`, {
        payload: config.data,
        params: config.params,
    });

    return config;
});

// 🔹 Handle errors globally
apiClientDemo.interceptors.response.use(
    (response) => {
        const method = response.config?.method?.toUpperCase() || 'GET';
        const requestUrl = getRequestUrl(response.config?.baseURL, response.config?.url);

        // console.log(`[apiClientDemo][Response] ${method} ${requestUrl}`, response.data);

        return response;
    },
    (error) => {
        const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
        const requestUrl = getRequestUrl(error?.config?.baseURL, error?.config?.url);
        const errorPayload = error?.response?.data || error?.response || error;

        console.error(`[apiClientDemo][Error] ${method} ${requestUrl}`, errorPayload);
        throw error?.response?.data || error;
    }
);

export default apiClientDemo;

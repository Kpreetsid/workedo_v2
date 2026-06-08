import axios from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken } from '../storage/secureAuth';
import { useAuthStore } from '../store/useAuthStore';

const apiClientDemo = axios.create({
    baseURL: appConfig.urls.processorApi,
    timeout: 15000,
});

const getRequestUrl = (baseURL?: string, url?: string) => `${baseURL || ''}${url || ''}`;

// 🔹 Instantly read token (synchronous)
apiClientDemo.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
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
    return config;
});

// 🔹 Handle errors globally
apiClientDemo.interceptors.response.use(
    (response) => {
        const method = response.config?.method?.toUpperCase() || 'GET';
        const requestUrl = getRequestUrl(response.config?.baseURL, response.config?.url);
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

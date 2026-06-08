import axios from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken } from '../storage/secureAuth';
import { useAuthStore } from '../store/useAuthStore';


const apiClientValidate = axios.create({
    baseURL: appConfig.urls.validateApi,
    timeout: 15000,
});

const getRequestUrl = (baseURL?: string, url?: string) => `${baseURL || ''}${url || ''}`;

// 🔹 Instantly read token (synchronous)
apiClientValidate.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    const { user } = useAuthStore.getState();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (user?.id) {
        config.headers['X-User-ID'] = user.id;
        config.headers['X-Env'] = true;
    }

    const method = config.method?.toUpperCase() || 'GET';
    const requestUrl = getRequestUrl(config.baseURL, config.url);

    console.log(`[apiClientValidate][Request] ${method} ${requestUrl}`, {
        payload: config.data,
        params: config.params,
    });

    return config;
});

// 🔹 Handle errors globally
apiClientValidate.interceptors.response.use(
    (response) => {
        const method = response.config?.method?.toUpperCase() || 'GET';
        const requestUrl = getRequestUrl(response.config?.baseURL, response.config?.url);

        console.log(`[apiClientValidate][Response] ${method} ${requestUrl}`, response.data);

        return response;
    },
    (error) => {
        const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
        const requestUrl = getRequestUrl(error?.config?.baseURL, error?.config?.url);
        const errorPayload = error?.response?.data || error?.response || error;

        console.error(`[apiClientValidate][Error] ${method} ${requestUrl}`, errorPayload);
        throw error?.response?.data || error;
    }
);

export default apiClientValidate;

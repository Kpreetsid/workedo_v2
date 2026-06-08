import axios from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken } from '../storage/secureAuth';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: appConfig.urls.cmmsApi,
  timeout: 15000,
});

const getRequestUrl = (baseURL?: string, url?: string) => `${baseURL || ''}${url || ''}`;

// 🔹 Instantly read token (synchronous)
apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let data = useAuthStore.getState();

  if (data?.user?.account_id) {
    config.headers.accountID = data?.user?.account_id;
  }

  const method = config.method?.toUpperCase() || 'GET';
  const requestUrl = getRequestUrl(config.baseURL, config.url);

  console.log(`[apiClient][Request] ${method} ${requestUrl}`, {
    payload: config.data,
    params: config.params,
  });

  return config;
});

// 🔹 Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toUpperCase() || 'GET';
    const requestUrl = getRequestUrl(response.config?.baseURL, response.config?.url);

    // console.log(`[apiClient][Response] ${method} ${requestUrl}`, response.data);

    return response;
  },
  (error) => {
    const method = error?.config?.method?.toUpperCase() || 'UNKNOWN';
    const requestUrl = getRequestUrl(error?.config?.baseURL, error?.config?.url);
    const errorPayload = error?.response?.data || error?.response || error;

    // console.error(`[apiClient][Error] ${method} ${requestUrl}`, errorPayload);
    throw error?.response?.data || error;
  }
);

export default apiClient;

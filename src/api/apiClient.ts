import axios from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken } from '../storage/secureAuth';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: appConfig.urls.cmmsApi,
  timeout: 15000,
});

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

  return config;
});

// 🔹 Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // console.error(`[apiClient][Error] ${method} ${requestUrl}`, errorPayload);
    throw error?.response?.data || error;
  }
);

export default apiClient;

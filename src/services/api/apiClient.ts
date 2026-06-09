import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken, deleteAuthToken } from '@/src/storage/secureAuth';
import { storage } from '@/src/storage/mmkv';
import { useAuthStore } from '@/src/state/auth/useAuthStore';
import { handleApiError } from './apiErrorHandler';

// Create a robust Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: appConfig.urls.cmmsApi,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token & Headers
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const authState = useAuthStore.getState();
      if (authState?.user?.account_id) {
        config.headers.accountID = authState.user.account_id;
      }
      
      console.log(`[API Request]: ${config.baseURL}${config.url}`);

    } catch (error) {
      console.warn('Failed to attach auth token to request', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Normalize Errors and handle Token Refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized globally (Token Expiration)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        useAuthStore.getState().clearUser();
        storage.delete('user');
        deleteAuthToken();
      } catch (refreshError) {
        useAuthStore.getState().clearUser();
        storage.delete('user');
        deleteAuthToken();
        return Promise.reject(refreshError);
      }
    }

    // Normalize error using our API Error Handler
    return handleApiError(error);
  }
);

export default apiClient;

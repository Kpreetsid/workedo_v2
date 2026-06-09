import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { appConfig } from '@/config/app.config';
import { getAuthToken, deleteAuthToken } from '@/src/storage/secureAuth';
import { storage } from '@/src/storage/mmkv';
import { useAuthStore } from '@/src/state/auth/useAuthStore';
import { handleApiError } from './apiErrorHandler';

// Create a robust Axios instance for the Processor API
const processorApiClient: AxiosInstance = axios.create({
  baseURL: appConfig.urls.processorApi,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token & Headers
processorApiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const authState = useAuthStore.getState();
      const userId = authState?.user?._id || authState?.user?.id;
      if (userId) {
        // As seen in Angular's pdm.service.ts
        config.headers['X-User-Id'] = userId;
      }
      
      console.log(`[Processor API Request]: ${config.baseURL}${config.url}`);

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
processorApiClient.interceptors.response.use(
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

export default processorApiClient;

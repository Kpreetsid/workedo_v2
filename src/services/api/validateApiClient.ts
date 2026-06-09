import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { appConfig } from '@/config/app.config';
import { handleApiError } from './apiErrorHandler';

// Create a robust Axios instance for the Validate API
const validateApiClient: AxiosInstance = axios.create({
  baseURL: appConfig.urls.validateApi,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor: Normalize Errors
validateApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Normalize error using our API Error Handler
    return handleApiError(error);
  }
);

export default validateApiClient;

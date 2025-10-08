import axios from 'axios';
import { storage } from '../storage/mmkv';


const apiClient = axios.create({
  baseURL: 'https://app.presageinsights.ai/cmms_api/api',
  timeout: 15000,
});

// 🔹 Instantly read token (synchronous)
apiClient.interceptors.request.use((config) => {
  const token = storage.getString('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response || error);
    throw error?.response?.data || error;
  }
);

export default apiClient;
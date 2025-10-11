import axios from 'axios';
import { storage } from '../storage/mmkv';
import { useAuthStore } from '../store/useAuthStore';

const apiClient = axios.create({
  baseURL: 'https://new.presageinsights.ai/cmms_express/api/',
  timeout: 15000,
});

// 🔹 Instantly read token (synchronous)
apiClient.interceptors.request.use((config) => {
  
  const token = storage.getString('token');
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
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response || error);
    throw error?.response?.data || error;
  }
);

export default apiClient;
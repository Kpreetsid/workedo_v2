import apiClient from './apiClient';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, any>;
}

export const sendRequest = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    const response = await apiClient.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    console.error(`API ${method} ${url} failed:`, error?.response || error);
    throw error?.response?.data || error;
  }
};
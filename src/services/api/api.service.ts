import apiClient from './apiClient';
import processorApiClient from './processorApiClient';
import validateApiClient from './validateApiClient';

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

export const sendRequestDemo = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    const response = await processorApiClient.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Processor API ${method} ${url} failed:`, error?.response || error);
    throw error?.response?.data || error;
  }
};

export const sendRequestValidate = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    const response = await validateApiClient.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Validate API ${method} ${url} failed:`, error?.response || error);
    throw error?.response?.data || error;
  }
};
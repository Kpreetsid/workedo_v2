import apiClient from './apiClient';
import apiClientDemo from './apiClientDemo';
import apiClientValidate from './apiClientValidate';

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
    // console.log('request url =', url, 'payload =', data);
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
    // console.log('request url =', url, 'payload =', data);
    const response = await apiClientDemo.request({
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

export const sendRequestValidate = async <T = any>(
  method: HttpMethod,
  url: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    console.log('request url =', url, 'payload =', data);
    const response = await apiClientValidate.request({
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
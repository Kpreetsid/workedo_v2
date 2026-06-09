import axios, { AxiosError } from 'axios';
import { AppError } from '@/src/core/error/AppError';
import { errorHandler } from '@/src/core/error/ErrorHandler';

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = axiosError.response.status;
      const message = axiosError.response.data?.message || axiosError.message;
      const code = axiosError.response.data?.code || 'API_ERROR';
      
      const appError = new AppError(message, code, true, statusCode);
      errorHandler.handleError(appError);
      throw appError;
    } else if (axiosError.request) {
      // The request was made but no response was received
      const appError = new AppError('No response from server. Please check your network connection.', 'NETWORK_ERROR', true);
      errorHandler.handleError(appError);
      throw appError;
    } else {
      // Something happened in setting up the request that triggered an Error
      const appError = new AppError(axiosError.message, 'REQUEST_SETUP_ERROR', true);
      errorHandler.handleError(appError);
      throw appError;
    }
  }

  // Non-Axios errors
  if (error instanceof Error) {
    const appError = new AppError(error.message, 'UNKNOWN_API_ERROR', false);
    errorHandler.handleError(appError);
    throw appError;
  }

  const appError = new AppError('An unknown error occurred', 'UNKNOWN_ERROR', false);
  errorHandler.handleError(appError);
  throw appError;
};

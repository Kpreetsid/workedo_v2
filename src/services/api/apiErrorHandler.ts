import axios, { AxiosError } from 'axios';
import { ToastAndroid } from 'react-native';
import { AppError } from '@/src/core/error/AppError';
import { errorHandler } from '@/src/core/error/ErrorHandler';
import { getHttpErrorMessage } from './httpErrorMessage.util';

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const message = getHttpErrorMessage(axiosError);
    const statusCode = axiosError.response?.status || 0;
    const code = axiosError.response?.data?.code || 'API_ERROR';

    if (statusCode === 401) {
      ToastAndroid.show('Session expired. Please login again.', ToastAndroid.LONG);
    } else if (statusCode === 403) {
      ToastAndroid.show('You do not have permission to perform this action.', ToastAndroid.LONG);
    } else if (statusCode === 0) {
      ToastAndroid.show(message, ToastAndroid.LONG);
    }

    const appError = new AppError(message, code, true, statusCode);
    errorHandler.handleError(appError);
    throw appError;
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

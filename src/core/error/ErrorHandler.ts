import { AppError } from './AppError';

class ErrorHandler {
  public handleError(error: Error | AppError): void {
    if (this.isTrustedError(error)) {
      this.handleTrustedError(error as AppError);
    } else {
      this.handleCriticalError(error);
    }
  }

  public isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  private handleTrustedError(error: AppError): void {
    console.warn(`[Operational Error]: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
    });
    // TODO: Send to tracking service (e.g., Sentry) or display toast notification
  }

  private handleCriticalError(error: Error): void {
    console.error(`[Critical Error]: ${error.message}`, error.stack);
    // TODO: Send to tracking service, potentially trigger app restart or fatal error screen
  }
}

export const errorHandler = new ErrorHandler();

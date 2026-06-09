export class AppError extends Error {
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    isOperational: boolean = true,
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.isOperational = isOperational;
    this.statusCode = statusCode;

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

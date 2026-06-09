import axios from 'axios';

const GENERIC_BACKEND_MESSAGES = new Set([
  'bad request',
  'resource not found',
  'internal server error',
  'something went wrong',
  'request failed',
  'unknown error'
]);

export function getHttpErrorMessage(error: any, fallback = 'Something went wrong'): string {
  if (!error) return fallback;

  if (axios.isAxiosError(error) && (!error.response && error.request)) {
    return 'Network error. Please check your internet connection.';
  }

  const body = normalizeErrorBody(error?.response?.data ?? error);
  const bodyMessage = toText(body?.message);
  const bodyError = toText(body?.error);
  const status = Number(error?.response?.status || body?.statusCode || body?.status_code || 0);

  if (status === 404 && bodyError && isGenericMessage(bodyMessage)) {
    return bodyError;
  }

  if (bodyMessage && !isAngularHttpFailureMessage(bodyMessage)) return bodyMessage;
  if (bodyError && !isAngularHttpFailureMessage(bodyError)) return bodyError;

  const detailMessage = getValidationDetailMessage(body);
  if (detailMessage) return detailMessage;

  const directMessage = toText(error?.message);
  if (directMessage && !isAngularHttpFailureMessage(directMessage)) return directMessage;

  return fallback;
}

function normalizeErrorBody(body: any): any {
  if (!body) return body;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return { message: body };
    }
  }
  return body;
}

function getValidationDetailMessage(body: any): string {
  const messages = body?.details?.messages;
  if (!messages || typeof messages !== 'object') return '';

  for (const value of Object.values(messages)) {
    if (Array.isArray(value) && value.length) return toText(value[0]);
    const text = toText(value);
    if (text) return text;
  }

  return '';
}

function toText(value: any): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isGenericMessage(message: string): boolean {
  return !message || GENERIC_BACKEND_MESSAGES.has(message.toLowerCase());
}

function isAngularHttpFailureMessage(message: string): boolean {
  return /^http failure response for /i.test(message) || /^Request failed with status code /i.test(message);
}

/**
 * Universal API Error Handling
 * 
 * All backend endpoints return errors in a consistent shape.
 * This module provides the error class, parser, and handler.
 */

// ============= Types =============

export interface ApiErrorDetails {
  actionHint?: string;
  field?: string;
  fields?: string[];
  retryAfter?: string;
  hint?: string;
  [key: string]: any;
}

export interface ApiErrorShape {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  requestId: string;
  timestamp: string;
  path?: string;
  method?: string;
  details?: ApiErrorDetails;
}

// ============= ApiError Class =============

/**
 * Structured API error that preserves all backend error fields.
 * Thrown by API clients instead of plain Error.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorType: string;
  readonly requestId: string;
  readonly timestamp: string;
  readonly path?: string;
  readonly details?: ApiErrorDetails;

  constructor(shape: ApiErrorShape) {
    // Use actionHint as the message if available, otherwise use message
    const userMessage = shape.details?.actionHint ?? shape.message;
    super(userMessage);
    this.name = 'ApiError';
    this.statusCode = shape.statusCode;
    this.errorType = shape.error;
    this.requestId = shape.requestId;
    this.timestamp = shape.timestamp;
    this.path = shape.path;
    this.details = shape.details;
  }

  /** The primary user-facing message (actionHint preferred over message) */
  get userMessage(): string {
    return this.message;
  }

  /** Whether this is a server error (5xx) */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /** Whether this is a validation error with field-level details */
  get hasFieldErrors(): boolean {
    return !!(this.details?.fields?.length || this.details?.field);
  }
}

// ============= Parser =============

/**
 * Parse an error response body (text) into an ApiError.
 * Falls back to a generic ApiError if the body isn't the expected shape.
 */
export function parseApiError(status: number, errorText: string, url?: string): ApiError {
  try {
    const json = JSON.parse(errorText);

    // Check if it matches the backend error shape
    if (json.message && json.statusCode) {
      return new ApiError({
        success: false,
        statusCode: json.statusCode ?? status,
        message: Array.isArray(json.message) ? json.message.join(', ') : json.message,
        error: json.error ?? 'UnknownError',
        requestId: json.requestId ?? 'unknown',
        timestamp: json.timestamp ?? new Date().toISOString(),
        path: json.path ?? url,
        method: json.method,
        details: json.details,
      });
    }

    // Partial shape — extract what we can
    return new ApiError({
      success: false,
      statusCode: status,
      message: json.message ?? json.error ?? `HTTP ${status}`,
      error: json.error ?? 'UnknownError',
      requestId: json.requestId ?? 'unknown',
      timestamp: json.timestamp ?? new Date().toISOString(),
      path: url,
      details: json.details,
    });
  } catch {
    // Not JSON at all
    return new ApiError({
      success: false,
      statusCode: status,
      message: errorText || getDefaultErrorMessage(status),
      error: 'UnknownError',
      requestId: 'unknown',
      timestamp: new Date().toISOString(),
      path: url,
    });
  }
}

// ============= Handler =============

export interface HandleApiErrorOptions {
  /** Highlight a specific form field with its error message */
  onField?: (fieldName: string, message: string) => void;
  /** Show a toast/notification */
  onToast?: (message: string, severity: 'error' | 'warning') => void;
  /** Called on 5xx errors with the requestId for logging */
  onServerError?: (requestId: string) => void;
}

/**
 * Universal error handler — call in any catch block.
 * Handles field-level validation, server errors, and general errors.
 */
export function handleApiError(err: unknown, options?: HandleApiErrorOptions): string {
  // Normalize to ApiError
  const apiErr = toApiError(err);
  const userMessage = apiErr.details?.actionHint ?? apiErr.message;

  // 1. Field-level validation errors — highlight individual fields
  if (apiErr.details?.fields?.length) {
    apiErr.details.fields.forEach(fieldMsg => {
      const fieldName = fieldMsg.split(' ')[0];
      options?.onField?.(fieldName, fieldMsg);
    });
    options?.onToast?.(userMessage, 'error');
    return userMessage;
  }

  // 2. Single field error
  if (apiErr.details?.field) {
    options?.onField?.(apiErr.details.field, userMessage);
    options?.onToast?.(userMessage, 'error');
    return userMessage;
  }

  // 3. Server error (500+) — generic message + requestId
  if (apiErr.isServerError) {
    const serverMsg = apiErr.requestId && apiErr.requestId !== 'unknown'
      ? `Something went wrong. Please try again. (Ref: ${apiErr.requestId})`
      : 'Something went wrong. Please try again later.';
    options?.onToast?.(serverMsg, 'error');
    options?.onServerError?.(apiErr.requestId);
    return serverMsg;
  }

  // 4. Rate limited
  if (apiErr.statusCode === 429) {
    const rateMsg = apiErr.details?.hint ?? 'Too many requests. Please wait before trying again.';
    options?.onToast?.(rateMsg, 'warning');
    return rateMsg;
  }

  // 5. Anything else — show as toast
  options?.onToast?.(userMessage, 'error');
  return userMessage;
}

// ============= Utilities =============

/**
 * Convert any caught error to an ApiError instance.
 */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof Error) {
    return new ApiError({
      success: false,
      statusCode: 0,
      message: err.message || 'An unexpected error occurred',
      error: 'UnknownError',
      requestId: 'unknown',
      timestamp: new Date().toISOString(),
    });
  }

  // Handle raw error objects (e.g. from axios response.data)
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const obj = err as any;
    return new ApiError({
      success: false,
      statusCode: obj.statusCode ?? 0,
      message: obj.message ?? 'An unexpected error occurred',
      error: obj.error ?? 'UnknownError',
      requestId: obj.requestId ?? 'unknown',
      timestamp: obj.timestamp ?? new Date().toISOString(),
      details: obj.details,
    });
  }

  return new ApiError({
    success: false,
    statusCode: 0,
    message: 'An unexpected error occurred',
    error: 'UnknownError',
    requestId: 'unknown',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get user-friendly error message based on HTTP status code.
 */
export function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please login.',
    403: 'You do not have permission to access this resource.',
    404: 'The requested resource was not found.',
    409: 'Conflict. The resource already exists.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Request timeout. Please try again later.',
  };
  return messages[status] || `Request failed with status ${status}`;
}

/**
 * Quick one-liner for catch blocks with toast.
 * Usage: catch (e) { showApiError(e, toast.error) }
 */
export function showApiError(err: unknown, toastFn: (msg: string) => void): void {
  handleApiError(err, {
    onToast: (msg) => toastFn(msg),
  });
}

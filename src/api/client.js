/**
 * client.js
 * Resilient HTTP client with timeout, abort, and exponential-backoff retry.
 *
 * Error hierarchy:
 *   NetworkError  — fetch failed (offline, DNS failure, CORS, etc.)
 *   TimeoutError  — request exceeded the timeout threshold
 *   ApiError      — server responded with a non-2xx status
 *
 * Only NetworkError and TimeoutError are automatically retried.
 * 4xx ApiErrors are not retried (client-side errors; retrying won't help).
 * 5xx ApiErrors are retried.
 */

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

export class ApiError extends Error {
  /** @param {string} message @param {number} status */
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Perform a fetch with an AbortController-based timeout.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new TimeoutError(timeoutMs);
    }
    throw new NetworkError(err.message || 'Network request failed');
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retry a function with exponential backoff.
 * Stops retrying on non-retryable errors (4xx ApiErrors).
 *
 * @param {Function} fn            — async function to retry
 * @param {number}   maxRetries    — maximum number of retry attempts
 * @param {number}   baseDelayMs   — initial backoff delay in ms (doubles each attempt)
 * @returns {Promise<any>}
 */
export async function fetchWithRetry(fn, maxRetries = 3, baseDelayMs = 600) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Do not retry on 4xx client errors — they won't resolve with retries
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw err;
      }

      // No delay needed after the final attempt
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * 200; // add jitter to avoid thundering herd
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      }
    }
  }

  throw lastError;
}

/**
 * Classify an error into a user-friendly message and retryability flag.
 * @param {Error} err
 * @returns {{ message: string, retryable: boolean }}
 */
export function classifyError(err) {
  if (err instanceof TimeoutError) {
    return { message: "The request took too long. Please try again.", retryable: true };
  }
  if (err instanceof NetworkError) {
    return { message: "No internet connection. Please check your network.", retryable: true };
  }
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return { message: "Authentication failed. Please check your API key.", retryable: false };
    }
    if (err.status >= 500) {
      return { message: "Server error. We're working on it — please try again.", retryable: true };
    }
    return { message: "Something went wrong. Please try again.", retryable: true };
  }
  return { message: "An unexpected error occurred. Please try again.", retryable: true };
}

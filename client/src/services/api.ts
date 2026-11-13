/**
 * NutriTrack Centralized API Client Layer
 * - Keeps access token in memory (never in localStorage or sessionStorage)
 * - Transparent refresh token rotation via HttpOnly cookies
 * - Safe error handling with standardized response envelopes
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

let inMemoryToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryToken;
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; meta?: any }> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies for refresh token
  };

  let response = await fetch(url, config);

  // If 401 Unauthorized, attempt controlled session refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newToken = refreshData.data?.accessToken;
          setAccessToken(newToken);
          processQueue(null, newToken);

          // Retry the original request with new token
          headers.set('Authorization', `Bearer ${newToken}`);
          response = await fetch(url, { ...config, headers });
        } else {
          processQueue(new Error('Session refresh failed'), null);
          setAccessToken(null);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue requests until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            headers.set('Authorization', `Bearer ${token}`);
            fetch(url, { ...config, headers })
              .then((res) => res.json())
              .then(resolve)
              .catch(reject);
          },
          reject,
        });
      });
    }
  }

  const result = await response.json();

  if (!response.ok) {
    const error: any = new Error(result.message || 'API request failed');
    error.statusCode = response.status;
    error.errorCode = result.errorCode;
    error.details = result.details;
    throw error;
  }

  return result;
}

export default apiClient;

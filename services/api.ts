import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099/api';
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, '');

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type RefreshResponse = { token: string; refreshToken: string };

const REFRESH_BEFORE_EXPIRY_SECONDS = 60;
let refreshPromise: Promise<string> | null = null;

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getStoredTokens() {
  const state = useAuthStore.getState();
  if (state.token && state.refreshToken) {
    return { token: state.token, refreshToken: state.refreshToken };
  }

  if (typeof window === 'undefined') {
    return { token: null, refreshToken: null };
  }

  try {
    const stored = localStorage.getItem('auth-storage');
    const persistedState = stored ? JSON.parse(stored)?.state : null;
    return {
      token: persistedState?.token ?? null,
      refreshToken: persistedState?.refreshToken ?? null,
    };
  } catch {
    return { token: null, refreshToken: null };
  }
}

function isExpiringSoon(token: string) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return typeof decoded.exp !== 'number'
      || decoded.exp <= Math.floor(Date.now() / 1000) + REFRESH_BEFORE_EXPIRY_SECONDS;
  } catch {
    return true;
  }
}

function endSession() {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
    window.location.assign('/auth/login');
  }
}

function isRefreshRejected(error: unknown) {
  return (error instanceof Error && error.message === 'No refresh token is available.')
    || (axios.isAxiosError(error)
      && (error.response?.status === 400 || error.response?.status === 401));
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { token, refreshToken } = getStoredTokens();
    if (!token || !refreshToken) throw new Error('No refresh token is available.');

    const response = await axios.post<RefreshResponse>(`${API_URL}/Auth/refresh-token`, {
      accessToken: token,
      refreshToken,
    });

    useAuthStore.getState().updateToken(response.data.token, response.data.refreshToken);
    return response.data.token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  const { token, refreshToken } = getStoredTokens();

  if (token) {
    try {
      const accessToken = refreshToken && isExpiringSoon(token)
        ? await refreshAccessToken()
        : token;
      config.headers.Authorization = `Bearer ${accessToken}`;
    } catch (error) {
      // Do not destroy a valid local session on a temporary network/server error.
      if (isRefreshRejected(error)) endSession();
      throw error;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (isRefreshRejected(refreshError)) endSession();
      return Promise.reject(refreshError);
    }
  }
);

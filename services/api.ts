import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5099/api';
export const API_BASE_URL = API_URL.replace('/api', '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Try to get token from Zustand store
    let token = useAuthStore.getState().token;
    
    // Fallback: If store isn't hydrated yet but token exists in localStorage
    if (!token && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.state?.token;
        }
      } catch (e) {
        console.error("Could not parse auth storage", e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop if refresh token fails
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/Auth/refresh-token')) {
      originalRequest._retry = true;
      
      try {
        let { token, refreshToken } = useAuthStore.getState();
        
        // Fallback to localStorage if state is empty
        if ((!token || !refreshToken) && typeof window !== 'undefined') {
          const stored = localStorage.getItem('auth-storage');
          if (stored) {
            const parsed = JSON.parse(stored);
            token = parsed?.state?.token;
            refreshToken = parsed?.state?.refreshToken;
          }
        }
        
        if (!refreshToken || !token) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/Auth/refresh-token`, {
          accessToken: token,
          refreshToken: refreshToken,
        });

        const newAuth = response.data;
        useAuthStore.getState().updateToken(newAuth.token, newAuth.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAuth.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

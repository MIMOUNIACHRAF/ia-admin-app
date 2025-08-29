import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from '../services/authService';

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// --- Vérifier existence refresh token fallback sessionStorage (JS) ---
const hasRefreshTokenFallback = () => {
  return !!sessionStorage.getItem('refresh_token');
};

export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // --- Intercepteur de requête ---
  axiosInstance.interceptors.request.use(
    (config) => {
      const openEndpoints = ['/login', '/signup', '/refresh'];
      if (openEndpoints.some(ep => config.url?.endsWith(ep))) return config;

      // Vérification côté frontend via fallback sessionStorage
      if (!hasRefreshTokenFallback()) {
        authService.clearAccessToken();
        if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      }

      // Injecter access token
      const state = store?.getState();
      const token = state?.auth?.tokens?.access || authService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- Intercepteur de réponse ---
  axiosInstance.interceptors.response.use(
    (response) => {
      const newAccess = response.headers['x-new-access-token'];
      if (newAccess) {
        authService.setAccessToken(newAccess);
        if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Auto-refresh access token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccess = await authService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
          return axiosInstance(originalRequest);
        } catch {
          // Si refresh échoue → déconnexion
          authService.clearAccessToken();
          if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const setAxiosInstance = (instance) => { api = instance; };
export default api;

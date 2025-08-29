import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from '../services/authService';

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Vérifie si refresh token existe dans session cookie ou fallback
const hasRefreshToken = () => {
  return document.cookie.split(';').some(cookie => cookie.trim().startsWith('refresh_token=')) ||
         sessionStorage.getItem('refresh_token');
};

export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Intercepteur de requête
  axiosInstance.interceptors.request.use(
    (config) => {
      // ✅ Ignorer la vérification pour les endpoints ouverts
      const openEndpoints = ['/login', '/signup', '/refresh'];
      if (openEndpoints.some(ep => config.url?.endsWith(ep))) {
        return config;
      }

      // Vérification du refresh token uniquement pour les requêtes sécurisées
      if (!hasRefreshToken()) {
        authService.clearAccessToken();
        if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      }

      // Injection du access token si disponible
      const state = store?.getState();
      const token = state?.auth?.tokens?.access || authService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur de réponse
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
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccess = await authService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
          return axiosInstance(originalRequest);
        } catch {
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

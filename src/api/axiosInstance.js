import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import authService from '../services/authService';
import store from '../store';
import { setTokens, logout } from '../features/auth/authSlice';

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const initializeAxios = () => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // --- Interceptor avant chaque requête ---
  axiosInstance.interceptors.request.use(
    (config) => {
      const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, '/signup'];
      if (openEndpoints.some(ep => config.url?.endsWith(ep))) return config;

      // Ajouter access token si présent
      const token = authService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;

      // Ajouter refresh token uniquement pour refresh endpoint
      if (config.url?.endsWith(API_ENDPOINTS.REFRESH_TOKEN)) {
        const refresh = document.cookie
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('refresh_token='))?.split('=')[1];
          console.log("refrehs is ",refresh);
        if (refresh) config.headers['X-Refresh-Token'] = refresh;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- Interceptor après chaque réponse ---
  axiosInstance.interceptors.response.use(
    (response) => {
      // Mettre à jour access token si reçu dans headers
      const newAccess = response.headers['x-new-access-token'];
      if (newAccess) {
        authService.setAccessToken(newAccess);
        store.dispatch(setTokens({ access: newAccess }));
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Vérifier si refresh token existe
        if (!authService.isRefreshTokenPresent()) {
          store.dispatch(logout());
          return Promise.reject(new Error('Session terminée, veuillez vous reconnecter.'));
        }

        try {
          const newAccess = await authService.refreshAccessToken();
          if (!newAccess) {
            store.dispatch(logout());
            return Promise.reject(new Error('Session terminée, veuillez vous reconnecter.'));
          }

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          store.dispatch(setTokens({ access: newAccess }));

          return axiosInstance(originalRequest);
        } catch (err) {
          store.dispatch(logout());
          return Promise.reject(new Error('Session terminée, veuillez vous reconnecter.'));
        }
      }

      return Promise.reject(error);
    }
  );

  api = axiosInstance;
  return axiosInstance;
};

export const setAxiosInstance = (instance) => {
  api = instance;
};

export default api;

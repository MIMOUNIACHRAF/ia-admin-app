import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import authService from '../services/authService';
import store from '../store';
import { setTokens, logout } from '../features/auth/authSlice';
import { isRefreshTokenPresent } from '../utils/authUtils';

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

      // Vérifier si refresh token existe
      if (!isRefreshTokenPresent(false)) {
        store.dispatch(logout());
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      }

      // Ajouter access token si présent
      const token = authService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- Interceptor après chaque réponse ---
  axiosInstance.interceptors.response.use(
    (response) => {
      // Vérifier si un nouveau access token est renvoyé par l'API
      const newAccess = response.headers['x-new-access-token'];
      if (newAccess) {
        authService.setAccessToken(newAccess);
        store.dispatch(setTokens({ access: newAccess }));
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Si 401, tenter refresh access token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Vérifier si refresh token encore présent
        if (!isRefreshTokenPresent(false)) {
          store.dispatch(logout());
          return Promise.reject(new Error('Session terminée, veuillez vous reconnecter.'));
        }

        // Tenter refresh access token
        const newAccess = await authService.refreshAccessToken();
        if (!newAccess) {
          store.dispatch(logout());
          return Promise.reject(new Error('Session terminée, veuillez vous reconnecter.'));
        }

        // Refaire la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        store.dispatch(setTokens({ access: newAccess }));

        return axiosInstance(originalRequest);
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

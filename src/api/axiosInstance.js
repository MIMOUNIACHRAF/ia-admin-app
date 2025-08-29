import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import authService from '../services/authService';

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // --- Intercepteur de requête ---
  axiosInstance.interceptors.request.use(
    (config) => {
      const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, '/signup'];
      if (openEndpoints.some(ep => config.url?.endsWith(ep))) return config;

      const token = authService.getAccessToken();

      if (!token) {
        // Pas d'access token → logout direct
        if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      }

      config.headers.Authorization = `Bearer ${token}`;
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

      // 401 → essayer refresh une seule fois
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccess = await authService.refreshAccessToken();

          if (!newAccess) {
            // Pas de refresh token → logout direct
            authService.clearAccessToken();
            if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
            return Promise.reject(new Error('Refresh token absent. Session terminée.'));
          }

          // Nouveau token disponible → réessayer la requête
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
          return axiosInstance(originalRequest);

        } catch {
          // Refresh échoué → logout direct
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

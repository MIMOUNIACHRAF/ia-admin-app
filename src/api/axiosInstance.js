// utils/axiosInstance.js
import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from '../services/authService';

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔑 indispensable pour envoyer les cookies HttpOnly
  headers: { 'Content-Type': 'application/json' },
});

export const initializeAxios = (store) => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Intercepteur de requête pour injecter le token
  instance.interceptors.request.use(
    (config) => {
      const token = authService.getAccessToken() || store?.getState()?.auth?.tokens?.access;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Intercepteur de réponse pour gérer refresh token et renouvellement d'access token
  instance.interceptors.response.use(
    (response) => {
      // Si le backend renvoie un nouveau access token
      const newAccess = response.headers['x-new-access-token'];
      if (newAccess) {
        authService.setAccessToken(newAccess);
        if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Si 401, essayer de refresh le token une seule fois
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccess = await authService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
          return instance(originalRequest);
        } catch {
          // Si refresh échoue, déconnecter
          authService.clearAccessToken();
          if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Permet de remplacer l'instance globale si besoin
export const setAxiosInstance = (instance) => { api = instance; };
export default api;

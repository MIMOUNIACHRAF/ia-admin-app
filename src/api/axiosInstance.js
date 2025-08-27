import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from '../services/authService';

/**
 * Axios instance par défaut (fallback)
 */
let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Crée une instance Axios configurée avec interceptors et Redux store
 */
export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store?.getState();
      let token = state?.auth?.tokens?.access || authService.getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
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

/**
 * Permet de setter l’instance Axios globale
 */
export const setAxiosInstance = (instance) => { api = instance; };

export default api;

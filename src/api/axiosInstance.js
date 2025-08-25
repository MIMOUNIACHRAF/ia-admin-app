/**
 * Axios Instance Configuration
 * 
 * This file configures an axios instance with interceptors for:
 * - Adding access token to requests
 * - Handling token rotation via X-New-Access-Token
 * - Managing 401 errors
 */

import axios from 'axios';
import { API_BASE_URL } from './config';
import authService from '../services/authService';

const createAxiosInstance = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // necessary for HttpOnly cookie
  });

  // Request interceptor - adds access token from memory or Redux store
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      let token = state.auth && state.auth.tokens ? state.auth.tokens.access : null;
      if (!token) token = authService.getAccessToken();

      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handles 401 and token rotation
  axiosInstance.interceptors.response.use(
    (response) => {
      // Rotate access token if backend sends a new one
      const newAccess = response.headers['x-new-access-token'];
      if (newAccess) {
        authService.setAccessToken(newAccess);
        // Optionally update Redux store
        if (store) {
          store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
        }
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccess = await authService.refreshAccessToken();
          if (newAccess) {
            if (store) store.dispatch({ type: 'auth/setTokens', payload: { access: newAccess } });
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          authService.clearAccessToken();
          if (store) store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Initialize instance
export const initializeAxios = (store) => createAxiosInstance(store);

let api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export const setAxiosInstance = (instance) => { api = instance; };

export default api;

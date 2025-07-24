/**
 * Axios Instance Configuration
 * 
 * This file configures an axios instance with interceptors for:
 * - Adding authentication tokens to requests
 * - Handling token refresh on 401 errors
 * - Managing global error handling
 */

import axios from 'axios';
import { API_BASE_URL } from './config';
import { refreshToken } from '../features/auth/authThunks';

// Create a function that returns the axios instance
// This is done to avoid circular dependency issues
const createAxiosInstance = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - adds auth token to requests
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      // Safely access the token, handling potential undefined values
      const token = state.auth && state.auth.tokens ? state.auth.tokens.access : null;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handles token refresh on 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 (Unauthorized) and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Dispatch refresh token action
          await store.dispatch(refreshToken());
          
          // Get the new token from the store
          const state = store.getState();
          // Safely access the token, handling potential undefined values
          const newToken = state.auth && state.auth.tokens ? state.auth.tokens.access : null;
          
          // If we got a new token, update the request and retry
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, we need to redirect to login
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Export a function that initializes the axios instance with the store
export const initializeAxios = (store) => {
  return createAxiosInstance(store);
};

// Export a placeholder that will be replaced with the actual instance
let api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to set the API instance after store is created
export const setAxiosInstance = (instance) => {
  api = instance;
};

export default api;
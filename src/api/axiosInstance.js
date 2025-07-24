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
import authService from '../services/authService';

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
      // First try to get token from Redux store
      const state = store.getState();
      let token = state.auth && state.auth.tokens ? state.auth.tokens.access : null;
      
      // If token is not in Redux store, try to get it from localStorage
      if (!token) {
        const tokens = authService.getTokens();
        token = tokens.access;
      }
      
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
          // Get refresh token from localStorage
          const tokens = authService.getTokens();
          const refreshTokenValue = tokens.refresh;
          
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }
          
          // Use authService to refresh the token
          const response = await authService.refreshToken(refreshTokenValue);
          
          // Update Redux store with the new token
          if (response) {
            // Update the store with the new tokens
            store.dispatch({
              type: 'auth/setTokens',
              payload: {
                access: response.access || (response.tokens && response.tokens.access),
                refresh: response.refresh || (response.tokens && response.tokens.refresh)
              }
            });
            
            // Get the new token
            const newToken = response.access || (response.tokens && response.tokens.access);
            
            // If we got a new token, update the request and retry
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(originalRequest);
            }
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          authService.clearTokens();
          
          // Dispatch logout action to clear Redux store
          store.dispatch({ type: 'auth/logout/fulfilled', payload: null });
          
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
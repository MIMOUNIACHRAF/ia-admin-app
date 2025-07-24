/**
 * Authentication Service
 * 
 * This service handles all authentication-related API calls:
 * - Login
 * - Logout
 * - Token refresh
 * - User data retrieval
 */

import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const STORAGE_TYPE_KEY = 'auth_storage_type';

// Helper function to get the appropriate storage
const getStorage = () => {
  const storageType = localStorage.getItem(STORAGE_TYPE_KEY) || 'localStorage';
  return storageType === 'sessionStorage' ? sessionStorage : localStorage;
};

/**
 * Authentication service for handling API calls related to authentication
 */
const authService = {
  /**
   * Store tokens in localStorage
   * @param {Object} tokens - The tokens to store
   * @param {string} tokens.access - Access token
   * @param {string} tokens.refresh - Refresh token
   */
  setTokens: (tokens) => {
    const storage = getStorage();
    
    if (tokens.access) {
      storage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    }
    if (tokens.refresh) {
      storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    }
  },

  /**
   * Get tokens from storage
   * @returns {Object} - The tokens
   */
  getTokens: () => {
    const storage = getStorage();
    
    return {
      access: storage.getItem(ACCESS_TOKEN_KEY),
      refresh: storage.getItem(REFRESH_TOKEN_KEY)
    };
  },

  /**
   * Remove tokens from storage
   */
  clearTokens: () => {
    const storage = getStorage();
    
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  },
  /**
   * Login with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} - Response with tokens and user data
   */
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      
      // Store tokens in localStorage
      if (response.data.tokens) {
        authService.setTokens(response.data.tokens);
      } else if (response.data.access && response.data.refresh) {
        authService.setTokens({
          access: response.data.access,
          refresh: response.data.refresh
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * Logout the current user
   * @returns {Promise<Object>} - Response data
   */
  logout: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGOUT);
      
      // Clear tokens from localStorage
      authService.clearTokens();
      
      return response.data;
    } catch (error) {
      // Even if the server-side logout fails, we still clear tokens
      authService.clearTokens();
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  /**
   * Refresh the access token using a refresh token
   * @param {string} refreshToken - The refresh token
   * @returns {Promise<Object>} - Response with new access token
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh: refreshToken });
      
      // Store new tokens in localStorage
      if (response.data.tokens) {
        authService.setTokens(response.data.tokens);
      } else if (response.data.access) {
        // If only access token is returned, update only that
        const storage = getStorage();
        if (response.data.access) {
          storage.setItem(ACCESS_TOKEN_KEY, response.data.access);
        }
        // If refresh token is also returned, update it too
        if (response.data.refresh) {
          storage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  /**
   * Get the current user's data
   * @returns {Promise<Object>} - Response with user data
   */
  getUserData: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user data' };
    }
  },
  
  /**
   * Initialize authentication from localStorage
   * This should be called when the app starts
   * @returns {Object|null} - The tokens if they exist, null otherwise
   */
  initializeAuth: () => {
    const tokens = authService.getTokens();
    
    // If both tokens exist, return them
    if (tokens.access && tokens.refresh) {
      return tokens;
    }
    
    // If only one token exists, clear both for consistency
    if (tokens.access || tokens.refresh) {
      authService.clearTokens();
    }
    
    return null;
  },
  
  /**
   * Set storage type (localStorage or sessionStorage)
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   */
  setStorageType: (type) => {
    if (type === 'localStorage' || type === 'sessionStorage') {
      localStorage.setItem(STORAGE_TYPE_KEY, type);
    }
  },
  
  /**
   * Get current storage type
   * @returns {string} - Storage type ('localStorage' or 'sessionStorage')
   */
  getStorageType: () => {
    return localStorage.getItem(STORAGE_TYPE_KEY) || 'localStorage';
  }
};

export default authService;
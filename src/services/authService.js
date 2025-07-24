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

/**
 * Authentication service for handling API calls related to authentication
 */
const authService = {
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
      return response.data;
    } catch (error) {
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
  }
};

export default authService;
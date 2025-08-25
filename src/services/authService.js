/**
 * Secure Authentication Service
 *
 * Principles:
 * - Refresh token is HttpOnly (never stored in frontend)
 * - Access token stored in memory for security
 * - All API requests use Authorization header
 * - Automatic rotation via X-New-Access-Token header
 */

import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null; // Stockage en mémoire sécurisé

const authService = {
  /** --- Access token management --- */
  setAccessToken: (token) => {
    accessTokenMemory = token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getAccessToken: () => accessTokenMemory,

  clearAccessToken: () => {
    accessTokenMemory = null;
    delete api.defaults.headers.common['Authorization'];
  },

  /** --- Login --- */
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials, {
        withCredentials: true, // pour envoyer le refresh token HttpOnly
      });

      const access = response.headers['x-access-token'] || response.data.access;
      if (access) authService.setAccessToken(access);

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /** --- Logout --- */
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
      authService.clearAccessToken();
    } catch (error) {
      authService.clearAccessToken();
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  /** --- Refresh access token --- */
  refreshAccessToken: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {}, {
        withCredentials: true,
      });

      const access = response.headers['x-new-access-token'] || response.data.access;
      if (access) authService.setAccessToken(access);

      return access;
    } catch (error) {
      authService.clearAccessToken();
      throw error.response?.data || { message: 'Refresh token failed' };
    }
  },

  /** --- Get current user --- */
  getUserData: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user data' };
    }
  },

  /** --- Initialize auth --- */
  initializeAuth: () => {
    if (accessTokenMemory) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessTokenMemory}`;
      return { access: accessTokenMemory };
    }
    return null;
  },
};

export default authService;

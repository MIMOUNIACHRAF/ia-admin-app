import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null;
let skipAutoRefresh = false;

const authService = {
  /** --- Access token --- */
  setAccessToken: (token) => {
    accessTokenMemory = token;
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getAccessToken: () => accessTokenMemory || localStorage.getItem('access_token'),

  clearAccessToken: () => {
    accessTokenMemory = null;
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  },

  /** --- Refresh token uniquement côté cookie (HttpOnly) --- */
  setRefreshToken: (token) => {
    document.cookie = `refresh_token=${token}; path=/; samesite=strict;`;
    // Pas de sessionStorage
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0';
  },

  /** --- Control auto-refresh --- */
  setSkipAutoRefresh: (value) => { skipAutoRefresh = value; },

  /** --- Login --- */
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials, { withCredentials: true });

    const access = response.headers['x-access-token'] || response.data.access;
    if (access) authService.setAccessToken(access);

    if (response.data?.refresh) {
      authService.setRefreshToken(response.data.refresh);
      delete response.data.refresh;
    }

    return response.data;
  },

  /** --- Logout --- */
  logout: async () => {
    try {
      skipAutoRefresh = true;
      authService.clearAccessToken();
      authService.clearRefreshToken();
      localStorage.clear();
      await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
    } finally {
      skipAutoRefresh = false;
    }
  },

  /** --- Refresh access token --- */
  refreshAccessToken: async () => {
    if (skipAutoRefresh) return null;

    try {
      // Le backend lit le cookie HttpOnly et renvoie un nouveau access token
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
      const access = response.headers['x-new-access-token'] || response.data.access;

      if (access) authService.setAccessToken(access);

      if (response.data?.refresh) {
        authService.setRefreshToken(response.data.refresh);
        delete response.data.refresh;
      }

      return access;
    } catch (error) {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      throw error;
    }
  },

  /** --- Get user data --- */
  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER, { withCredentials: true });
    return response.data;
  },

  /** --- Initialize auth après reload --- */
  initializeAuth: async () => {
    if (accessTokenMemory) return { access: accessTokenMemory };
    if (skipAutoRefresh) return null;

    try {
      // On essaye de refresh le token via cookie HttpOnly
      const access = await authService.refreshAccessToken();
      return access ? { access } : null;
    } catch {
      return null;
    }
  },
};

export default authService;

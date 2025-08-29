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

  /** --- Refresh token côté cookie HttpOnly --- */
  setRefreshToken: (token) => {
    document.cookie = `refresh_token=${token}; path=/; samesite=strict;`;
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0';
  },

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

  /** --- Initialize auth après reload --- */
  initializeAuth: async () => {
    // 1️⃣ Si access token en mémoire ou localStorage → OK
    let access = accessTokenMemory || localStorage.getItem('access_token');
    if (access) {
      authService.setAccessToken(access);
      return { access, isAuthenticated: true };
    }

    // 2️⃣ Premier accès, pas de token → ne pas tenter refresh
    return { access: null, isAuthenticated: false };
  }
};

export default authService;

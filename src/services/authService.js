import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null;
let skipAutoRefresh = false;

const authService = {
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

  setRefreshToken: (token) => {
    document.cookie = `refresh_token=${token}; path=/; samesite=None; secure`;
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0; samesite=None; secure';
  },

  setSkipAutoRefresh: (value) => { skipAutoRefresh = value; },

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

  logout: async ({ silent = false } = {}) => {
    try {
      skipAutoRefresh = true;
      authService.clearAccessToken();
      authService.clearRefreshToken();
      localStorage.clear();
      if (!silent) await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
    } catch (err) {
      if (!silent) console.error("Erreur logout :", err);
    } finally {
      skipAutoRefresh = false;
    }
  },

  refreshAccessToken: async () => {
    if (skipAutoRefresh) return null;

    const refreshToken = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('refresh_token='))
      ?.split('=')[1];

    if (!refreshToken) {
      console.warn("Aucun refresh token trouvé → clear & stop");
      authService.clearAccessToken();
      return null;
    }

    try {
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {}, {
        withCredentials: true,
        headers: { "X-Refresh-Token": refreshToken }
      });

      const access = response.data.access || response.headers['x-new-access-token'];
      if (access) authService.setAccessToken(access);

      if (response.data?.refresh) {
        authService.setRefreshToken(response.data.refresh);
        delete response.data.refresh;
      }

      return access;
    } catch (err) {
      console.error("Erreur refresh :", err.response?.data || err.message);
      authService.clearAccessToken();
      return null;
    }
  },

  isRefreshTokenPresent: () => {
    return document.cookie.split(';').some(c => c.trim().startsWith('refresh_token='));
  },

  initializeAuth: async () => {
    if (accessTokenMemory) return { access: accessTokenMemory };
    const access = localStorage.getItem('access_token');
    if (access) {
      authService.setAccessToken(access);
      return { access };
    }

    if (!authService.isRefreshTokenPresent()) return null;

    const newAccess = await authService.refreshAccessToken();
    return newAccess ? { access: newAccess } : null;
  },

  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER, { withCredentials: true });
    return response.data;
  },
};

export default authService;

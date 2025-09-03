import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null;

const authService = {
  // --- Access Token ---
  getAccessToken: () => accessTokenMemory || localStorage.getItem('access_token'),

  setAccessToken: (token) => {
    accessTokenMemory = token;
    localStorage.setItem('access_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  clearAccessToken: () => {
    accessTokenMemory = null;
    localStorage.removeItem('access_token');
    delete api.defaults.headers.common['Authorization'];
  },

  // --- Refresh Token ---
  isRefreshTokenPresent: () =>
    document.cookie.split(';').some(c => c.trim().startsWith('refresh_token=')),

  setRefreshToken: (token) => {
    document.cookie = `refresh_token=${token}; path=/; samesite=None; secure`;
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0; samesite=None; secure';
  },

  // --- Login / Logout ---
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials, { withCredentials: true });

    const access = response.headers['x-access-token'] || response.data.access;
    if (access) authService.setAccessToken(access);

    if (response.data?.refresh) authService.setRefreshToken(response.data.refresh);

    return response.data;
  },

  logout: async ({ silent = false } = {}) => {
    authService.clearAccessToken();
    authService.clearRefreshToken();
    localStorage.clear();

    if (!silent) {
      try {
        await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
      } catch {}
    }
  },

  // --- Refresh Access Token ---
  refreshAccessToken: async () => {
    const refreshToken = document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('refresh_token='))?.split('=')[1];

    if (!refreshToken) return null;

    try {
      const response = await api.post(
        API_ENDPOINTS.REFRESH_TOKEN,
        {},
        {
          withCredentials: true,
          headers: { 'X-Refresh-Token': refreshToken },
        }
      );

      const newAccess = response.data.access || response.headers['x-new-access-token'];
      if (newAccess) authService.setAccessToken(newAccess);

      if (response.data?.refresh) authService.setRefreshToken(response.data.refresh);

      return newAccess;
    } catch {
      authService.clearAccessToken();
      return null;
    }
  },

  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER, { withCredentials: true });
    return response.data;
  },
};

export default authService;

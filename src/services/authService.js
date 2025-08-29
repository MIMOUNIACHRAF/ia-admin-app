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
    document.cookie = `refresh_token=${token}; path=/; samesite=strict;`;
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0';
  },

  setSkipAutoRefresh: (value) => { skipAutoRefresh = value; },

  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials, { withCredentials: true });
    const access = response.headers['x-access-token'] || response.data.access;
    if (access) authService.setAccessToken(access);
    if (response.data?.refresh) authService.setRefreshToken(response.data.refresh);
    return response.data;
  },

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

  refreshAccessToken: async () => {
    if (skipAutoRefresh) return null;
    try {
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
      const access = response.headers['x-new-access-token'] || response.data.access;
      if (access) authService.setAccessToken(access);
      if (response.data?.refresh) authService.setRefreshToken(response.data.refresh);
      return access;
    } catch (error) {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return null;
    }
  },

  initializeAuth: async (dispatch, setTokensAction) => {
    // 1️⃣ Token en mémoire
    let access = accessTokenMemory || localStorage.getItem('access_token');
    if (access) {
      // injection dans Redux
      if (dispatch && setTokensAction) dispatch(setTokensAction({ access }));
      return { access, isAuthenticated: true };
    }

    // 2️⃣ Tenter refresh via cookie HttpOnly
    try {
      access = await authService.refreshAccessToken();
      if (access && dispatch && setTokensAction) {
        dispatch(setTokensAction({ access }));
        return { access, isAuthenticated: true };
      }
    } catch {
      authService.clearAccessToken();
      authService.clearRefreshToken();
    }

    return { access: null, isAuthenticated: false };
  }
};

export default authService;

import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null; // stockage sécurisé en mémoire
let skipAutoRefresh = false; // pour éviter refresh automatique pendant logout

const authService = {
  /** --- Access token --- */
  setAccessToken: (token) => {
    accessTokenMemory = token;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getAccessToken: () => accessTokenMemory,

  clearAccessToken: () => {
    accessTokenMemory = null;
    delete api.defaults.headers.common['Authorization'];
  },

  /** --- Control auto-refresh --- */
  setSkipAutoRefresh: (value) => {
    skipAutoRefresh = value;
  },

  /** --- Login --- */
  login: async (credentials) => {
    // Le refresh token reste côté cookie HttpOnly côté backend
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials, { withCredentials: true });
    const access = response.headers['x-access-token'] || response.data.access;
    if (access) authService.setAccessToken(access);
    return response.data;
  },

  /** --- Logout --- */
  logout: async () => {
    try {
      skipAutoRefresh = true;

      // Désactiver temporairement les intercepteurs pour logout
      api.interceptors.request.handlers = [];
      api.interceptors.response.handlers = [];

      // Appel backend pour supprimer le cookie refresh token
      await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });

      authService.clearAccessToken();
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      authService.clearAccessToken();
      localStorage.clear();
      sessionStorage.clear();
      throw error;
    } finally {
      skipAutoRefresh = false;
    }
  },

  /** --- Refresh access token --- */
  refreshAccessToken: async () => {
    if (skipAutoRefresh) return null;
    try {
      // Le refresh token est automatiquement envoyé via cookie HttpOnly
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
      const access = response.headers['x-new-access-token'] || response.data.access;
      if (access) authService.setAccessToken(access);
      return access;
    } catch (error) {
      authService.clearAccessToken();
      throw error;
    }
  },

  /** --- Get user data --- */
  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER, { withCredentials: true });
    return response.data;
  },

  /** --- Initialize auth --- */
  initializeAuth: async () => {
    if (accessTokenMemory) return { access: accessTokenMemory };
    if (skipAutoRefresh) return null;
    try {
      // Tente de récupérer un nouvel access token depuis le refresh token (cookie)
      const access = await authService.refreshAccessToken();
      return access ? { access } : null;
    } catch {
      return null;
    }
  },
};

export default authService;

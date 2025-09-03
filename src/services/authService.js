import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null;
let skipAutoRefresh = false;

const authService = {
  // --- Access token ---
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

  // --- Refresh token côté frontend ---
  setRefreshToken: (token) => {
    // 🔑 Stockage du refresh token dans cookie côté navigateur
    document.cookie = `refresh_token=${token}; path=/; samesite=None; secure`;
  },

  clearRefreshToken: () => {
    document.cookie = 'refresh_token=; path=/; max-age=0; samesite=None; secure';
  },

  setSkipAutoRefresh: (value) => { skipAutoRefresh = value; },

  // --- Login ---
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

  // --- Logout ---
  logout: async () => {
    try {
      skipAutoRefresh = true;
      authService.clearAccessToken();
      authService.clearRefreshToken();
      localStorage.clear();
      await api.post(API_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      skipAutoRefresh = false;
    }
  },

  // --- Refresh access token ---
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

    console.log("Refreshing access token...");

    try {
      // ✅ Envoi du refresh token dans les headers
      const response = await api.post(
        API_ENDPOINTS.REFRESH_TOKEN,
        {},
        { withCredentials: true, headers: { "X-Refresh-Token": refreshToken } }
      );

      const access = response.data.access || response.headers['x-new-access-token'];
      if (access) authService.setAccessToken(access);

      if (response.data?.refresh) {
        authService.setRefreshToken(response.data.refresh);
        delete response.data.refresh;
      }

      return access;
    } catch (err) {
      console.error("Erreur refresh :", err.response?.data || err.message);
      // ❌ Important : pas de logout() ici → sinon boucle infinie
      authService.clearAccessToken();
      return null;
    }
  },

  // --- Vérifier si refresh token existe ---
  isRefreshTokenPresent: () => {
    return document.cookie.split(';').some(c => c.trim().startsWith('refresh_token='));
  },

  // --- Initialize auth après reload ---
  initializeAuth: async () => {
    // 1. Vérifier en mémoire
    if (accessTokenMemory) return { access: accessTokenMemory };

    // 2. Vérifier localStorage
    const access = localStorage.getItem('access_token');
    if (access) {
      authService.setAccessToken(access);
      return { access };
    }

    // 3. Vérifier si refresh token existe
    if (!authService.isRefreshTokenPresent()) {
      console.log("Pas de refresh token → utilisateur déconnecté");
      return null;
    }

    // 4. Tenter refresh
    const newAccess = await authService.refreshAccessToken();
    return newAccess ? { access: newAccess } : null;
  },

  // --- Get user data ---
  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER, { withCredentials: true });
    return response.data;
  },
};

export default authService;

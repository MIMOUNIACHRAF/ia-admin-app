import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

let accessTokenMemory = null;
let skipAutoRefresh = false;

const authService = {
  // --- Access Token ---
  setAccessToken: (token) => {
    accessTokenMemory = token;
    localStorage.setItem("access_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  getAccessToken: () =>
    accessTokenMemory || localStorage.getItem("access_token"),

  clearAccessToken: () => {
    accessTokenMemory = null;
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
  },

  // --- Refresh Token (uniquement cookie) ---
  setRefreshToken: (token) => {
    document.cookie = `refresh_token=${token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; secure; samesite=Lax`;
  },

  clearRefreshToken: () => {
    document.cookie = "refresh_token=; path=/; max-age=0";
  },

  getRefreshToken: () => {
    return (
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("refresh_token="))
        ?.split("=")[1] || null
    );
  },

  isRefreshTokenPresent: () => !!authService.getRefreshToken(),

  setSkipAutoRefresh: (value) => {
    skipAutoRefresh = value;
  },

  // --- Login ---
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);

    const access =
      response.headers["x-access-token"] || response.data.access;
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
      // Désactiver temporairement le refresh automatique
      skipAutoRefresh = true;

      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();

      // Envoyer la requête logout au backend si refresh token présent
      if (refreshToken) {
        await api.post(
          API_ENDPOINTS.LOGOUT,
          {}, // corps vide
          {
            headers: {
              "Authorization": accessToken ? `Bearer ${accessToken}` : "",
              "X-Refresh-Token": refreshToken
            },
          }
        );
      }

      // Nettoyer tous les tokens côté front
      authService.clearAccessToken();
      authService.clearRefreshToken();
      localStorage.clear();
    } catch (err) {
      console.error(
        "Erreur logout :",
        err.response?.data || err.message
      );
    } finally {
      // Réactiver le refresh automatique
      skipAutoRefresh = false;
    }
},


  // --- Refresh Access Token ---
 refreshAccessToken: async () => {
  if (skipAutoRefresh) return null;

  const refreshToken = authService.getRefreshToken();
  console.log("Refresh token: service ", refreshToken);
  if (!refreshToken) {
    authService.clearAccessToken();
    return null;
  }

  try {
    // Bloquer le refresh automatique pendant cet appel
    skipAutoRefresh = true;

    const response = await api.post(
      API_ENDPOINTS.REFRESH_TOKEN,
      {},
      {
        headers: {
          "X-Refresh-Token": refreshToken,
        },
      }
    );

    const accessToken = response.data?.access || response.headers["x-new-access-token"];
    console.log("New access token:", accessToken);
    if (accessToken) authService.setAccessToken(accessToken);

    // const newRefreshToken = response.data?.refresh;
    // if (newRefreshToken) {
    //   authService.setRefreshToken(newRefreshToken);
    // }
    return accessToken;
  } 
  catch (err) {
    console.error("Erreur lors du refresh token :", err.response?.data || err.message);
    authService.clearAccessToken();
    authService.clearRefreshToken();
    return null;
  } finally {
    // Débloquer le refresh automatique après l'appel
    skipAutoRefresh = false;
  }
},


  // --- Initialize auth après reload ---
  initializeAuth: async () => {
    const access = authService.getAccessToken();
    if (access) return { access };

    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) return null;

    const newAccess = await authService.refreshAccessToken();
    return newAccess ? { access: newAccess } : null;
  },

  // --- Get User Data ---
  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER);
    return response.data;
  },
};

export default authService;

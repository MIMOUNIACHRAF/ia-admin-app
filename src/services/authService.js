// src/services/authService.js
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/config";

let accessTokenMemory = null;
let refreshPromise = null;

/* ---------- helpers cookie (minimaux) ---------- */
const COOKIE_NAME = "refresh_token";

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const raw = document.cookie || "";
  return (
    raw
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`))
      ?.split("=")[1] || null
  );
}

function setCookie(name, value, maxAgeSeconds = 7 * 24 * 60 * 60) {
  if (typeof document === "undefined") return;
  // SameSite=Lax, Secure si sur https (obligatoire en prod)
  const secure = location?.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/* ---------- authService ---------- */
const authService = {
  // --- Access token (mémoire + localStorage) ---
  _internalSetAccessToken: (token) => {
    accessTokenMemory = token || null;
    if (token) {
      localStorage.setItem("access_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];
    }
  },

  setAccessToken: (token) => authService._internalSetAccessToken(token),

  getAccessToken: () => accessTokenMemory || localStorage.getItem("access_token") || null,

  clearAccessToken: () => authService._internalSetAccessToken(null),

  // --- Refresh token (cookie only) ---
  setRefreshToken: (token) => {
    if (!token) return;
    // ne pas logguer le refresh complet en prod
    setCookie(COOKIE_NAME, token);
  },

  getRefreshToken: () => readCookie(COOKIE_NAME),

  clearRefreshToken: () => clearCookie(COOKIE_NAME),

  isRefreshTokenPresent: () => !!authService.getRefreshToken(),

  // --- login/logout (front) ---
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);

      // Récupérer access token : header ou body
      const accessToken = response.headers['x-access-token'] || response.data?.access;
      if (accessToken) authService.setAccessToken(accessToken);

      // Récupérer refresh token côté backend si présent
      const refreshToken = response.data?.refresh;
      if (refreshToken) authService.setRefreshToken(refreshToken);

      // Retourner payload propre sans refresh token
      const payload = { ...response.data };
      if (payload.refresh) delete payload.refresh;

      return payload;
    } catch (err) {
      // Gestion robuste des erreurs Axios + JS
      if (err.response) {
        throw {
          status: err.response.status,
          detail: err.response.data?.detail || JSON.stringify(err.response.data),
        };
      }
      throw {
        status: null,
        detail: err.message || 'Login failed',
      };
    }
  },

  logout: async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      const access = authService.getAccessToken();
      // Attempt backend logout if refresh exists
      if (refreshToken) {
        await api.post(
          API_ENDPOINTS.LOGOUT,
          {},
          {
            headers: {
              Authorization: access ? `Bearer ${access}` : undefined,
              // Some backends expect refresh in body instead, adapt if needed
              "X-Refresh-Token": refreshToken,
            },
          }
        );
      }
    } catch (err) {
      // ignore network/logout errors on client-side logout
      console.error("⚠️ logout error:", err?.response?.data || err?.message);
    } finally {
      // cleanup local
      authService.performLocalLogout();
    }
  },

  // Centralise le nettoyage et navigation redirection
  performLocalLogout: (callback) => {
    try {
      // idempotent cleanup
      authService.clearAccessToken();
      authService.clearRefreshToken();
      localStorage.clear();
    } finally {
      if (typeof callback === "function") {
        try {
          callback();
        } catch (e) {
          // ignore callback errors
          console.error("⚠️ logout callback error", e);
        }
      }
    }
  },

  /**
   * refreshAccessToken
   * - single-flight: si refreshPromise existe on la retourne
   * - retourne la nouvelle access token ou null
   * - onInvalidRefresh() est appelé si le refresh échoue (ex: 401)
   */
  refreshAccessToken: async (onInvalidRefresh) => {
    const refreshToken = authService.getRefreshToken();
    
    if (!refreshToken) {
      // pas de refresh possible -> logout immédiat
      authService.performLocalLogout(onInvalidRefresh);
      return null;
    }

    // Si un refresh est déjà en cours, retourne la promesse en cours.
    if (refreshPromise) {
      // ATTENTION: ne pas rejeter ni modifier refreshPromise ici, laisser l'appelant attendre.
      return refreshPromise;
    }

    // Démarrer la promesse de refresh (single-flight)
    refreshPromise = (async () => {
      try {
        // Respecter le format attendu par ton backend : j'envoie le refresh dans le body (SimpleJWT)
        const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {
          refresh: refreshToken,
        });

        const accessToken = response.data?.access || response.headers?.["x-new-access-token"];
        if (accessToken) {
          // met à jour l'access en mémoire + localStorage + header
          authService.setAccessToken(accessToken);
        }

        // Mettre à jour le refresh si le backend en renvoie un nouveau
        if (response.data?.refresh) {
          authService.setRefreshToken(response.data.refresh);
        }

        return accessToken || null;
      } catch (err) {
        // si erreur (401/403) -> cleanup et callback logout
        const status = err?.response?.status;
        console.error("❌ refreshAccessToken failed:", status || err?.message);

        // Remettre à null la promesse avant le logout pour éviter le blocage
        refreshPromise = null;

        // Nettoyage local et callback
        authService.performLocalLogout(onInvalidRefresh);

        return null;
      } finally {
        // S'assurer que refreshPromise est null pour prochains appels
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  // Utility: initializeAuth utilisé par AppInitializer
  initializeAuth: async () => {
    const access = authService.getAccessToken();
    if (access) return { access };

    const refreshToken = authService.getRefreshToken();
    console.log("refreshToken2", refreshToken);
    if (!refreshToken) return null;

    const newAccess = await authService.refreshAccessToken();
    return newAccess ? { access: newAccess } : null;
  },

  // getUserData example
  getUserData: async () => {
    const res = await api.get(API_ENDPOINTS.USER);
    return res.data;
  },
};

export default authService;

// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import authService from "../services/authService";
import store from "../store";
import { setTokens, logout } from "../features/auth/authSlice";

/**
 * Instance axios centralisée.
 * - timeout par défaut
 * - withCredentials true (si cookies cross-site autorisés)
 * - gestion des 401 via interceptor response (single-flight via authService)
 */

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15s
});

// Request interceptor : injecte access token quand présent
api.interceptors.request.use(
  (config) => {
    const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, "/signup"];
    if (openEndpoints.some((ep) => config.url?.endsWith(ep))) return config;

    const token = authService.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

// Response interceptor : gère 401 -> refresh -> retry (single-flight via authService)
api.interceptors.response.use(
  (response) => {
    // Propagate new access header if backend sends un header
    const newAccess = response.headers?.["x-new-access-token"];
    if (newAccess) {
      // Mise à jour sans supprimer le refresh cookie
      authService._internalSetAccessToken(newAccess);
      store.dispatch(setTokens({ access: newAccess }));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // Si on reçoit 401 et qu'on n'a pas déjà retryé cette requête
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si pas de refresh présent → logout
      if (!authService.isRefreshTokenPresent()) {
        // idempotent logout
        authService.performLocalLogout(() => {
          store.dispatch(logout());
          // redirection client-side : location replace pour s'assurer
          window.location.replace("/login");
        });
        return Promise.reject(error);
      }

      try {
        // On tente un refresh (single-flight géré par authService)
        const newAccess = await authService.refreshAccessToken(() => {
          // callback appelé si refresh invalid -> logout global
          authService.performLocalLogout(() => {
            store.dispatch(logout());
            window.location.replace("/login");
          });
        });

        if (!newAccess) {
          // refresh invalide -> logout déjà déclenché dans callback
          return Promise.reject(error);
        }

        // Mettre à jour header et réessayer la requête initiale
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        store.dispatch(setTokens({ access: newAccess }));

        return api(originalRequest);
      } catch (err) {
        // En cas d'erreur au refresh -> logout
        authService.performLocalLogout(() => {
          store.dispatch(logout());
          window.location.replace("/login");
        });
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

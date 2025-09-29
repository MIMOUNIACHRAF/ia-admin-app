// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import authService from "../services/authService";

/**
 * Axios centralisé pour toutes les requêtes API
 * - Toujours envoie access token + refresh token
 * - Rafraîchit automatiquement access token si expiré (401)
 * - Réessaie la requête après refresh
 */

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  // ---- Request Interceptor ----
  axiosInstance.interceptors.request.use(
    (config) => {
      const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, "/signup"];
      if (openEndpoints.some((ep) => config.url?.endsWith(ep))) return config;

      const access = authService.getAccessToken();
      const refresh = authService.getRefreshToken();

      config.headers = config.headers || {};
      if (access) config.headers.Authorization = `Bearer ${access}`;
      if (refresh) config.headers["X-Refresh-Token"] = refresh;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ---- Response Interceptor ----
  axiosInstance.interceptors.response.use(
    (response) => {
      const newAccess = response.headers?.["x-new-access-token"];
      if (newAccess) {
        authService._internalSetAccessToken(newAccess);
        if (store?.dispatch) store.dispatch({ type: "auth/setTokens", payload: { access: newAccess } });
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!authService.isRefreshTokenPresent()) {
          authService.performLocalLogout(() => window.location.replace("/login"));
          if (store?.dispatch) store.dispatch({ type: "auth/logout" });
          return Promise.reject(error);
        }

        try {
          const newAccess = await authService.refreshAccessToken(() => {
            authService.performLocalLogout(() => window.location.replace("/login"));
            if (store?.dispatch) store.dispatch({ type: "auth/logout" });
          });

          if (!newAccess) return Promise.reject(error);

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          authService.performLocalLogout(() => window.location.replace("/login"));
          if (store?.dispatch) store.dispatch({ type: "auth/logout" });
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  api = axiosInstance;
  return axiosInstance;
};

// Permet d’injecter une instance depuis le store si nécessaire
export const setAxiosInstance = (instance) => {
  api = instance;
};

export default api;

// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import authService from "../services/authService";
import store from "../store";
import { setTokens, logout } from "../features/auth/authSlice";

/**
 * Instance axios centralisée.
 */
let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Permet de remplacer l’instance (utile après re-init)
 */
export const setAxiosInstance = (instance) => {
  api = instance;
};

/**
 * Initialise Axios avec store → ajoute les interceptors
 */
export const initializeAxios = (store) => {
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

  api.interceptors.response.use(
    (response) => {
      const newAccess = response.headers?.["x-new-access-token"];
      if (newAccess) {
        authService._internalSetAccessToken(newAccess);
        store.dispatch(setTokens({ access: newAccess }));
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) return Promise.reject(error);

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!authService.isRefreshTokenPresent()) {
          authService.performLocalLogout(() => {
            store.dispatch(logout());
            window.location.replace("/login");
          });
          return Promise.reject(error);
        }

        try {
          const newAccess = await authService.refreshAccessToken(() => {
            authService.performLocalLogout(() => {
              store.dispatch(logout());
              window.location.replace("/login");
            });
          });

          if (!newAccess) return Promise.reject(error);

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          store.dispatch(setTokens({ access: newAccess }));

          return api(originalRequest);
        } catch (err) {
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

  return api;
};

export default api;

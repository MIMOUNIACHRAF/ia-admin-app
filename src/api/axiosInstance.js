// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import authService from "../services/authService";

/**
 * axiosInstance centralisé.
 * - expose initializeAxios(store) pour éviter dépendance circulaire
 * - interceptors request/response (gestion 401 -> refresh -> retry)
 *
 * N.B. : on n'importe pas store en haut de fichier pour éviter cycle.
 */

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

/**
 * initializeAxios(store)
 * Appeler depuis store.js après la création du store :
 * const axiosInstance = initializeAxios(store);
 * (optionnel) setAxiosInstance(axiosInstance);
 */
export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,

  });

  // helper lecture cookie sans logger le token complet
  const getRefreshFromCookie = () =>
    (document?.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("refresh_token="))
      ?.split("=")[1] || null;

  // Request interceptor : injecte access token quand présent
  axiosInstance.interceptors.request.use(
    (config) => {
      const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, "/signup"];
      if (openEndpoints.some((ep) => config.url?.endsWith(ep))) return config;

      const token = authService.getAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Si on appelle explicitement le endpoint refresh on peut ajouter refresh en header
      if (config.url?.endsWith(API_ENDPOINTS.REFRESH_TOKEN)) {
        const refresh = getRefreshFromCookie();
        if (refresh) {
          // Ne pas console.log le refresh complet en prod.
          config.headers["X-Refresh-Token"] = refresh;
        }
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  // Response interceptor : gère 401 -> refresh -> retry (single-flight via authService)
 // Response interceptor
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

    const status = error.response?.status;
    const url = originalRequest.url || "";

    // ⚠️ Si c'est /login, on ne fait jamais logout automatique
    if (url.endsWith(API_ENDPOINTS.LOGIN)) {
      return Promise.reject(error); // laisser Redux/login gérer l'erreur
    }

    // 401 sur autres endpoints → refresh / logout
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!authService.isRefreshTokenPresent()) {
        if (store?.dispatch) store.dispatch({ type: "auth/logout" });
        authService.performLocalLogout(() => window.location.replace("/login"));
        return Promise.reject(error);
      }

      try {
        const newAccess = await authService.refreshAccessToken(() => {
          if (store?.dispatch) store.dispatch({ type: "auth/logout" });
          authService.performLocalLogout(() => window.location.replace("/login"));
        });

        if (!newAccess) return Promise.reject(error);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        if (store?.dispatch) store.dispatch({ type: "auth/setTokens", payload: { access: newAccess } });

        return axiosInstance(originalRequest);
      } catch (err) {
        if (store?.dispatch) store.dispatch({ type: "auth/logout" });
        authService.performLocalLogout(() => window.location.replace("/login"));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

  // expose instance as default api
  api = axiosInstance;
  return axiosInstance;
};

export const setAxiosInstance = (instance) => {
  api = instance;
};

export default api;

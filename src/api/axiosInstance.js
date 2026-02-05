// src/api/axiosInstance.js
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./config";
import authService from "../services/authService";

let api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // indispensable pour envoyer les cookies cross-origin
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});


export const initializeAxios = (store) => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  // Fonction pour récupérer le refresh token depuis cookie (si pas HttpOnly)
  const getRefreshFromCookie = () => {
    
    return (document?.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("refresh_token="))
      ?.split("=")[1] || null;
  };
      

 
  axiosInstance.interceptors.request.use(
  (config) => {
    console.log("[Axios] Interceptor request pour :", config.url);

    const openEndpoints = [API_ENDPOINTS.LOGIN, API_ENDPOINTS.REFRESH_TOKEN, "/signup"];
    if (openEndpoints.some((ep) => config.url?.endsWith(ep))) return config;

    config.headers = config.headers || {};

    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios] Access token injecté :", token);
    }

    const refresh = getRefreshFromCookie();
    if (refresh) {
      config.headers["X-Refresh-Token"] = refresh;
      console.log("[Axios] X-Refresh-Token injecté :", refresh);
    }

    return config;
  },
  (err) => Promise.reject(err)
);


  // -------------------------------
  // Response interceptor
  // -------------------------------
  axiosInstance.interceptors.response.use(
    (response) => {
      // Nouvelle access token depuis le backend
      const newAccess = response.headers?.["x-new-access-token"];
      if (newAccess) {
        authService._internalSetAccessToken(newAccess);
        if (store?.dispatch) {
          store.dispatch({ type: "auth/setTokens", payload: { access: newAccess } });
        }
        console.log("[Axios] Nouveau access token reçu :", newAccess);
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (!originalRequest) return Promise.reject(error);

      const status = error.response?.status;
      const url = originalRequest.url || "";

      // Ne jamais logout automatiquement sur /login
      if (url.endsWith(API_ENDPOINTS.LOGIN)) return Promise.reject(error);

      // 401 → essayer refresh token
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

          // Toujours renvoyer le refresh token aussi
          const refresh = getRefreshFromCookie();
          if (refresh) originalRequest.headers["X-Refresh-Token"] = refresh;

          if (store?.dispatch)
            store.dispatch({ type: "auth/setTokens", payload: { access: newAccess } });

          console.log("[Axios] Retry avec nouveau access token :", newAccess);

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

  api = axiosInstance;
      
  
  return axiosInstance;
};

export const setAxiosInstance = (instance) => {
  api = instance;
};

export default api;

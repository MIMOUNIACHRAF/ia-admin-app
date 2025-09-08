// src/api/config.js
/**
 * Configuration API
 * Remplacer VITE_API_BASE_URL dans .env si besoin.
 */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://achrafpapaza.pythonanywhere.com/api";

export const API_ENDPOINTS = {
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  REFRESH_TOKEN: "/auth/refresh/",
  USER: "/auth/user/",
};

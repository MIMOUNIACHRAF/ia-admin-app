// src/api/config.js
/**
 * Configuration API
 * Remplacer VITE_API_BASE_URL dans .env si besoin.
 */
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://achrafpapaza.pythonanywhere.com/api";
export const API_PREFIX = "/V1";
export const API_ENDPOINTS = {
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  REFRESH_TOKEN: "/auth/refresh/",
  USER: "/auth/user/",
<<<<<<< HEAD
  AGENTS: `${API_PREFIX}/agents/`,
=======
  AGENTS: "/V1/agents/",
>>>>>>> 865a17bc326d8ebedc31dc2b2545e7a53054d132
};

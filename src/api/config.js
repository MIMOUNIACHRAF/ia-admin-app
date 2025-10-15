export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://achrafpapaza.pythonanywhere.com/api";

export const API_ENDPOINTS = {
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  REFRESH_TOKEN: "/auth/refresh/",
  ME: "/auth/me/",
  AGENTS: "/V1/agents/",
  TEMPLATES: "/V1/templates/",
  QUESTIONS: "/V1/questions_reponses/",
};
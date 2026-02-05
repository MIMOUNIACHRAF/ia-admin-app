export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 
  "http://localhost:8000/api";

export const API_ENDPOINTS = {
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  REFRESH_TOKEN: "/auth/refresh/",
  ME: "/auth/me/",
  AGENTS: "/V1/agents/",
  TEMPLATES: "/V1/templates/",
  QUESTIONS: "/V1/questions_reponses/",
};
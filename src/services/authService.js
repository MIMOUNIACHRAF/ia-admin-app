import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/config";

const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
    return response.data;
  },

  getUserData: async () => {
    const response = await api.get(API_ENDPOINTS.USER);
    return response.data;
  },
};

export default authService;
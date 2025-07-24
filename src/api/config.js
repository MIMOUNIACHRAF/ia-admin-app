/**
 * API Configuration
 * 
 * This file contains the configuration for the API endpoints.
 * The base URL is configurable through environment variables.
 */

// Base URL for API requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://achrafpapaza.pythonanywhere.com/api';

// Authentication endpoints
export const API_ENDPOINTS = {
  LOGIN: '/auth/login/',
  LOGOUT: '/auth/logout/',
  REFRESH_TOKEN: '/auth/refresh/',
  USER: '/auth/user/'
};
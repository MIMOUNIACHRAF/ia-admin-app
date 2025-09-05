// src/features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

 

/**
 * --- Login ---
 * Appelle le backend et stocke access token en mémoire
 * Retourne payload sans refresh token
 * Propagation complète des erreurs avec status + detail
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data; // payload propre, sans refresh token
    } catch (err) {
      // Gestion complète des erreurs Axios + JS
      const payload = err.response
        ? {
            status: err.response.status,
            detail: err.response.data?.detail || JSON.stringify(err.response.data),
          }
        : {
            status: err.status ?? null,
            detail: err.detail || err.message || 'Login failed',
          };
      return rejectWithValue(payload);
    }
  }
);
/**
 * --- Logout ---
 * Idempotent, supprime access + refresh + Redux state
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.performLocalLogout();
      return null;
    } catch (err) {
      return rejectWithValue({
        status: err.response?.status || null,
        detail: err.response?.data?.detail || err.message,
      });
    }
  }
);

/**
 * --- Refresh token ---
 * Single-flight : une seule promesse partagée pour tous les appels
 * Logout immédiat si refresh invalide ou absent
 */
export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const access = await authService.refreshAccessToken();
      if (!access) {
        await authService.performLocalLogout();
        return rejectWithValue({ status: 403, detail: 'Refresh token absent ou expiré' });
      }
      return { access };
    } catch (err) {
      await authService.performLocalLogout();
      return rejectWithValue({ status: err.response?.status || null, detail: err.message || 'Token refresh failed' });
    }
  }
);

/**
 * --- Fetch user data ---
 */
export const fetchUserData = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getUserData();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Fetch user failed');
    }
  }
);

/**
 * --- Check auth state après reload navigateur ---
 * - Initialise authService (localStorage)
 * - Fetch user data si access token présent
 * - Logout si absent
 */
export const checkAuthState = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch }) => {
    try {
      const tokens = await authService.initializeAuth();
      if (tokens?.access) {
        await dispatch(fetchUserData()).unwrap();
        return true;
      } else {
        await dispatch(logout());
        return false;
      }
    } catch {
      await dispatch(logout());
      return false;
    }
  }
);

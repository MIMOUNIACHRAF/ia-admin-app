// src/features/auth/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

/**
 * --- Login ---
 * Appelle le backend et stocke access token en mémoire
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      // access token mis en mémoire via authService
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Login failed');
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
      return rejectWithValue(err?.message || 'Logout failed');
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
      const access = await authService.refreshAccessToken(); // single-flight interne
      if (!access) {
        await authService.performLocalLogout();
        return rejectWithValue('Refresh token absent ou expiré');
      }
      return { access };
    } catch (err) {
      await authService.performLocalLogout();
      return rejectWithValue(err?.message || 'Token refresh failed');
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

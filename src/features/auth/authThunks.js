import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { jwtDecode } from 'jwt-decode';

// --- Login ---
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// --- Logout ---
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// --- Refresh access token ---
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const newAccess = await authService.refreshAccessToken();
      return { access: newAccess };
    } catch (error) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// --- Fetch user data ---
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.tokens?.access) throw new Error('No access token available');

      // Vérifier expiration du token
      try {
        const decoded = jwtDecode(auth.tokens.access);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime || decoded.exp - currentTime < 30) {
          await dispatch(refreshToken());
        }
      } catch {}

      const response = await authService.getUserData();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  }
);

// --- Check auth state ---
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { dispatch }) => {
    const tokens = authService.initializeAuth();
    if (tokens?.access) {
      try {
        await dispatch(refreshToken()).unwrap();
        await dispatch(fetchUserData()).unwrap();
        return true;
      } catch {
        await dispatch(logout());
        return false;
      }
    }
    return false;
  }
);
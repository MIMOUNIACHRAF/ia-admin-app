import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      // access token est mis en mémoire via authService
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    return null;
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const access = await authService.refreshAccessToken();
      return { access };
    } catch (err) {
      // clear token in memory si refresh échoue
      authService.clearAccessToken();
      return rejectWithValue(err.message || 'Token refresh failed');
    }
  }
);

// Fetch user data
export const fetchUserData = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getUserData();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Fetch user failed');
    }
  }
);

// Check auth state après reload navigateur
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

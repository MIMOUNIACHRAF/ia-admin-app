/**
 * Auth Thunks
 * 
 * This file contains the async thunks for authentication operations:
 * - Login
 * - Logout
 * - Token refresh
 * - Fetching user data
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { jwtDecode } from 'jwt-decode';

/**
 * Login thunk
 * Authenticates a user with email and password
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store refresh token in localStorage
      if (response.tokens && response.tokens.refresh) {
        localStorage.setItem('refresh_token', response.tokens.refresh);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Logout thunk
 * Logs out the current user and clears auth state
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Remove refresh token from localStorage
      localStorage.removeItem('refresh_token');
      
      return null;
    } catch (error) {
      // Even if the server-side logout fails, we still want to clear local state
      localStorage.removeItem('refresh_token');
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * Refresh token thunk
 * Gets a new access token using the refresh token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      return response;
    } catch (error) {
      // If refresh fails, remove the refresh token
      localStorage.removeItem('refresh_token');
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

/**
 * Fetch user data thunk
 * Gets the current user's data
 */
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (_, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      
      // Check if tokens object and access token exist
      if (!auth.tokens || !auth.tokens.access) {
        throw new Error('No access token available');
      }
      
      // Check if token is expired
      try {
        const decoded = jwtDecode(auth.tokens.access);
        const currentTime = Date.now() / 1000;
        
        // If token is expired or about to expire (within 30 seconds), refresh it
        if (decoded.exp < currentTime || decoded.exp - currentTime < 30) {
          await dispatch(refreshToken());
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
      }
      
      const response = await authService.getUserData();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user data');
    }
  }
);

/**
 * Check auth state thunk
 * Checks if the user is authenticated by validating tokens
 */
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { dispatch }) => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      try {
        // Try to refresh the token
        await dispatch(refreshToken()).unwrap();
        
        // If successful, fetch user data
        await dispatch(fetchUserData()).unwrap();
        
        return true;
      } catch (error) {
        // If refresh fails, clear auth state
        await dispatch(logout());
        return false;
      }
    }
    
    return false;
  }
);
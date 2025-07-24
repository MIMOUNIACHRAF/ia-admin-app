/**
 * Auth Slice
 * 
 * This slice manages the authentication state in Redux:
 * - User information
 * - Authentication tokens
 * - Authentication status (loading, error, etc.)
 */

import { createSlice } from '@reduxjs/toolkit';
import { login, logout, refreshToken, fetchUserData } from './authThunks';

/**
 * Initial state for the auth slice
 */
const initialState = {
  user: null,
  tokens: {
    access: null,
    // Note: refresh token is stored in localStorage, not in Redux state
  },
  status: {
    isAuthenticated: false,
    isLoading: false,
    error: null
  }
};

/**
 * Auth slice with reducers and actions
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Clear any error in the auth state
     */
    clearError: (state) => {
      state.status.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.status.isLoading = true;
      state.status.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.status.isLoading = false;
      
      // Safely set user data if it exists in the payload
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      
      // Safely set access token if it exists in the payload
      if (action.payload.tokens && action.payload.tokens.access) {
        state.tokens.access = action.payload.tokens.access;
      } else if (action.payload.access) {
        // Alternative structure: token might be directly in the payload
        state.tokens.access = action.payload.access;
      }
      
      state.status.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.isLoading = false;
      state.status.error = action.payload || 'Failed to login';
      state.status.isAuthenticated = false;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.status.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      return initialState;
    });
    builder.addCase(logout.rejected, (state) => {
      // Even if logout fails on the server, we still clear the state
      return initialState;
    });
    
    // Token refresh
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      // Handle different possible response structures
      if (action.payload.tokens && action.payload.tokens.access) {
        state.tokens.access = action.payload.tokens.access;
      } else if (action.payload.access) {
        state.tokens.access = action.payload.access;
      }
    });
    builder.addCase(refreshToken.rejected, (state) => {
      // If token refresh fails, user is no longer authenticated
      return initialState;
    });
    
    // Fetch user data
    builder.addCase(fetchUserData.pending, (state) => {
      state.status.isLoading = true;
    });
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.status.isLoading = false;
      state.user = action.payload;
    });
    builder.addCase(fetchUserData.rejected, (state, action) => {
      state.status.isLoading = false;
      state.status.error = action.payload || 'Failed to fetch user data';
    });
  },
});

// Export actions
export const { clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
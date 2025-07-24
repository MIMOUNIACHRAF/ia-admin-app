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
    refresh: null,
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
    
    /**
     * Set tokens directly in the state
     * Useful for initializing from localStorage or for testing
     */
    setTokens: (state, action) => {
      if (action.payload.access) {
        state.tokens.access = action.payload.access;
      }
      if (action.payload.refresh) {
        state.tokens.refresh = action.payload.refresh;
      }
      if (action.payload.access || action.payload.refresh) {
        state.status.isAuthenticated = true;
      }
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
      
      // Handle different possible response structures for tokens
      if (action.payload.tokens) {
        // Structure: { tokens: { access, refresh } }
        if (action.payload.tokens.access) {
          state.tokens.access = action.payload.tokens.access;
        }
        if (action.payload.tokens.refresh) {
          state.tokens.refresh = action.payload.tokens.refresh;
        }
      } else {
        // Alternative structure: { access, refresh }
        if (action.payload.access) {
          state.tokens.access = action.payload.access;
        }
        if (action.payload.refresh) {
          state.tokens.refresh = action.payload.refresh;
        }
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
      // Handle different possible response structures for tokens
      if (action.payload.tokens) {
        // Structure: { tokens: { access, refresh } }
        if (action.payload.tokens.access) {
          state.tokens.access = action.payload.tokens.access;
        }
        if (action.payload.tokens.refresh) {
          state.tokens.refresh = action.payload.tokens.refresh;
        }
      } else {
        // Alternative structure: { access, refresh }
        if (action.payload.access) {
          state.tokens.access = action.payload.access;
        }
        if (action.payload.refresh) {
          state.tokens.refresh = action.payload.refresh;
        }
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
export const { clearError, setTokens } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
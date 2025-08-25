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
import authService from '../../services/authService'; // <-- chemin corrigé

const initialState = {
  user: null,
  tokens: { access: null },
  status: { isAuthenticated: false, isLoading: false, error: null },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.status.error = null;
    },
    setTokens: (state, action) => {
      if (action.payload.access) {
        state.tokens.access = action.payload.access;
        authService.setAccessToken(action.payload.access); // met à jour le token en mémoire
      }
      state.status.isAuthenticated = !!state.tokens.access;
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
      state.user = action.payload.user || null;

      const access = action.payload.access || action.payload.tokens?.access;
      if (access) {
        state.tokens.access = access;
        authService.setAccessToken(access);
      }

      state.status.isAuthenticated = !!state.tokens.access;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.isLoading = false;
      state.status.error = action.payload || 'Login failed';
      state.status.isAuthenticated = false;
      authService.clearAccessToken();
    });

    // Logout
    builder.addCase(logout.fulfilled, () => {
      authService.clearAccessToken();
      return initialState;
    });

    // Refresh token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      const access = action.payload.access;
      if (access) {
        state.tokens.access = access;
        authService.setAccessToken(access);
      }
      state.status.isAuthenticated = !!state.tokens.access;
    });
    builder.addCase(refreshToken.rejected, () => {
      authService.clearAccessToken();
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

export const { clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;

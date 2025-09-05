// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login, logout as logoutThunk, refreshToken, fetchUserData } from './authThunks';
import authService from '../../services/authService';

/**
 * Etat initial
 */
const initialState = {
  user: null,
  tokens: { access: null },
  status: { isAuthenticated: false, isLoading: false, error: null },
};

/**
 * Slice auth
 * - Gestion de l’authentification
 * - Gestion des tokens access + refresh (via authService)
 * - Logout idempotent et centralisé
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Nettoie uniquement l'erreur côté front
     */
    clearError: (state) => {
      state.status.error = null;
    },

    /**
     * Mise à jour des tokens access
     */
    setTokens: (state, action) => {
      const access = action.payload?.access || null;
      state.tokens.access = access;

      if (access) {
        authService.setAccessToken(access);
        state.status.isAuthenticated = true;
      } else {
        authService.clearAccessToken();
        state.status.isAuthenticated = false;
      }
    },

    /**
     * Logout idempotent
     * - Supprime access + refresh + Redux state
     */
    logout: () => {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // --- Login ---
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
        state.status.isAuthenticated = true;
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.isLoading = false;
      state.status.error = action.payload || 'Login failed';
      state.tokens.access = null;
      authService.clearAccessToken();
      state.status.isAuthenticated = false;
    });

    // --- Logout thunk ---
    builder.addCase(logoutThunk.fulfilled, () => {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return initialState;
    });

    // --- Refresh access token ---
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      const access = action.payload?.access;
      if (access) {
        state.tokens.access = access;
        authService.setAccessToken(access);
        state.status.isAuthenticated = true;
      }
    });
    builder.addCase(refreshToken.rejected, () => {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return initialState;
    });

    // --- Fetch user data ---
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

export const { clearError, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;

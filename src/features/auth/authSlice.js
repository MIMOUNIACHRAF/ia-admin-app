import { createSlice } from '@reduxjs/toolkit';
import { login, logout as logoutThunk, refreshToken, fetchUserData } from './authThunks';
import authService from '../../services/authService';

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
      const access = action.payload?.access;
      if (access) {
        state.tokens.access = access;
        authService.setAccessToken(access);
        state.status.isAuthenticated = true;
      } else {
        state.tokens.access = null;
        authService.clearAccessToken();
        state.status.isAuthenticated = false;
      }
    },
    logout: () => {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return initialState;
    },
  },
  extraReducers: (builder) => {
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

    builder.addCase(logoutThunk.fulfilled, () => {
      authService.clearAccessToken();
      authService.clearRefreshToken();
      return initialState;
    });

    builder.addCase(refreshToken.fulfilled, (state, action) => {
      const access = action.payload.access;
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

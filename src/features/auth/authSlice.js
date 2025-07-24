import { createSlice } from "@reduxjs/toolkit";
import { login, logout, refreshToken, fetchUserData } from "./authThunks";

const initialState = {
  user: null,
  tokens: {
    access: null,
  },
  status: {
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
      state.user = action.payload.user;
      state.tokens.access = action.payload.tokens.access;
      state.status.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status.isLoading = false;
      state.status.error = action.payload || "Failed to login";
      state.status.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      return initialState;
    });

    // Token refresh
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.tokens.access = action.payload.access;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      return initialState;
    });

    // Fetch user data
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
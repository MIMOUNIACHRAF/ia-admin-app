export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.status.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.status.isLoading;
export const selectAuthError = (state) => state.auth.status.error;
export const selectAccessToken = (state) => state.auth.tokens.access;

/**
 * Auth Selectors
 * 
 * This file contains selectors for accessing the auth state from components.
 * These selectors help to decouple components from the Redux store structure.
 */

/**
 * Select the current user
 * @param {Object} state - Redux state
 * @returns {Object|null} - User object or null if not authenticated
 */
export const selectUser = (state) => state.auth.user;

/**
 * Select whether the user is authenticated
 * @param {Object} state - Redux state
 * @returns {boolean} - True if authenticated, false otherwise
 */
export const selectIsAuthenticated = (state) => state.auth.status.isAuthenticated;

/**
 * Select whether authentication is loading
 * @param {Object} state - Redux state
 * @returns {boolean} - True if loading, false otherwise
 */
export const selectAuthLoading = (state) => state.auth.status.isLoading;

/**
 * Select any authentication error
 * @param {Object} state - Redux state
 * @returns {string|null} - Error message or null if no error
 */
export const selectAuthError = (state) => state.auth.status.error;

/**
 * Select the access token
 * @param {Object} state - Redux state
 * @returns {string|null} - Access token or null if not authenticated
 */
export const selectAccessToken = (state) => state.auth.tokens.access;
/**
 * Authentication Flow Test Utilities
 * 
 * This file contains utility functions for testing the authentication flow.
 * These functions can be used in the browser console to test the authentication flow.
 */

import store from '../store';
import { login, logout, refreshToken, checkAuthState } from '../features/auth/authThunks';
import { setTokens } from '../features/auth/authSlice';
import authService from '../services/authService';
import { 
  isTokenExpired, 
  getTokenExpirationTime, 
  getTokenRemainingTime,
  decodeToken,
  getUserFromToken,
  formatTokenExpiration
} from './tokenUtils';

/**
 * Test login with credentials
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} - Login result
 */
export const testLogin = async (credentials) => {
  try {
    const result = await store.dispatch(login(credentials)).unwrap();
    console.log('Login successful:', result);
    
    // Get tokens from storage
    const tokens = authService.getTokens();
    console.log('Tokens in storage:', tokens);
    
    // Decode access token
    if (tokens.access) {
      const decoded = decodeToken(tokens.access);
      console.log('Decoded access token:', decoded);
      
      // Get user info
      const user = getUserFromToken(tokens.access);
      console.log('User from token:', user);
      
      // Check expiration
      const isExpired = isTokenExpired(tokens.access);
      console.log('Is token expired?', isExpired);
      
      // Get expiration time
      const expTime = formatTokenExpiration(tokens.access);
      console.log('Token expires at:', expTime);
      
      // Get remaining time
      const remainingTime = getTokenRemainingTime(tokens.access);
      console.log('Token remaining time (seconds):', remainingTime);
    }
    
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Test logout
 * @returns {Promise<void>}
 */
export const testLogout = async () => {
  try {
    await store.dispatch(logout()).unwrap();
    console.log('Logout successful');
    
    // Check if tokens are cleared
    const tokens = authService.getTokens();
    console.log('Tokens after logout:', tokens);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Test token refresh
 * @returns {Promise<Object>}
 */
export const testRefreshToken = async () => {
  try {
    const result = await store.dispatch(refreshToken()).unwrap();
    console.log('Token refresh successful:', result);
    
    // Get new tokens from storage
    const tokens = authService.getTokens();
    console.log('New tokens in storage:', tokens);
    
    return result;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Test check auth state
 * @returns {Promise<boolean>}
 */
export const testCheckAuthState = async () => {
  try {
    const result = await store.dispatch(checkAuthState()).unwrap();
    console.log('Auth state check result:', result);
    
    return result;
  } catch (error) {
    console.error('Auth state check failed:', error);
    throw error;
  }
};

/**
 * Test manual token setting
 * @param {Object} tokens - Tokens to set
 * @param {string} tokens.access - Access token
 * @param {string} tokens.refresh - Refresh token
 */
export const testSetTokens = (tokens) => {
  try {
    // Set tokens in Redux store
    store.dispatch(setTokens(tokens));
    console.log('Tokens set in Redux store');
    
    // Set tokens in storage
    authService.setTokens(tokens);
    console.log('Tokens set in storage');
    
    // Get tokens from storage to verify
    const storedTokens = authService.getTokens();
    console.log('Tokens in storage:', storedTokens);
  } catch (error) {
    console.error('Setting tokens failed:', error);
    throw error;
  }
};

/**
 * Get current auth state
 * @returns {Object} - Current auth state
 */
export const getAuthState = () => {
  const state = store.getState();
  return state.auth;
};

// Export all functions as a single object for easy access in console
const authTestUtils = {
  testLogin,
  testLogout,
  testRefreshToken,
  testCheckAuthState,
  testSetTokens,
  getAuthState,
  tokenUtils: {
    isTokenExpired,
    getTokenExpirationTime,
    getTokenRemainingTime,
    decodeToken,
    getUserFromToken,
    formatTokenExpiration
  }
};

// Make available globally when in development
if (process.env.NODE_ENV === 'development') {
  window.authTestUtils = authTestUtils;
}

export default authTestUtils;
/**
 * Authentication Test Script
 * 
 * This file contains a script that can be run in the browser console to test the authentication flow.
 * It provides a simple interface for testing login, logout, token refresh, etc.
 * 
 * Usage:
 * 1. Import this file in your main.jsx or App.jsx
 * 2. Open the browser console
 * 3. Type: authTest.login('user@example.com', 'password')
 */

import store from '../store';
import { login, logout, refreshToken, checkAuthState } from '../features/auth/authThunks';
import authService from '../services/authService';
import { decodeToken, formatTokenExpiration } from './tokenUtils';

// Simple test interface for the browser console
const authTest = {
  /**
   * Test login
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (email, password) => {
    console.log(`Attempting to login with email: ${email}`);
    try {
      const result = await store.dispatch(login({ email, password })).unwrap();
      console.log('✅ Login successful!');
      console.log('User:', result.user);
      
      const tokens = authService.getTokens();
      if (tokens.access) {
        const decoded = decodeToken(tokens.access);
        console.log('Token expiration:', formatTokenExpiration(tokens.access));
        console.log('Token payload:', decoded);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  },
  
  /**
   * Test logout
   */
  logout: async () => {
    console.log('Attempting to logout...');
    try {
      await store.dispatch(logout()).unwrap();
      console.log('✅ Logout successful!');
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  },
  
  /**
   * Test token refresh
   */
  refreshToken: async () => {
    console.log('Attempting to refresh token...');
    try {
      const result = await store.dispatch(refreshToken()).unwrap();
      console.log('✅ Token refresh successful!');
      
      const tokens = authService.getTokens();
      if (tokens.access) {
        console.log('New token expiration:', formatTokenExpiration(tokens.access));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
    }
  },
  
  /**
   * Check authentication state
   */
  checkAuth: async () => {
    console.log('Checking authentication state...');
    try {
      const result = await store.dispatch(checkAuthState()).unwrap();
      if (result) {
        console.log('✅ User is authenticated!');
      } else {
        console.log('❌ User is not authenticated!');
      }
      return result;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    }
  },
  
  /**
   * Get current auth state
   */
  getState: () => {
    const state = store.getState().auth;
    console.log('Current auth state:', state);
    return state;
  },
  
  /**
   * Get tokens from storage
   */
  getTokens: () => {
    const tokens = authService.getTokens();
    console.log('Tokens in storage:', tokens);
    return tokens;
  },
  
  /**
   * Clear tokens
   */
  clearTokens: () => {
    authService.clearTokens();
    console.log('✅ Tokens cleared from storage!');
  },
  
  /**
   * Help text
   */
  help: () => {
    console.log(`
Authentication Test Commands:
----------------------------
authTest.login(email, password) - Test login with credentials
authTest.logout() - Test logout
authTest.refreshToken() - Test token refresh
authTest.checkAuth() - Check if user is authenticated
authTest.getState() - Get current auth state from Redux
authTest.getTokens() - Get tokens from storage
authTest.clearTokens() - Clear tokens from storage
authTest.help() - Show this help text
    `);
  }
};

// Make available globally when in development
if (process.env.NODE_ENV === 'development') {
  window.authTest = authTest;
  console.log('Auth test utilities available as "authTest" in console');
  console.log('Type "authTest.help()" for available commands');
}

export default authTest;
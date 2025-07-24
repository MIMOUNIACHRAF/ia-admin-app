/**
 * Test Authentication Flow
 * 
 * This script provides functions to test the authentication flow:
 * - Login
 * - Token refresh
 * - Protected routes
 * - Logout
 * 
 * Usage:
 * Import these functions in your components or use them in the browser console
 * to test the authentication flow.
 */

import store from '../store';
import { login, logout, refreshToken, fetchUserData, checkAuthState } from '../features/auth/authThunks';
import { selectIsAuthenticated, selectUser, selectAccessToken } from '../features/auth/authSelectors';
import { isTokenExpired, getTokenRemainingTime } from './tokenUtils';
import api from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/config';

/**
 * Test login
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} - Login result
 */
export const testLogin = async (credentials = { email: 'test@example.com', password: 'password' }) => {
  console.log('Testing login with credentials:', credentials);
  
  try {
    const result = await store.dispatch(login(credentials)).unwrap();
    console.log('Login successful:', result);
    
    const state = store.getState();
    console.log('Auth state after login:', {
      isAuthenticated: selectIsAuthenticated(state),
      user: selectUser(state),
      accessToken: selectAccessToken(state),
      refreshToken: localStorage.getItem('refresh_token')
    });
    
    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Test token refresh
 * @returns {Promise<Object>} - Refresh result
 */
export const testTokenRefresh = async () => {
  console.log('Testing token refresh');
  
  try {
    const state = store.getState();
    const accessToken = selectAccessToken(state);
    
    if (!accessToken) {
      console.error('No access token available. Please login first.');
      return null;
    }
    
    console.log('Current token expiration status:', {
      isExpired: isTokenExpired(accessToken),
      remainingTime: getTokenRemainingTime(accessToken)
    });
    
    const result = await store.dispatch(refreshToken()).unwrap();
    console.log('Token refresh successful:', result);
    
    const newState = store.getState();
    console.log('Auth state after refresh:', {
      isAuthenticated: selectIsAuthenticated(newState),
      accessToken: selectAccessToken(newState)
    });
    
    return result;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

/**
 * Test protected API call
 * @returns {Promise<Object>} - API call result
 */
export const testProtectedApiCall = async () => {
  console.log('Testing protected API call');
  
  try {
    const state = store.getState();
    
    if (!selectIsAuthenticated(state)) {
      console.error('Not authenticated. Please login first.');
      return null;
    }
    
    const result = await api.get(API_ENDPOINTS.USER);
    console.log('Protected API call successful:', result.data);
    
    return result.data;
  } catch (error) {
    console.error('Protected API call failed:', error);
    throw error;
  }
};

/**
 * Test logout
 * @returns {Promise<void>}
 */
export const testLogout = async () => {
  console.log('Testing logout');
  
  try {
    await store.dispatch(logout()).unwrap();
    console.log('Logout successful');
    
    const state = store.getState();
    console.log('Auth state after logout:', {
      isAuthenticated: selectIsAuthenticated(state),
      user: selectUser(state),
      accessToken: selectAccessToken(state),
      refreshToken: localStorage.getItem('refresh_token')
    });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Test complete authentication flow
 * @param {Object} credentials - User credentials
 * @returns {Promise<void>}
 */
export const testCompleteAuthFlow = async (credentials) => {
  console.log('Testing complete authentication flow');
  
  try {
    // Step 1: Login
    await testLogin(credentials);
    
    // Step 2: Make a protected API call
    await testProtectedApiCall();
    
    // Step 3: Refresh token
    await testTokenRefresh();
    
    // Step 4: Make another protected API call after token refresh
    await testProtectedApiCall();
    
    // Step 5: Logout
    await testLogout();
    
    console.log('Complete authentication flow test completed successfully');
  } catch (error) {
    console.error('Authentication flow test failed:', error);
    throw error;
  }
};

/**
 * Check current authentication state
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const testCheckAuthState = async () => {
  console.log('Checking current authentication state');
  
  try {
    const result = await store.dispatch(checkAuthState()).unwrap();
    console.log('Auth state check result:', result);
    
    const state = store.getState();
    console.log('Current auth state:', {
      isAuthenticated: selectIsAuthenticated(state),
      user: selectUser(state),
      accessToken: selectAccessToken(state),
      refreshToken: localStorage.getItem('refresh_token')
    });
    
    return result;
  } catch (error) {
    console.error('Auth state check failed:', error);
    throw error;
  }
};
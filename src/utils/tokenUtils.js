/**
 * Token Utilities
 * 
 * This file contains utility functions for token management:
 * - Checking token expiration
 * - Getting token expiration time
 * - Decoding tokens
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Check if a token is expired or about to expire
 * @param {string} token - JWT token to check
 * @param {number} [expirationBuffer=300] - Buffer time in seconds (default: 5 minutes)
 * @returns {boolean} - True if token is expired or about to expire, false otherwise
 */
export const isTokenExpired = (token, expirationBuffer = 300) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired or about to expire (within buffer time)
    return decoded.exp < currentTime || decoded.exp - currentTime < expirationBuffer;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Get the expiration time of a token
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration time in seconds since epoch, or null if invalid
 */
export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.exp;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get the remaining time until token expiration
 * @param {string} token - JWT token
 * @returns {number|null} - Remaining time in seconds, or null if invalid
 */
export const getTokenRemainingTime = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  
  if (!expirationTime) return null;
  
  const currentTime = Date.now() / 1000;
  return Math.max(0, expirationTime - currentTime);
};

/**
 * Decode a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload, or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
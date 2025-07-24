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

/**
 * Get user information from a token
 * @param {string} token - JWT token
 * @returns {Object|null} - User information from token, or null if invalid
 */
export const getUserFromToken = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded) return null;
  
  // Extract user information from token
  // The exact properties depend on your token structure
  // Common properties include: sub (subject/user ID), name, email, roles, etc.
  return {
    id: decoded.sub || decoded.user_id || decoded.id,
    email: decoded.email,
    username: decoded.username || decoded.name,
    roles: decoded.roles || decoded.permissions || [],
    // Add any other user properties from your token
  };
};

/**
 * Check if a token needs to be refreshed
 * @param {string} token - JWT token
 * @param {number} [refreshThreshold=600] - Threshold in seconds (default: 10 minutes)
 * @returns {boolean} - True if token needs to be refreshed, false otherwise
 */
export const shouldRefreshToken = (token, refreshThreshold = 600) => {
  return isTokenExpired(token, refreshThreshold);
};

/**
 * Format token expiration time to human-readable format
 * @param {string} token - JWT token
 * @returns {string|null} - Formatted expiration time, or null if invalid
 */
export const formatTokenExpiration = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  
  if (!expirationTime) return null;
  
  // Convert to milliseconds for Date constructor
  const expirationDate = new Date(expirationTime * 1000);
  
  return expirationDate.toLocaleString();
};
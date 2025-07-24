/**
 * Redux Persist Configuration
 * 
 * This file configures Redux Persist to store authentication state
 * in localStorage or sessionStorage.
 */

import storage from 'redux-persist/lib/storage'; // localStorage
import sessionStorage from 'redux-persist/lib/storage/session'; // sessionStorage

// Using localStorage for persistence
// For better security, you could switch to sessionStorage
// by changing the storage import above and below
const persistConfig = {
  key: 'root',
  storage, // Use localStorage for persistence
  whitelist: ['auth'], // Only persist auth state
};

// Auth-specific persist configuration
export const authPersistConfig = {
  key: 'auth',
  storage, // Use localStorage for persistence
  whitelist: ['user', 'status', 'tokens'], // Include tokens for persistence
};

export default persistConfig;
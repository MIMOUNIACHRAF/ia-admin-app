/**
 * Redux Store Configuration
 * 
 * This file configures the Redux store with:
 * - Reducers
 * - Middleware
 * - Redux Persist for token storage
 * - Dev tools configuration
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import { initializeAxios, setAxiosInstance } from '../api/axiosInstance';

/**
 * Configure Redux Persist
 * We don't persist the access token in storage for security reasons
 */
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'status'], // Only persist user data and authentication status
  blacklist: ['tokens'], // Don't persist tokens in localStorage
};

/**
 * Combine all reducers
 */
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  // Add other reducers here as needed
});

/**
 * Create the Redux store
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serializability check
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Create the persistor for Redux Persist
 */
export const persistor = persistStore(store);

/**
 * Initialize axios with the store for interceptors
 */
const axiosInstance = initializeAxios(store);
setAxiosInstance(axiosInstance);

export default store;
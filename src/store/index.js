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
import authReducer from '../features/auth/authSlice';
import { initializeAxios, setAxiosInstance } from '../api/axiosInstance';
import persistConfig, { authPersistConfig } from './persistConfig';

/**
 * Import persist configuration from separate file
 * We now persist both tokens for JWT authentication
 */

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
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from '../features/auth/authSlice';
import { initializeAxios, setAxiosInstance } from '../api/axiosInstance';
import persistConfig, { authPersistConfig } from './persistConfig';

/**
 * Combine all reducers
 */
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  // Ajoute d'autres reducers ici si nécessaire
});

/**
 * Configure Redux store
 */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Redux Persist
 */
export const persistor = persistStore(store);

/**
 * Initialise Axios avec store pour interceptors
 * - Gère automatiquement le refresh access token
 */
const axiosInstance = initializeAxios(store);
setAxiosInstance(axiosInstance);

export default store;

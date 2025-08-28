import storage from 'redux-persist/lib/storage'; // localStorage
// import sessionStorage from 'redux-persist/lib/storage/session'; // optionnel

// Root persist configuration
const persistConfig = {
  key: 'root',
  storage, // localStorage ou sessionStorage pour plus de sécurité
  whitelist: ['auth'], // seulement auth state
};

// Auth-specific persist configuration
export const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'tokens'], // persister uniquement l'utilisateur et l'access token
  // ⚠ Ne jamais persister le refresh token côté front-end
};

export default persistConfig;

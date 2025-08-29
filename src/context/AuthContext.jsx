// src/context/AuthContext.jsx
import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import { login as loginAction, logout as logoutAction, checkAuthState } from "../features/auth/authThunks";
import authService from "../services/authService";

const AuthContext = createContext({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticatedRedux = useSelector(selectIsAuthenticated);
  const [initialized, setInitialized] = useState(false);

  // Initial check auth on app mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = await authService.initializeAuth(); // récupère ou refresh access token si refresh token existe
        if (tokens?.access) {
          await dispatch(checkAuthState()).unwrap();
        }
      } catch {
        await dispatch(logoutAction()).unwrap();
      } finally {
        setInitialized(true);
      }
    };
    initAuth();
  }, [dispatch]);

  const login = useCallback(async (credentials) => {
    return dispatch(loginAction(credentials)).unwrap();
  }, [dispatch]);

  const logout = useCallback(async () => {
    return dispatch(logoutAction()).unwrap();
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    return dispatch(checkAuthState()).unwrap();
  }, [dispatch]);

  // Ne rien rendre avant l'initialisation pour éviter le redirect prématuré
  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuthenticatedRedux, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// src/context/AuthContext.jsx
import { createContext, useContext, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import { login as loginAction, logout as logoutAction, checkAuthState } from "../features/auth/authThunks";

const AuthContext = createContext({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Login function
  const login = useCallback(async (credentials) => {
    return dispatch(loginAction(credentials)).unwrap();
  }, [dispatch]);

  // Logout function
  const logout = useCallback(async () => {
    return dispatch(logoutAction()).unwrap();
  }, [dispatch]);

  // Check auth state (useful on app init / reload)
  const checkAuth = useCallback(async () => {
    return dispatch(checkAuthState()).unwrap();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

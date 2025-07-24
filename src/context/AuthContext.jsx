// src/context/AuthContext.jsx
// This file provides a compatibility layer for components that still use AuthContext
// It uses Redux under the hood for actual state management

import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import { login as loginAction, logout as logoutAction } from "../features/auth/authThunks";

const AuthContext = createContext();

/**
 * AuthProvider component that uses Redux for state management
 * This is a compatibility layer for components that still use AuthContext
 */
export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Login function that dispatches the Redux login action
  const login = (credentials) => {
    dispatch(loginAction(credentials));
  };

  // Logout function that dispatches the Redux logout action
  const logout = () => {
    dispatch(logoutAction());
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  return useContext(AuthContext);
}

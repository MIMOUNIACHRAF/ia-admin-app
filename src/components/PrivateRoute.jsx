import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated, selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";

export default function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const result = await authService.initializeAuth(dispatch, setTokens);
      setValid(result.isAuthenticated);
      setLoading(false);
    };
    initAuth();
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return valid ? <Outlet /> : <Navigate to="/login" replace />;
}

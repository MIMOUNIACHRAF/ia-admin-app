import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated, selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";

export default function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Vérifie access token en Redux ou localStorage
        let token = accessToken || authService.getAccessToken();
        if (token) {
          dispatch(setTokens({ access: token }));
          setIsTokenValid(true);
        }
        setIsCheckingAuth(false);
      } catch {
        setIsTokenValid(false);
        setIsCheckingAuth(false);
      }
    };
    checkToken();
  }, [accessToken, dispatch]);

  if (isCheckingAuth) return <div>Loading...</div>;

  return isTokenValid ? <Outlet /> : <Navigate to="/login" replace />;
}

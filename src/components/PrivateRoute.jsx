import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated, selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";

export default function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        let token = accessToken || authService.getAccessToken();

        if (token) {
          dispatch(setTokens({ access: token }));
          setIsTokenValid(true);
        } else {
          // Pas de token → redirection login
          setIsTokenValid(false);
        }

        setIsCheckingAuth(false);
      } catch {
        setIsTokenValid(false);
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  // Redirection automatique si pas de token
  useEffect(() => {
    if (!isCheckingAuth && !isTokenValid) {
      navigate('/login', { replace: true });
    }
  }, [isCheckingAuth, isTokenValid, navigate]);

  if (isCheckingAuth) return <div>Loading...</div>;

  return isTokenValid ? <Outlet /> : null;
}

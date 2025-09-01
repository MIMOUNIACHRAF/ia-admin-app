import { Outlet, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";
import { isRefreshTokenPresent } from "../utils/authUtils";

export function PrivateRoute() {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
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
          const refreshExists = await isRefreshTokenPresent();
          if (!refreshExists) {
            await authService.logout();
            setIsTokenValid(false);
          } else {
            const newAccess = await authService.refreshAccessToken();
            if (newAccess) {
              dispatch(setTokens({ access: newAccess }));
              setIsTokenValid(true);
            } else {
              await authService.logout();
              setIsTokenValid(false);
            }
          }
        }
      } catch {
        await authService.logout();
        setIsTokenValid(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  if (isCheckingAuth) return <div>Loading...</div>;
  return isTokenValid ? <Outlet /> : <Navigate to="/login" replace />;
}

// --- PublicRoute : empêche accès à login si déjà connecté ---
export function PublicRoute() {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
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
          const refreshExists = await isRefreshTokenPresent();
          if (!refreshExists) {
            setIsTokenValid(false);
          } else {
            const newAccess = await authService.refreshAccessToken();
            if (newAccess) {
              dispatch(setTokens({ access: newAccess }));
              setIsTokenValid(true);
            } else {
              setIsTokenValid(false);
            }
          }
        }
      } catch {
        setIsTokenValid(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  if (isCheckingAuth) return <div>Loading...</div>;
  return isTokenValid ? <Navigate to="/" replace /> : <Outlet />;
}

import { Outlet, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens, logout } from "../features/auth/authSlice";

const useAuthCheck = () => {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        let token = accessToken || authService.getAccessToken();

        if (token) {
          // Access token présent → OK
          dispatch(setTokens({ access: token }));
          setIsValid(true);
        } else {
          // Essayer de rafraîchir l'access token via backend
          const newAccess = await authService.refreshAccessToken();
          if (newAccess) {
            dispatch(setTokens({ access: newAccess }));
            setIsValid(true);
          } else {
            // Refresh token absent / expiré
            await authService.logout();
            dispatch(logout());
            setIsValid(false);
          }
        }
      } catch {
        await authService.logout();
        dispatch(logout());
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  return { isChecking, isValid };
};

// PrivateRoute : accès uniquement si authentifié
export function PrivateRoute() {
  const { isChecking, isValid } = useAuthCheck();
  if (isChecking) return <div>Loading...</div>;
  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
}

// PublicRoute : accès uniquement si non authentifié
export function PublicRoute() {
  const { isChecking, isValid } = useAuthCheck();
  if (isChecking) return <div>Loading...</div>;
  return isValid ? <Navigate to="/" replace /> : <Outlet />;
}

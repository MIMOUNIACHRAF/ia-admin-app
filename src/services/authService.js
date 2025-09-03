import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const initAuth = async () => {
      const access = authService.getAccessToken();
      const refreshExists = authService.isRefreshTokenPresent();

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      // CAS 1 : access + refresh → OK, rien à faire
      if (access && refreshExists) {
        dispatch(setTokens({ access }));
        return;
      }

      // CAS 2 : access absent, refresh présent → refresh token
      if (!access && refreshExists) {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } else {
          // refresh token invalide → suppression locale
          authService.clearAccessToken();
          authService.clearRefreshToken();
          navigate("/login", { replace: true });
        }
        return;
      }

      // CAS 3 : refresh absent → première visite ou session expirée
      // on ne fait pas de logout API car pas de token
      authService.clearAccessToken();
      authService.clearRefreshToken();
      navigate("/login", { replace: true });
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

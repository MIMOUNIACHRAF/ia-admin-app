import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    // ⚡️ Ne rien faire au premier rendu si on est déjà sur /login
    if (!hasChecked.current && location.pathname === "/login") {
      hasChecked.current = true;
      return;
    }

    if (hasChecked.current) return;
    hasChecked.current = true;

    const initAuth = async () => {
      const access = authService.getAccessToken();
      const refreshExists = authService.isRefreshTokenPresent();

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      // CAS 1 : access + refresh → OK
      if (access && refreshExists) {
        dispatch(setTokens({ access }));
        return;
      }

      // CAS 2 : access absent, refresh présent → tenter refresh
      if (!access && refreshExists) {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } else {
          authService.clearAccessToken();
          authService.clearRefreshToken();
          navigate("/login", { replace: true });
        }
        return;
      }

      // CAS 3 : refresh absent → session expirée ou première visite
      authService.clearAccessToken();
      authService.clearRefreshToken();
      navigate("/login", { replace: true });
    };

    initAuth();
  }, [dispatch, navigate, location.pathname]);

  return children;
}

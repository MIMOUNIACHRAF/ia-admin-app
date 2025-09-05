// src/AppInitializer.jsx
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";

/**
 * AppInitializer : vérifie l'auth à l'initialisation (reload)
 * - Si pas de refresh -> logout immédiat
 * - Si access absent + refresh présent -> tentative de refresh
 * - Si refresh échoue -> logout + redirect sauf si on est sur /login
 */
export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const logoutAndRedirect = () => {
      // ⚠️ Ne pas logout si on est déjà sur /login
      if (location.pathname === "/login") return;

      dispatch(logout());
      navigate("/login", { replace: true });
    };

    const initAuth = async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        const accessToken = authService.getAccessToken();

        if (!refreshToken) {
          // pas de refresh -> logout sauf si login
          if (location.pathname !== "/login") {
            authService.performLocalLogout(logoutAndRedirect);
          }
          return;
        }

        if (!accessToken) {
          // tentative de refresh avec timeout
          const REFRESH_TIMEOUT_MS = 5000;
          const newAccess = await Promise.race([
            authService.refreshAccessToken(logoutAndRedirect),
            new Promise((res) => setTimeout(() => res(null), REFRESH_TIMEOUT_MS)),
          ]);

          if (newAccess) {
            dispatch(setTokens({ access: newAccess }));
            return;
          }

          // refresh échoué -> logout sauf si login
          if (location.pathname !== "/login") {
            authService.performLocalLogout(logoutAndRedirect);
          }
          return;
        }

        // Access + refresh OK : hydrater le store
        dispatch(setTokens({ access: accessToken }));
      } catch (e) {
        console.error("Erreur initAuth:", e);
        if (location.pathname !== "/login") {
          authService.performLocalLogout(logoutAndRedirect);
        }
      }
    };

    initAuth();
  }, [dispatch, navigate, location]);

  return children;
}

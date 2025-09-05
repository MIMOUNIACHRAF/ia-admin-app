// src/AppInitializer.jsx
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";

/**
 * AppInitializer : vérifie l'auth à l'initialisation (reload)
 * - Si pas de refresh -> logout immédiat
 * - Si access absent + refresh présent -> tentera refresh (timeout optionnel)
 * - Si refresh échoue -> logout + redirect
 */

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const logoutAndRedirect = () => {
      dispatch(logout());
      // navigation via replace pour ne pas garder l'historique
      navigate("/login", { replace: true });
    };

    const initAuth = async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        const accessToken = authService.getAccessToken();

        if (!refreshToken) {
          // logout immédiat si aucun refresh
          authService.performLocalLogout(logoutAndRedirect);
          return;
        }

        if (!accessToken) {
          // tentative de refresh avec timeout (pour éviter attente infinie)
          const REFRESH_TIMEOUT_MS = 5000;
          const newAccess = await Promise.race([
            authService.refreshAccessToken(logoutAndRedirect),
            new Promise((res) => setTimeout(() => res(null), REFRESH_TIMEOUT_MS)),
          ]);

          if (newAccess) {
            dispatch(setTokens({ access: newAccess }));
            return;
          }

          // refresh échoué ou timeout -> logout
          authService.performLocalLogout(logoutAndRedirect);
          return;
        }

        // Access + refresh OK : hydrater le store
        dispatch(setTokens({ access: accessToken }));
      } catch (e) {
        console.error("Erreur initAuth:", e);
        authService.performLocalLogout(logoutAndRedirect);
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const logoutAndRedirect = () => {
      dispatch(logout());
      navigate("/login", { replace: true });
    };

    const initAuth = async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        const accessToken = authService.getAccessToken();
        const refreshExists = !!refreshToken;

        console.log("Access token présent ?", !!accessToken);
        console.log("Refresh token présent ?", refreshExists);

        // Pas de refresh token → logout immédiat
        if (!refreshExists) {
          console.log("Refresh token absent → logout forcé");
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          logoutAndRedirect();
          return;
        }

        // Refresh token présent mais access absent → tenter refresh
        if (!accessToken && refreshExists) {
          console.log("Access absent mais refresh présent → tenter refresh");
          const newAccess = await authService.refreshAccessToken(logoutAndRedirect);
          if (newAccess) {
            console.log("✅ Refresh réussi, nouvel access token stocké");
            dispatch(setTokens({ access: newAccess }));
          }
          return; // Si refresh échoue, logoutAndRedirect est appelé
        }

        // Access + refresh présents → tout va bien
        if (accessToken && refreshExists) {
          console.log("✅ Access + refresh présents → OK");
          dispatch(setTokens({ access: accessToken }));
        }
      } catch (err) {
        console.error("Erreur initAuth:", err);
        authService.clearAccessToken();
        authService.clearRefreshToken();
        localStorage.clear();
        logoutAndRedirect();
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

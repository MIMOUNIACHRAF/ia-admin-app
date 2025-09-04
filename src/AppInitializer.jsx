import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";

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
        const access = authService.getAccessToken();
        const refreshExists = !!refreshToken;

        console.log("Access token présent ?", !!access);
        console.log("Refresh token présent ?", refreshExists);

        if (!refreshExists) {
          console.log("Refresh token absent → vider tout et rediriger");
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          logoutAndRedirect();
          return;
        }

        if (!access && refreshExists) {
          console.log("Access absent mais refresh présent → tenter refresh");
          const newAccess = await authService.refreshAccessToken(logoutAndRedirect);
          if (newAccess) {
            console.log("✅ Refresh réussi, nouvel access token stocké");
            dispatch(setTokens({ access: newAccess }));
          }
          // Si refresh invalide, logoutAndRedirect est déjà appelé depuis refreshAccessToken
          return;
        }

        if (access && refreshExists) {
          console.log("✅ Access + refresh présents → OK");
          dispatch(setTokens({ access }));
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

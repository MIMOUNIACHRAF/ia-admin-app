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

    const initAuth = async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        const access = authService.getAccessToken();
        const refreshExists = !!refreshToken;

        console.log("Access token présent ?", !!access);
        console.log("Refresh token présent ?", refreshExists);

        // 1️⃣ Pas de refresh token → tout nettoyer
        if (!refreshExists) {
          console.log("Refresh token absent → vider tout et rediriger");
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          dispatch(logout());
          navigate("/login", { replace: true });
          return;
        }

        // 2️⃣ Refresh présent mais access absent → tenter refresh
        if (!access && refreshExists) {
          console.log("Access absent mais refresh présent → tenter refresh");
          const newAccess = await authService.refreshAccessToken();

          if (newAccess) {
            console.log("✅ Refresh réussi, nouvel access token stocké");
            dispatch(setTokens({ access: newAccess }));
            return;
          } else {
            console.log("❌ Refresh invalide → vider tout et rediriger");
            authService.clearAccessToken();
            authService.clearRefreshToken();
            localStorage.clear();
            dispatch(logout());
            navigate("/login", { replace: true });
            return;
          }
        }

        // 3️⃣ Access + refresh présents → tout est OK
        if (access && refreshExists) {
          console.log("✅ Access + refresh présents → OK");
          dispatch(setTokens({ access }));
        }
      } catch (err) {
        console.error("Erreur initAuth:", err);
        authService.clearAccessToken();
        authService.clearRefreshToken();
        localStorage.clear();
        dispatch(logout());
        navigate("/login", { replace: true });
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

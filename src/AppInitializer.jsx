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
      // Lire le refresh token directement depuis le cookie
      const refreshToken = authService.getRefreshToken();
      console.log("Refresh token présent ?", refreshToken);
      console.log("Cookies actuels :", document.cookie);

      const access = authService.getAccessToken();
      const refreshExists = !!refreshToken;

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      // Pas de refresh token → vider tout et rediriger
      if (!refreshExists) {
        console.log("Refresh token absent → vider tout et rediriger");
        localStorage.clear();
        authService.clearAccessToken();
        authService.clearRefreshToken();
        dispatch(logout());
        navigate("/login", { replace: true });
        return;
      }

      // Refresh token présent mais access absent → tenter refresh
      if (!access && refreshExists) {
        console.log("Access absent mais refresh présent → tenter refresh");
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          authService.setAccessToken(newAccess);
          dispatch(setTokens({ access: newAccess }));
        } else {
          console.log("Refresh échoué → vider tout et rediriger");
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          dispatch(logout());
          navigate("/login", { replace: true });
        }
        return;
      }

      // Access + refresh présents → tout est OK
      if (access && refreshExists) {
        dispatch(setTokens({ access }));
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

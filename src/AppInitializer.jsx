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
      const access = authService.getAccessToken();
      const refreshExists = authService.isRefreshTokenPresent();
      const return1 = document.cookie.split(';').some(c => c.trim().startsWith('refresh_token='));

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);
      console.log("Refresh token présent ?", return1);

      // Refresh token absent → vider tout et rediriger
      if (!refreshExists) {
        authService.clearAccessToken();
        authService.clearRefreshToken();
        localStorage.clear();
        dispatch(logout());
        navigate("/login", { replace: true });
        return;
      }

      // Refresh token présent mais access absent → tenter refresh
      if (!access && refreshExists) {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } else {
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          dispatch(logout());
          navigate("/login", { replace: true });
        }
        return;
      }

      // Access + refresh présents → OK
      if (access && refreshExists) {
        dispatch(setTokens({ access }));
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

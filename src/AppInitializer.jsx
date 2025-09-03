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
      const refreshToken = document.cookie
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('refresh_token='))
          ?.split('=')[1] || null;

        console.log(refreshToken);
      console.log("Refresh token présent ?", refreshToken);
      console.log("cookies est ", document.cookie);

      const access = authService.getAccessToken();
      const refreshExists = authService.isRefreshTokenPresent();
      

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      // Refresh token absent → vider tout et rediriger
      if (!refreshExists) {
        console.log("Refresh token absent → vider tout et rediriger");
        // authService.clearAccessToken();
        // authService.clearRefreshToken();
        // localStorage.clear();
        // dispatch(logout());
        // navigate("/login", { replace: true });
        return;
      }

      // Refresh token présent mais access absent → tenter refresh
      if (!access && refreshExists) {
        console.log("Refresh token présent mais access absent → tenter refresh");
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } 
        else {
          console.log("Refresh token absent → vider tout et rediriger");
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

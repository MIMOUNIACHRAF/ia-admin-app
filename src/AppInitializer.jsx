import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom"; // pour redirection login

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
          await dispatch(logout());
          navigate("/login", { replace: true });
        }
        return;
      }

      // CAS 3 & 4 : refresh absent → logout immédiat
      await dispatch(logout());
      navigate("/login", { replace: true });
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

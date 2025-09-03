// AppInitializer.jsx
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens } from "./features/auth/authSlice";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const hasChecked = useRef(false);

  useEffect(() => {
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

      // CAS 2 : access absent, refresh présent → refresh
      if (!access && refreshExists) {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } else {
          await authService.logout();
        }
        return;
      }

      // CAS 3 & 4 : refresh absent → logout
      await authService.logout();
    };

    initAuth();
  }, [dispatch]);

  return children;
}

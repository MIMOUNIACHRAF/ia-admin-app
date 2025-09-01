import { useEffect } from "react";
import { useDispatch } from "react-redux";
import authService from "../services/authService";
import { setTokens, logout } from "../features/auth/authSlice";
import { isRefreshTokenPresent } from "../utils/authUtils";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const refreshExists = await isRefreshTokenPresent();
      if (!refreshExists) {
        await authService.logout();
        dispatch(logout());
        return;
      }

      const newAccess = await authService.refreshAccessToken();
      if (newAccess) {
        dispatch(setTokens({ access: newAccess }));
      } else {
        await authService.logout();
        dispatch(logout());
      }
    };

    initAuth();
  }, [dispatch]);

  return children;
}

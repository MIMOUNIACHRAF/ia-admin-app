import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import authService from "./services/authService";
import { setTokens } from "./features/auth/authSlice";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const hasChecked = useRef(false);
  const accessToken = useSelector((state) => state.auth.tokens.access);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const initAuth = async () => {
      if (!accessToken) {
        // Pas encore loggé, rien à faire
        return;
      }

      // Si accessToken présent, tenter refresh
      const newAccess = await authService.refreshAccessToken();
      if (newAccess) {
        dispatch(setTokens({ access: newAccess }));
      }
    };

    initAuth();
  }, [dispatch, accessToken]);

  return children;
}

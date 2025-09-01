import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";
import { isRefreshTokenPresent } from "./utils/authUtils";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const hasChecked = useRef(false); // ✅ flag pour éviter la boucle

  useEffect(() => {
    if (hasChecked.current) return; // déjà vérifié
    hasChecked.current = true;

    const initAuth = async () => {
      console.log("Vérification du refresh token...");
      const refreshExists = await isRefreshTokenPresent();
      console.log("Refresh token présent ?", refreshExists);

      if (!refreshExists) {
        console.log("Refresh token absent. Déconnexion forcée.");
        await authService.logout();
        dispatch(logout());
        return;
      }

      const newAccess = await authService.refreshAccessToken();
      if (newAccess) {
        dispatch(setTokens({ access: newAccess }));
      } else {
        console.log("Impossible de rafraîchir le token. Déconnexion.");
        await authService.logout();
        dispatch(logout());
      }
    };

    initAuth();
  }, [dispatch]);

  return children;
}

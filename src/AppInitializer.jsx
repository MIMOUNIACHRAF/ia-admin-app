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

      console.log("Cookies actuels:", document.cookie);
      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      if (access) {
        console.log("✅ Access token déjà présent, pas de refresh immédiat");
        dispatch(setTokens({ access }));
        return;
      }

      if (!refreshExists) {
        console.log("❌ Pas de refresh token → logout immédiat");
        await authService.logout({ silent: true });
        return;
      }

      // Tenter refresh access token
      try {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          console.log("✅ Access token rafraîchi avec succès");
          dispatch(setTokens({ access: newAccess }));
        } else {
          console.log("❌ Échec du refresh → logout");
          await authService.logout({ silent: true });
        }
      } catch (err) {
        console.log("❌ Erreur refresh → logout", err);
        await authService.logout({ silent: true });
      }
    };

    initAuth();
  }, [dispatch]);

  return children;
}

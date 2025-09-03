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
      // 1️⃣ Vérifier si access déjà présent en mémoire/localStorage
      const access = authService.getAccessToken();
      if (access) {
        console.log("✅ Access token déjà présent, pas de refresh");
        dispatch(setTokens({ access }));
        return;
      }

      // 2️⃣ Vérifier si refresh token présent
      if (!authService.isRefreshTokenPresent()) {
        console.log("❌ Pas de refresh token → logout");
        await authService.logout();
        return;
      }

      // 3️⃣ Essayer de rafraîchir l'access token
      const newAccess = await authService.refreshAccessToken();
      if (newAccess) {
        console.log("🔄 Access token rafraîchi avec succès");
        dispatch(setTokens({ access: newAccess }));
      } else {
        console.log("❌ Échec du refresh → logout");
        await authService.logout();
      }
    };

    initAuth();
  }, [dispatch]);

  return children;
}

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
      // 1️⃣ Si on a déjà un access token → pas besoin de refresh
      if (accessToken) return;

      // 2️⃣ Vérifier si refresh token est présent
      const refreshExists = authService.isRefreshTokenPresent();
      if (!refreshExists) {
        // 🔹 Pas de refresh token → rester sur la page login, ne pas déclencher logout ici
        console.log("Pas de refresh token présent. L'utilisateur reste sur login.");
        return;
      }

      // 3️⃣ Tenter de rafraîchir l'access token
      try {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
          console.log("Access token rafraîchi avec succès.");
        } else {
          // 🔹 Refresh token invalide → nettoyage optionnel
          console.warn("Refresh token invalide ou expiré.");
          // authService.logout(); // Optionnel : seulement si tu veux supprimer cookies invalides
        }
      } catch (err) {
        console.error("Erreur lors du refresh de l'access token :", err);
        // authService.logout(); // Optionnel
      }
    };

    initAuth();
  }, [dispatch, accessToken]);

  return children;
}

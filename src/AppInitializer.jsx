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
      // 🔹 Vérifier refresh token à chaque reload
      const refreshExists = authService.isRefreshTokenPresent();
      if (!refreshExists) {
        console.log("Pas de refresh token → logout immédiat");
        await authService.logout();
        return;
      }

      // 🔹 Tenter de refresh l'access token
      const newAccess = await authService.refreshAccessToken();
      if (newAccess) {
        dispatch(setTokens({ access: newAccess }));
        console.log("Access token rafraîchi avec succès");
      }
    };

    initAuth();
  }, [dispatch, accessToken]);

  return children;
}

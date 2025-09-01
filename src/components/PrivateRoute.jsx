import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";
import { isRefreshTokenPresent } from "../utils/authUtils";

export default function PrivateRoute() {
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // 🔹 Affichage du cookie complet pour debug
        console.log("Cookies actuels :", document.cookie);

        // Vérifier refresh token côté frontend
        const refreshExists = await isRefreshTokenPresent();
        if (!refreshExists) {
          // ❌ Pas de refresh token → session terminée
          await authService.logout();
          setIsTokenValid(false);
          navigate("/login", { replace: true });
          return;
        }

        // Vérifier access token
        let token = accessToken || authService.getAccessToken();
        if (token) {
          dispatch(setTokens({ access: token }));
          setIsTokenValid(true);
        } else {
          // 🔄 Tenter refresh via backend
          const newAccess = await authService.refreshAccessToken();
          if (newAccess) {
            dispatch(setTokens({ access: newAccess }));
            setIsTokenValid(true);
          } else {
            await authService.logout();
            navigate("/login", { replace: true });
          }
        }
      } catch (err) {
        console.error("Erreur auth:", err);
        await authService.logout();
        navigate("/login", { replace: true });
      }
    };

    checkToken();
  }, [accessToken, dispatch, navigate]);

  return isTokenValid ? <Outlet /> : null;
}

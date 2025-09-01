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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Cookies actuels :", document.cookie);

        // Vérifier access token en mémoire ou localStorage
        let token = accessToken || authService.getAccessToken();

        if (token) {
          dispatch(setTokens({ access: token }));
        } else {
          // Vérifier refresh token dans cookie
          const refreshExists = await isRefreshTokenPresent();

          if (!refreshExists) {
            console.log("Refresh token absent. Déconnexion forcée.");
            await authService.logout();
            navigate("/login", { replace: true }); // ← redirection immédiate
            return;
          }

          // Tenter de refresh access token si refresh token présent
          const newAccess = await authService.refreshAccessToken();
          if (!newAccess) {
            await authService.logout();
            navigate("/login", { replace: true }); // ← redirection immédiate
            return;
          }

          dispatch(setTokens({ access: newAccess }));
        }
      } catch (err) {
        console.error("Erreur auth:", err);
        await authService.logout();
        navigate("/login", { replace: true }); // ← redirection immédiate
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [accessToken, dispatch, navigate]);

  // ⚡ Tant que l'auth est en cours de vérification, rien n'est rendu
  if (isCheckingAuth) return null;

  return <Outlet />;
}

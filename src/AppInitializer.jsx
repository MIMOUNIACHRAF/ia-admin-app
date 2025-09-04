import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "./services/authService";
import { setTokens, logout } from "./features/auth/authSlice";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

 useEffect(() => {
  if (hasChecked.current) return;
  hasChecked.current = true;

  const logoutAndRedirect = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const initAuth = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      const accessToken = authService.getAccessToken();

      if (!refreshToken) {
        console.log("⚠️ Pas de refresh token → logout immédiat");
        logoutAndRedirect();
        return;
      }
      if (!accessToken) {
        console.log("⏳ Access token absent → tentative de refresh");
        const newAccess = await Promise.race([
          authService.refreshAccessToken(logoutAndRedirect),
          new Promise(resolve => setTimeout(() => resolve(null), 5000)) // timeout 5s
        ]);

        if (newAccess) {
          console.log("✅ Refresh réussi, access token stocké");
          dispatch(setTokens({ access: newAccess }));
        } else {
          console.log("❌ Refresh échoué ou timeout → logout immédiat");
          logoutAndRedirect();
        }

        return;
      }



      console.log("✅ Access + refresh token présents → OK");
      dispatch(setTokens({ access: accessToken }));

    } catch (err) {
      console.error("Erreur initAuth:", err);
      logoutAndRedirect();
    }
  };

  initAuth();
}, [dispatch, navigate]);

  return children;
}

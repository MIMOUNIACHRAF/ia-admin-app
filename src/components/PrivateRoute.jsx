import { Navigate, Outlet, useNavigate } from "react-router-dom";
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
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log("Cookies actuels :", document.cookie);

        const refreshExists = await isRefreshTokenPresent();
        if (!refreshExists) {
          console.warn("Refresh token absent. Déconnexion forcée.");
          await authService.logout();
          setShouldRedirect(true); // 🔹 déclenche la redirection
          return;
        }

        let token = accessToken || authService.getAccessToken();
        if (token) {
          dispatch(setTokens({ access: token }));
          setIsTokenValid(true);
        } else {
          const newAccess = await authService.refreshAccessToken();
          if (newAccess) {
            dispatch(setTokens({ access: newAccess }));
            setIsTokenValid(true);
          } else {
            await authService.logout();
            setShouldRedirect(true);
          }
        }
      } catch (err) {
        console.error("Erreur auth:", err);
        await authService.logout();
        setShouldRedirect(true);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  if (shouldRedirect) return <Navigate to="/login/" replace />;

  return isTokenValid ? <Outlet /> : null;
}

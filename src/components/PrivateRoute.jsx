import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated, selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";
import { isRefreshTokenPresent } from "../utils/authUtils"; 
// fonction que tu as ajoutée ok
export default function PrivateRoute() {
  const isAuthenticated_ = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Vérifier access token
        let token = accessToken || authService.getAccessToken();

        if (token) {
          dispatch(setTokens({ access: token }));
          setIsTokenValid(true);
        } else {
          // Si pas de token, vérifier refresh token
          const refreshExists = await isRefreshTokenPresent();
          if (!refreshExists) {
            // Logout direct si refresh token absent
            await authService.logout();
            setIsTokenValid(false);
          } else {
            // Sinon, tenter de refresh l'access token
            const newAccess = await authService.refreshAccessToken();
            if (newAccess) {
              dispatch(setTokens({ access: newAccess }));
              setIsTokenValid(true);
            } else {
              await authService.logout();
              setIsTokenValid(false);
            }
          }
        }

        setIsCheckingAuth(false);
      } catch (err) {
        console.error("Erreur auth:", err);
        await authService.logout();
        setIsTokenValid(false);
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, [accessToken, dispatch]);

  // Redirection automatique si pas de token
  useEffect(() => {
    if (!isCheckingAuth && !isTokenValid) {
      navigate('/login', { replace: true });
    }
  }, [isCheckingAuth, isTokenValid, navigate]);

  if (isCheckingAuth) return <div>Loading...</div>;

  return isTokenValid ? <Outlet /> : null;
}

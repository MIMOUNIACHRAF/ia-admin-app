import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectAccessToken, selectIsAuthenticated } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { setTokens } from "../features/auth/authSlice";
import { isRefreshTokenPresent } from "../utils/authUtils";

export default function PrivateRoute() {
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token = accessToken || authService.getAccessToken();

        if (token) {
          dispatch(setTokens({ access: token }));
        } else {
          const refreshExists = await isRefreshTokenPresent();

          if (!refreshExists) {
            await authService.logout();
            navigate("/login", { replace: true });
            return;
          }

          const newAccess = await authService.refreshAccessToken();
          if (!newAccess) {
            await authService.logout();
            navigate("/login", { replace: true });
            return;
          }

          dispatch(setTokens({ access: newAccess }));
        }
      } catch (err) {
        await authService.logout();
        navigate("/login", { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [accessToken, dispatch, navigate]);

  // 🔹 NE RIEN AFFICHER tant que la vérification n'est pas terminée
  if (isCheckingAuth) return (
    <div className="w-full h-screen flex justify-center items-center">
      <p>Vérification de la session...</p>
    </div>
  );

  // 🔹 Si l'utilisateur n’est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return <Outlet />;
}

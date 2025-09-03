import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "./services/authService";
import { setTokens } from "./features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function AppInitializer({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const initAuth = async () => {
      const access = authService.getAccessToken();
      const refreshExists = authService.isRefreshTokenPresent();

      console.log("Access token présent ?", !!access);
      console.log("Refresh token présent ?", refreshExists);

      // Si refresh token absent → supprimer tout et rediriger
      if (!refreshExists) {
        authService.clearAccessToken();
        authService.clearRefreshToken();
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      // Si refresh token présent → tenter refresh uniquement si access absent
      if (!access && refreshExists) {
        const newAccess = await authService.refreshAccessToken();
        if (newAccess) {
          dispatch(setTokens({ access: newAccess }));
        } else {
          authService.clearAccessToken();
          authService.clearRefreshToken();
          localStorage.clear();
          navigate("/login", { replace: true });
        }
        return;
      }

      // Si access et refresh présents → OK
      if (access && refreshExists) {
        dispatch(setTokens({ access }));
        return;
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  return children;
}

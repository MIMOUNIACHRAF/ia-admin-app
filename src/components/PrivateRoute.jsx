// src/routes/PrivateRoute.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { useEffect, useState } from "react";

/**
 * PrivateRoute : garde l'accès si token est valide
 * - utilise authService.refreshAccessToken si nécessaire
 * - simplifié : relies sur isValid after refresh attempt
 */

export function PrivateRoute() {
  const reduxAccess = useSelector(selectAccessToken);
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const token = reduxAccess || authService.getAccessToken();
        if (token) {
          if (mounted) setIsValid(true);
        } else {
          // try refresh once
          const newAccess = await authService.refreshAccessToken(() => {
            // callback: redirect handled in AppInitializer/global logout
          });
          if (newAccess && mounted) setIsValid(true);
        }
      } catch {
        if (mounted) setIsValid(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [reduxAccess]);

  if (checking) return <div>Loading...</div>;
  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicRoute() {
  const reduxAccess = useSelector(selectAccessToken);
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const token = reduxAccess || authService.getAccessToken();
        if (token) {
          if (mounted) setIsValid(true);
        } else {
          const newAccess = await authService.refreshAccessToken(() => {});
          if (newAccess && mounted) setIsValid(true);
        }
      } catch {
        if (mounted) setIsValid(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [reduxAccess]);

  if (checking) return <div>Loading...</div>;
  return isValid ? <Navigate to="/" replace /> : <Outlet />;
}

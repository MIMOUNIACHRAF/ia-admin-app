// src/routes/PrivateRoute.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { useEffect, useState } from "react";

/**
 * PageLoading : écran de chargement centralisé
 */
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-t-indigo-500 border-r-gray-200" />
        <p className="mt-4 text-gray-700 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

/**
 * PrivateRoute : garde l'accès si token valide
 * - vérifie access token en mémoire ou Redux
 * - tente un refresh unique si absent
 * - redirige vers /login si échec
 */
export function PrivateRoute() {
  const reduxAccess = useSelector(selectAccessToken);
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const token = reduxAccess || authService.getAccessToken();
        if (token) {
          if (mounted) setIsValid(true);
          return;
        }

        // Single-flight refresh
        const newAccess = await authService.refreshAccessToken();
        if (newAccess && mounted) setIsValid(true);
        else if (mounted) setIsValid(false);
      } catch {
        if (mounted) setIsValid(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [reduxAccess]);

  if (checking) return <PageLoading />;
  return isValid ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * PublicRoute : redirige les utilisateurs connectés vers la home
 * - sinon affiche les routes publiques (login, signup, etc.)
 */
export function PublicRoute() {
  const reduxAccess = useSelector(selectAccessToken);
  const [checking, setChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      try {
        const token = reduxAccess || authService.getAccessToken();
        if (token) {
          if (mounted) setIsValid(true);
          return;
        }

        const newAccess = await authService.refreshAccessToken();
        if (newAccess && mounted) setIsValid(true);
        else if (mounted) setIsValid(false);
      } catch {
        if (mounted) setIsValid(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [reduxAccess]);

  if (checking) return <PageLoading />;
  return isValid ? <Navigate to="/" replace /> : <Outlet />;
}

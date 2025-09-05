// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/authThunks";
import { clearError } from "../features/auth/authSlice";
import {
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";
import authService from "../services/authService";

/**
 * Login page
 * - Bloque temporairement le refresh automatique lors de la soumission
 * - Validation simple côté client
 * - Affiche erreurs backend + frontend
 */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const isLoading = useSelector(selectAuthLoading);
  const backendError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Bloque refresh automatique sur login
  useEffect(() => {
    authService.setSkipAutoRefresh?.(true);
    dispatch(clearError());
  }, [dispatch]);

  // Redirige si déjà authentifié
  useEffect(() => {
    if (!isAuthenticated) return;
    authService.setSkipAutoRefresh?.(false);
    navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  // --- Validation formulaire ---
  const validateForm = () => {
    if (!email.trim()) {
      setFormError("L'email est requis");
      return false;
    }
    if (!password) {
      setFormError("Le mot de passe est requis");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Format d'email invalide");
      return false;
    }
    setFormError("");
    return true;
  };

  // --- Soumission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(login({ email, password })).unwrap();
      // la redirection est gérée dans useEffect(isAuthenticated)
    } catch (err) {
      setFormError(err?.message || "Erreur lors de la connexion");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Affichage des erreurs */}
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          {backendError && <p className="text-red-500 text-sm">{backendError}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

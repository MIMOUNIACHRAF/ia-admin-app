import React, { useState, useEffect, useCallback, useRef } from "react";
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

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = useSelector(selectAuthLoading);
  const backendError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Charger dernier email depuis localStorage
  useEffect(() => {
    const lastEmail = localStorage.getItem("lastEmail") || "";
    if (lastEmail) setEmail(lastEmail);
  }, []);

  // Bloquer refresh automatique sur login
  useEffect(() => {
    authService.setSkipAutoRefresh?.(true);
    dispatch(clearError());
  }, [dispatch]);

  // Redirection si déjà authentifié
  useEffect(() => {
    if (!isAuthenticated) return;
    authService.setSkipAutoRefresh?.(false);
    navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  // Focus automatique sur l'input erroné
  useEffect(() => {
    if (!formError) return;
    if (formError.toLowerCase().includes("email")) emailRef.current?.focus();
    else if (formError.toLowerCase().includes("mot de passe")) passwordRef.current?.focus();
  }, [formError]);

  const validateForm = useCallback(() => {
    if (!email.trim()) return setFormError("L'email est requis"), false;
    if (!password) return setFormError("Le mot de passe est requis"), false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setFormError("Format d'email invalide"), false;
    setFormError("");
    return true;
  }, [email, password]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        setIsSubmitting(true);
        const result = await dispatch(login({ email, password })).unwrap();
        
        // succès : sauvegarder email et reset erreur
        localStorage.setItem("lastEmail", email);
        setFormError("");
      } catch (err) {
        // --- Gestion détaillée des erreurs ---
        if (err.response) {
          // Erreur venant du backend
          const status = err.response.status;
          const data = err.response.data;

          if (status === 401) {
            // Login invalide
            setFormError("❌ Email ou mot de passe incorrect");
          } else if (data?.detail) {
            // Autre message backend
            setFormError(`⚠️ ${data.detail}`);
          } else {
            setFormError("⚠️ Erreur lors de la connexion");
          }
        } else if (err.message) {
          // Erreur JS / réseau
          setFormError(`⚠️ ${err.message}`);
        } else {
          setFormError("⚠️ Erreur lors de la connexion");
        }
      } finally {
        setIsSubmitting(false);
      }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                ref={emailRef}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email"
                aria-invalid={!!formError}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                ref={passwordRef}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Mot de passe"
                aria-invalid={!!formError}
              />
            </div>
          </div>

          {(formError || backendError) && (
            <div className="text-red-500 text-sm mt-2" role="alert">
              {formError || backendError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white
              ${isLoading || isSubmitting ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {(isLoading || isSubmitting) && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {(isLoading || isSubmitting) ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

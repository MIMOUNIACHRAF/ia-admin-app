import authService from '../services/authService';

/**
 * Vérifie si le refresh token existe dans document.cookie
 * @returns {boolean} true si le refresh token existe, false sinon
 */
export function isRefreshTokenPresent() {
  // ⚡ Affiche tous les cookies pour debug
  console.log("Cookies actuels :", document.cookie);

  // Vérifie si le cookie refresh_token est présent
  const cookieExists = document.cookie
    .split(';')
    .some(c => c.trim().startsWith('refresh_token='));

  if (!cookieExists) {
    console.warn("Refresh token absent. Déconnexion forcée.");
    authService.logout(); // vide tous les tokens, localStorage, etc.
  }

  console.log("Refresh token présent ?", cookieExists);


  return cookieExists;
}

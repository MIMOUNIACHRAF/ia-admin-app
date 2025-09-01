// src/utils/authUtils.js
/**
 * Vérifie si le refresh token existe dans document.cookie
 * @returns {boolean} true si le refresh token existe, false sinon
 */
export function isRefreshTokenPresent() {
  console.log("Cookies actuels 1:", document.cookie);
  const cookieExists = document.cookie
    .split(';')
    .some(c => c.trim().startsWith('refresh_token='));
  console.log("Refresh token présent ?", cookieExists);
  return cookieExists;
}

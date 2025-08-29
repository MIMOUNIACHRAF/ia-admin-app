import api from '../api/axiosInstance';

/**
 * Vérifie si le refresh token existe
 * @returns {Promise<boolean>} true si le refresh token existe ou est valide, false sinon
 */
export async function isRefreshTokenPresent() {
  // Vérifier si le cookie est présent (si non HttpOnly)
  const cookieExists = document.cookie
    .split(';')
    .some(c => c.trim().startsWith('refresh_token='));

  if (cookieExists) return true;

  // Si cookie HttpOnly ou supprimé, tester via backend
  try {
    await api.post('/auth/refresh', {}, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

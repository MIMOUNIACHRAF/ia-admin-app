import jwtDecode from "jwt-decode";

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is expired or about to expire (within 5 minutes)
    return decoded.exp < currentTime || decoded.exp - currentTime < 300;
  } catch (error) {
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp;
  } catch (error) {
    return null;
  }
};
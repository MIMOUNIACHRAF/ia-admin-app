import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { selectIsAuthenticated, selectAccessToken } from "../features/auth/authSelectors";
import authService from "../services/authService";
import { jwtDecode } from "jwt-decode";
import { setTokens } from "../features/auth/authSlice";

export default function PrivateRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const dispatch = useDispatch();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        // If not authenticated according to Redux, check localStorage
        if (!isAuthenticated) {
          const tokens = authService.getTokens();
          
          // If tokens exist in localStorage but not in Redux, set them in Redux
          if (tokens.access && tokens.refresh) {
            dispatch(setTokens(tokens));
            // We'll validate the token in the next effect run
            setIsCheckingAuth(false);
            return;
          }
        }
        
        // If we have an access token, check if it's valid
        if (accessToken) {
          try {
            const decoded = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;
            
            // If token is not expired, it's valid
            if (decoded.exp > currentTime) {
              setIsTokenValid(true);
              setIsCheckingAuth(false);
              return;
            }
            
            // If token is expired, try to refresh it
            const tokens = authService.getTokens();
            if (tokens.refresh) {
              const response = await authService.refreshToken(tokens.refresh);
              
              if (response && (response.access || (response.tokens && response.tokens.access))) {
                // Update Redux store with new tokens
                dispatch(setTokens({
                  access: response.access || (response.tokens && response.tokens.access),
                  refresh: response.refresh || (response.tokens && response.tokens.refresh) || tokens.refresh
                }));
                
                setIsTokenValid(true);
              } else {
                setIsTokenValid(false);
              }
            } else {
              setIsTokenValid(false);
            }
          } catch (error) {
            // If token is invalid (can't be decoded), it's not valid
            setIsTokenValid(false);
          }
        } else {
          setIsTokenValid(false);
        }
        
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsTokenValid(false);
        setIsCheckingAuth(false);
      }
    };
    
    checkTokenValidity();
  }, [isAuthenticated, accessToken, dispatch]);
  
  // Show loading or spinner while checking authentication
  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }
  
  // If authenticated and token is valid, render the protected route
  // Otherwise, redirect to login
  return (isAuthenticated && isTokenValid) ? <Outlet /> : <Navigate to="/login" replace />;
}

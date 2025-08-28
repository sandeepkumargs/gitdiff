import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../pages/services/service";

interface DecodedToken {
  exp: number;
}

export const useAuth = () => {
  const navigate = useNavigate();

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Treat invalid token as expired
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("access_token");
    return token ? !isTokenExpired(token) : false;
  });

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      // Clear local storage if no refresh token is available
      localStorage.clear();
      setIsAuthenticated(false); // Update the authentication state
      navigate("/login"); // Redirect to login
      window.location.reload(); 
      return null;
    }
    // Your logic for refreshing the access token goes here
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setIsAuthenticated(false);
      } else if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        setIsAuthenticated(!!newToken);
      } else {
        setIsAuthenticated(true);
      }
    };

    verifyToken();
  }, []);

  const logout = async () => {
    await userLogout();
    localStorage.clear(); // Clear all items from local storage
    setIsAuthenticated(false); // Update the authentication state
    navigate("/login"); // Redirect to login
  };

  return { isAuthenticated, logout };
};

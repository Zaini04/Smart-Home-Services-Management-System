import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logout } from "../api/authorEndPoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read local storage instantly on first load
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });

  const loginUser = (userData, jwt) => {
    setUser(userData);
    setAccessToken(jwt);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", jwt);
  };

  const logoutUser = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Backend logout failed", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  }, []);

  // Listen for forced logout events dispatched by the API interceptor
  // when a token refresh fails. This avoids window.location.href hard reloads.
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setAccessToken(null);
      // localStorage already cleared by the interceptor before dispatching
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
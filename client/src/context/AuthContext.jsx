import { createContext, useContext, useState } from "react";
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

  const logoutUser = async () => {
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
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
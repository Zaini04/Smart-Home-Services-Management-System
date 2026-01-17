import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); 

  // load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("accessToken");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }

    setLoading(false);
  }, []);

  const loginUser = (userData, jwt) => {
    setUser(userData);
    setAccessToken(jwt);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", jwt);
  };

  const logoutUser = () => {
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loginUser,
        logoutUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

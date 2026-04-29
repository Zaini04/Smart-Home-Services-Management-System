import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutApi } from '../api/authEndPoints';
import { getSecureItem, setSecureItem, removeSecureItem } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      
      // Promise.race to prevent SecureStore from hanging the entire app indefinitely
      const savedToken = await Promise.race([
        getSecureItem('accessToken'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SecureStore timeout')), 3000))
      ]);

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
      }
    } catch (err) {
      console.warn('Failed to load auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (userData, jwt) => {
    setLoginInProgress(true);
    setUser(userData);
    setAccessToken(jwt);

    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await setSecureItem('accessToken', jwt);
  };

  const completeLoginTransition = () => {
    setLoginInProgress(false);
  };

  const logoutUser = async () => {
    if (logoutInProgress) return;
    setLogoutInProgress(true);
    // Clear local auth state first so UI can redirect immediately.
    setUser(null);
    setAccessToken(null);
    await AsyncStorage.removeItem('user');
    await removeSecureItem('accessToken');

    // Notify backend in background; don't block UI navigation on this call.
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setLogoutInProgress(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loginUser,
        logoutUser,
        logoutInProgress,
        loginInProgress,
        completeLoginTransition,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';
import { BASE_URL } from '../api/apiInstance';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, accessToken } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) return;

    socketRef.current = io(BASE_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketRef.current.on('notification', (data) => {
      Toast.hide();
      Toast.show({
        type: 'info',
        text1: data.title || 'Notification',
        text2: data.message || '',
        position: 'top',
        visibilityTime: 2800,
        autoHide: true,
        topOffset: 58,
        onPress: () => Toast.hide(),
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, accessToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

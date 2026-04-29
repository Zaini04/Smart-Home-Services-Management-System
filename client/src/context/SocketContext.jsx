// context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getApiBaseUrl } from "../utils/url";
import { getUnreadCount } from "../api/chatEndPoints";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, accessToken } = useAuth();     // token from your auth context
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (!user || !accessToken) return;

    // Connect to socket server
    socketRef.current = io(apiBaseUrl, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, accessToken, apiBaseUrl]);

  useEffect(() => {
    if (!user || !accessToken) return;

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
    };
  }, [user, accessToken]);

  const fetchUnread = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadMessages(res.data.data?.count || 0);
    } catch (err) {
      console.error("SocketContext: Failed to fetch unread count:", err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, unreadMessages, setUnreadMessages, fetchUnread }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
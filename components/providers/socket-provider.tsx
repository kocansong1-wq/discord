"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  latency: number | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  latency: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    // Sử dụng polling trước, sau đó upgrade lên websocket
    // Điều này giúp tránh lỗi WebSocket trong Next.js dev mode
    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_BASE_URL!, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Polling first, then upgrade to websocket
      transports: ["polling", "websocket"],
      upgrade: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", () => {
      // Silent error handling
    });

    socketInstance.on("reconnect", () => {
      // Reconnected
    });

    setSocket(socketInstance);

    // Ping check interval - less frequent
    const interval = setInterval(() => {
      if (socketInstance.connected) {
        const start = Date.now();
        socketInstance.emit("ping-check", () => {
          const duration = Date.now() - start;
          setLatency(duration);
        });
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, latency }}>
      {children}
    </SocketContext.Provider>
  );
};
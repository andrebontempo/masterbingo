"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

let socketInstance = null; // Declare socketInstance outside to maintain a single instance

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!socketInstance) {
      const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      socketInstance = io(backendUrl); // Corrected syntax and assigned to socketInstance
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setSocket(socketInstance); // Set the state with the (newly created or existing) socketInstance
    
    return () => {
      // If you want to close the socket when the component unmounts,
      // you might need a more sophisticated singleton management or
      // only close if this is the last consumer.
      // For now, we'll keep it open as a singleton.
      // If the intent was to close it on unmount, the singleton pattern might need adjustment.
      // For a simple singleton, we typically don't close it here.
      // If the original intent was to close the *specific* socket created by *this* effect,
      // then the singleton pattern conflicts.
      // Let's assume the user wants a singleton that persists.
      // If the original `return () => newSocket.close();` was important,
      // then `socketInstance` should be managed differently or closed only when the app shuts down.
      // For now, removing the close on unmount for a persistent singleton.
      // If the user wants to close it, they need to explicitly manage `socketInstance.close()` elsewhere.
    };
  }, []); // Empty dependency array ensures this runs once

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

"use client";
import { SocketProvider } from "./context/SocketContext";

export function Providers({ children }) {
  return <SocketProvider>{children}</SocketProvider>;
}

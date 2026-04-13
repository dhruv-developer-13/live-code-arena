import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || socket.disconnected) {
    // Always get fresh token
    const token = localStorage.getItem("token");
    
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    
    socket = io("http://localhost:3000", {
      auth: { token: token || undefined },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on("connect", () => {
      console.log("[socket] Connected, socket id:", socket?.id);
    });
    
    socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected:", reason);
    });
    
    socket.on("connect_error", (err) => {
      console.error("[socket] Connection error:", err.message);
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    console.log("[socket] Connecting...");
    s.connect();
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
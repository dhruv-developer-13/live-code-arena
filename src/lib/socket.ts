import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  const token = localStorage.getItem("token");
  console.log("[socket] Initializing with token:", token ? token.substring(0, 20) + "..." : "none");
  
  if (!socket) {
    socket = io("http://localhost:3000", {
      auth: { token: token || undefined },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on("connect", () => {
      console.log("[socket] Connected to server, socket id:", socket?.id);
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

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
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
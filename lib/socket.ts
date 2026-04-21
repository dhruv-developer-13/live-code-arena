import { io, Socket } from "socket.io-client"

const socket: Socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3000", {
  autoConnect: true
})

export default socket

import { io } from "socket.io-client";

let socket = null;

export const connectSocketWithAuth = (authToken, refreshToken) => {
  socket = io(process.env.REACT_APP_API_URL, {
    autoConnect: true,
    auth: {
      token: authToken,
      refreshToken,
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => socket;

// ✅ NEW: export actual socket instance too
export { socket };

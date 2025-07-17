import { io } from "socket.io-client";

let socket = null;

export const connectSocketWithAuth = (authToken, refreshToken, email) => {
  socket = io(process.env.REACT_APP_API_URL, {
    autoConnect: true,
    auth: {
      token: authToken,
      refreshToken,
    },
  });

  socket.on("connect", () => {
    socket.emit("register_user");
    console.log("✅ Socket connected:", socket.id);
    // console.log(authToken, refreshToken, email, "CHECKKKKKKK");

    // socket.emit("login-check", email);
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

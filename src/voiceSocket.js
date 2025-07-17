// src/voiceSocket.js
import { io } from "socket.io-client";

let voiceSocket = null;

export const connectVoiceSocket = (accessToken, user_id) => {
  if (voiceSocket && voiceSocket.connected) {
    console.warn("⚠️ Voice socket already connected");
    return voiceSocket;
  }
  // Always disconnect old socket if exists
  if (voiceSocket) {
    voiceSocket.disconnect();
    voiceSocket = null;
  }
  // console.log("🔍 Connecting voice socket to:OUT SIDE", accessToken);
  if (accessToken) {
    const socketUrl = process.env.REACT_APP_CALL_URL1;
    // console.log("🔍 Connecting voice socket to1:", socketUrl);
    voiceSocket = io(socketUrl, {
      autoConnect: true,
      // transports: ["websocket"],
      auth: { token: accessToken },

      timeout: 20000, // 10 seconds timeout for connection attempt
      reconnectionAttempts: 2, // Retry 5 times
      reconnectionDelay: 2000, // 2 seconds delay between retries
    });
    // console.log(voiceSocket, "CHJECK ===================");

    voiceSocket.on("connect", () => {
      // voiceSocket.emit("register-user", user_id);
      // console.log("🎙️ Voice socket connected:", voiceSocket.id);
      voiceSocket.emit("register-user", Number(user_id));
      // console.log("📌 Registered user after reconnect:", user_id);
    });

    voiceSocket.on("connect_error", (err) => {
      console.error("❌ Voice socket connection error:", err);
    });

    voiceSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Voice socket disconnected:", reason);
    });

    return voiceSocket;
  }
};

export const getVoiceSocket = () => voiceSocket;
export { voiceSocket };

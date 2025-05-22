// src/voiceSocket.js
import { io } from "socket.io-client";

let voiceSocket = null;

export const connectVoiceSocket = (authToken) => {
  if (!voiceSocket) {
    const socketUrl = process.env.REACT_APP_CALL_URL1;
    console.log("🔍 Connecting voice socket to:", socketUrl);
    voiceSocket = io(socketUrl, {
      autoConnect: true,
      auth: { token: authToken },
      timeout: 20000, // 10 seconds timeout for connection attempt
      reconnectionAttempts: 2, // Retry 5 times
      reconnectionDelay: 2000, // 2 seconds delay between retries
    });

    voiceSocket.on("connect", () => {
      console.log("🎙️ Voice socket connected:", voiceSocket.id);
    });

    voiceSocket.on("connect_error", (err) => {
      console.error("❌ Voice socket connection error:", err);
    });

    voiceSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Voice socket disconnected:", reason);
    });
  }

  return voiceSocket;
};

export const getVoiceSocket = () => voiceSocket;

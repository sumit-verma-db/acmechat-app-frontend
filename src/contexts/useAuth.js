import { createContext, useContext, useState, useEffect } from "react";
import { connectSocketWithAuth, getSocket } from "../socket";
import { connectVoiceSocket, getVoiceSocket } from "../voiceSocket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken")
  );
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [userData, setUserData] = useState({
    userName: "",
    userEmail: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("authToken")
  );

  const decodeToken = (token) => {
    try {
      const base64Payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(base64Payload));
      return decodedPayload;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const socket = getSocket();
  const voiceSocket = getVoiceSocket();
  // const voiceSocket = connectVoiceSocket();
  // console.log(voiceSocket, "VOICE SOCKET");

  // 🔐 Check for token expiry
  useEffect(() => {
    if (authToken) {
      const decoded = decodeToken(authToken);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        console.warn("🔒 Token expired, logging out...");
        logout();
      }
    }
  }, [authToken]);

  // Sync token and user info
  useEffect(() => {
    if (authToken) {
      localStorage.setItem("authToken", authToken);
      const userPayload = decodeToken(authToken);
      if (userPayload) setUserData(userPayload);
    } else {
      localStorage.removeItem("authToken");
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }

    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }

    setIsAuthenticated(!!authToken);
  }, [authToken, refreshToken, userId]);

  const login = async ({ accessToken, refreshToken, user_id }) => {
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);
    setUserId(user_id);
    setIsAuthenticated(true);
    let socket = await connectSocketWithAuth(accessToken);

    socket.emit("register_user");

    console.log(user_id, "USER ID USER AUTH");
    let voiceSocket = await connectVoiceSocket(accessToken, user_id);
    console.log(voiceSocket, "LoginPAge");
    if (voiceSocket) {
      voiceSocket.on("connect", () => {
        console.log("🎙️ Voice socket connected:", voiceSocket.id);
        voiceSocket.emit("register-user", user_id);
      });
    }
    // ✅ Wait for voiceSocket to be connected BEFORE registering
  };

  const logout = () => {
    setAuthToken(null);
    setRefreshToken(null);
    setUserId(null);
    setIsAuthenticated(false);

    localStorage.clear();

    try {
      socket?.disconnect();
      const voiceSocket = getVoiceSocket();
      if (voiceSocket?.connected) {
        voiceSocket.disconnect();
        console.log("🎙️ Voice socket disconnected on logout");
      }
    } catch (err) {
      console.warn("Socket disconnect error:", err);
    }

    // window.location.href = "/auth/login"; // ✅ force redirect to login
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        userData,
        refreshToken,
        userId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

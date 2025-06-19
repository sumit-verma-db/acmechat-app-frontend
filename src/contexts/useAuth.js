import { createContext, useContext, useState, useEffect } from "react";
import { connectSocketWithAuth, getSocket } from "../socket"; // ?
import { connectVoiceSocket } from "../voiceSocket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [userData, setUserData] = useState({
    userName: "",
    userEmail: "",
  });
  // console.log(userData, "USERADATA");
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken")
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

  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("authToken")
  );

  // Sync tokens and user info to localStorage
  useEffect(() => {
    if (authToken) localStorage.setItem("authToken", authToken);
    else localStorage.removeItem("authToken");
    const userPayload = decodeToken(authToken);
    setUserData(userPayload);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");

    if (userId) localStorage.setItem("userId", userId);
    else localStorage.removeItem("userId");

    setIsAuthenticated(!!authToken);
  }, [authToken, refreshToken, userId]);
  const socket = getSocket();
  // Function to handle login (called after login API success)
  const login = ({ accessToken, refreshToken, user_id }) => {
    setAuthToken(accessToken);
    setRefreshToken(refreshToken);
    setUserId(user_id);
    setIsAuthenticated(true);
    // const socketInstance = connectSocketWithAuth(accessToken, refreshToken);
    // socketInstance.emit("register_user");
    // connectSocketWithAuth(); // ? connect socket
    socket.emit("register_user"); // ? mark user online
    // ✅ Connect the voice socket explicitly
    const voiceSocket = connectVoiceSocket(accessToken);
    console.log(voiceSocket, "voicesocket");
    if (voiceSocket) {
      console.log("🎙️ Voice socket connected at login:", voiceSocket.id);
    }

    // console.log("?? Emitted 'register_user' with user_id:", user_id);
  };

  // Function to handle logout
  const logout = () => {
    setAuthToken(null);
    setRefreshToken(null);
    setUserId(null);
    setIsAuthenticated(false);

    localStorage.clear();
    socket.disconnect(); // ? clean socket
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

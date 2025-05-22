import { createContext, useContext, useState, useEffect } from "react";
import { connectSocketWithAuth, getSocket } from "../socket"; // ?

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("authToken")
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken")
  );
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("authToken")
  );

  // Sync tokens and user info to localStorage
  useEffect(() => {
    if (authToken) localStorage.setItem("authToken", authToken);
    else localStorage.removeItem("authToken");

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
    const socketInstance = connectSocketWithAuth(accessToken, refreshToken); // ? tokens passed
    socketInstance.emit("register_user"); // ? use returned socket
    // connectSocketWithAuth(); // ? connect socket
    socket.emit("register_user"); // ? mark user online
    console.log("?? Emitted 'register_user' with user_id:", user_id);
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

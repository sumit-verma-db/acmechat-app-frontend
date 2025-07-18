// import React, { createContext, useContext, useEffect, useState } from "react";

// import { useAuth } from "./useAuth";
// import { connectSocketWithAuth, getSocket } from "../socket";
// import { useChat } from "./ChatContext";
// import { useLocation } from "react-router-dom";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const location = useLocation();
//   console.log(location.pathname, "LOCATOP----");

//   const { authToken, refreshToken, userId } = useAuth();
//   const {
//     setChatData,
//     selectedUser,
//     setChatList,
//     onlineUsers,
//     setOnlineUsers,
//   } = useChat();

//   const currentUserId = parseInt(localStorage.getItem("userId"));
//   useEffect(() => {
//     if (!authToken || !refreshToken) return;

//     // ?? Connect with auth
//     const socket = connectSocketWithAuth(authToken, refreshToken);
//     // Register self
//     // socket.emit("register_user");
//     socket.on("connect", () => {
//       console.log("? Socket connected. Now registering user...");
//       socket.emit("register_user");
//     });
//     console.log("?? Registering socket for user:", userId);

//     // Listen for presence updates
//     socket.on("user_online", ({ userId }) => {
//       console.log("?? User online:", userId);
//       setOnlineUsers((prev) => new Set([...prev, userId]));
//     });

//     socket.on("user_offline", ({ userId }) => {
//       console.log("?? User offline:", userId);
//       setOnlineUsers((prev) => {
//         const updated = new Set(prev);
//         updated.delete(userId);
//         return updated;
//       });
//     });

//     return () => {
//       socket.disconnect();
//       console.log("?? Socket disconnected (on unmount)");
//     };
//   }, [authToken, refreshToken, userId]);
//   // Utility: Join a chat room
//   const sock = getSocket();
//   const joinRoom = (otherUserId) => {
//     // ? Get actual socket object
//     if (!sock || !userId || !otherUserId) return;

//     const roomId = [userId, otherUserId].sort((a, b) => a - b).join("-");
//     sock.emit("join_room", roomId); // ? Emit correctly
//     console.log(`?? Joined room: ${roomId}`);
//     return roomId;
//   };
//   const sendMessage = (message) => {
//     sock.emit("send_message", message); // ? Emit correctly
//   };
//   useEffect(() => {
//     const sock = getSocket();
//     if (!currentUserId) return;

//     // Request recent chats
//     sock.emit("get_recent_chats", currentUserId);

//     // Listen for response
//     sock.on("recent_chats", (chats) => {
//       console.log(chats, "recent_chats");
//       setChatList(chats);
//     });

//     // Refresh recent chats if new message sent/received
//     sock.on("refresh_recent", ({ sender_id, receiver_id }) => {
//       if (sender_id === currentUserId || receiver_id === currentUserId) {
//         sock.emit("get_recent_chats", currentUserId);
//       }
//     });

//     // Get list of online users
//     sock.emit("get_online_users");

//     sock.on("online_users", (ids) => {
//       console.log("Online Users:", ids);
//       setOnlineUsers(ids);

//       if (selectedUser) {
//         const isOnline = ids.includes(selectedUser.user_id);
//         console.log(
//           `Selected user (${selectedUser.user_id}) is ${
//             isOnline ? "online" : "offline"
//           }`
//         );
//       }
//     });

//     sock.on("user_online", ({ userId }) => {
//       console.log(`User ${userId} just came online`);
//       setOnlineUsers((prev) => [...prev, userId]);
//     });

//     sock.on("user_offline", ({ userId }) => {
//       console.log(`User ${userId} went offline`);
//       setOnlineUsers((prev) => prev.filter((id) => id !== userId));
//     });

//     return () => {
//       sock.off("recent_chats");
//       sock.off("refresh_recent");
//       sock.off("online_users");
//       sock.off("user_online");
//       sock.off("user_offline");
//     };
//   }, [currentUserId, selectedUser, location.pathname === "/app"]);
//   useEffect(() => {
//     const sock = getSocket();
//     const handleDeliveredUpdate = ({ message_id }) => {
//       console.log("? delivered_update received:", message_id);
//       setChatData((prev) =>
//         prev.map((msg) =>
//           msg.message_id === message_id ? { ...msg, delivered: true } : msg
//         )
//       );
//     };
//     const handleReceiveMessage = (message) => {
//       console.log("?? New message received:", message);
//       const currentUserId = parseInt(localStorage.getItem("userId"));

//       // Format into frontend shape
//       const formatted = {
//         id: message.message_id,
//         message_id: message.message_id,
//         delivered: message.delivered,
//         type: "msg",
//         subtype: "text",
//         message: message.message,
//         sender: message.sender_id,
//         receiver: message.receiver_id,
//         sent_at: message.sent_at,
//         fromMe: message.sender_id === currentUserId, // ? Or compare with userId to flip
//         seen: message.seen,
//       };
//       setChatData((prev) => [...prev, formatted]);
//       // ? Emit mark_seen ONLY if this message is to you AND the sender is current chat
//       console.log("✅ Emitting mark_seen for message:", message.message_id);
//       const isForMe = message.receiver_id == currentUserId;

//       const isCurrentChat =
//         selectedUser && message.sender_id == selectedUser.user_id;
//       console.log(
//         "isForMe:",
//         isForMe,
//         "isCurrentChat:",
//         isCurrentChat,
//         "send-id",
//         message.sender_id,
//         " selectedUser-id",
//         selectedUser?.user_id,

//         "delivered:",
//         message.delivered
//       );
//       if (isCurrentChat && message.delivered) {
//         sock.emit("mark_seen", {
//           sender_id: message.sender_id,
//           receiver_id: message.receiver_id,
//         });
//         console.log("??? mark_seen emitted for message:", message.message_id);
//       }
//       // Only update if message is for the currently selected user
//       // const isCurrentRoom =
//       //   selectedUser &&
//       //   [message.sender_id, message.receiver_id].includes(selectedUser.user_id);
//       // console.log(isCurrentRoom, "CURRENTROOOM");

//       // if (isCurrentRoom) {
//       //   setChatData((prev) => [...prev, formatted]);
//       // }

//       // You could also emit mark_seen here if needed
//     };
//     const handleSeenUpdate = ({ message_id }) => {
//       setChatData((prevData) =>
//         prevData.map((msg) =>
//           msg.message_id === message_id ? { ...msg, seen: true } : msg
//         )
//       );
//     };
//     if (sock) {
//       sock.on("delivered_update", handleDeliveredUpdate);
//     }

//     if (sock) {
//       sock.on("receive_message", handleReceiveMessage);
//     }
//     if (sock) {
//       sock.on("mark_seen", handleSeenUpdate);
//     }
//     return () => {
//       if (sock) {
//         sock.off("delivered_update", handleDeliveredUpdate);
//       }
//       if (sock) {
//         sock.off("receive_message", handleReceiveMessage);
//       }
//       if (sock) {
//         sock.off("mark_seen", handleSeenUpdate);
//       }
//     };
//   }, []);

//   return (
//     <SocketContext.Provider
//       value={{ connectSocketWithAuth, onlineUsers, joinRoom, sendMessage }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
// import React, { createContext, useContext, useEffect, useState } from "react";

// import { useAuth } from "./useAuth";
// import { connectSocketWithAuth, getSocket } from "../socket";
// import { useChat } from "./ChatContext";
// import { useLocation } from "react-router-dom";

// const SocketContext = createContext();

// export const SocketProvider = ({ children }) => {
//   const location = useLocation();
//   const { authToken, refreshToken, userId } = useAuth();
//   const {
//     setChatData,
//     selectedUser,
//     setChatList,
//     chatData,
//     onlineUsers,
//     setOnlineUsers,
//     resetSelectedUser,
//   } = useChat();

//   const currentUserId = parseInt(localStorage.getItem("userId"));
//   useEffect(() => {
//     const isOnChatPage =
//       location.pathname === "/app" || location.pathname === "/allContact";
//     if (!isOnChatPage) {
//       resetSelectedUser(); // clear user on other pages
//     }
//   }, [location.pathname]);
//   useEffect(() => {
//     if (!authToken || !refreshToken) return;

//     const socket = connectSocketWithAuth(authToken, refreshToken);
//     socket.on("connect", () => {
//       console.log("?? Socket connected. Registering user...");
//       socket.emit("register_user");
//     });

//     socket.on("user_online", ({ userId }) => {
//       setOnlineUsers((prev) => new Set([...prev, userId]));
//     });

//     socket.on("user_offline", ({ userId }) => {
//       setOnlineUsers((prev) => {
//         const updated = new Set(prev);
//         updated.delete(userId);
//         return updated;
//       });
//     });

//     return () => {
//       socket.disconnect();
//       console.log("? Socket disconnected (on unmount)");
//     };
//   }, [authToken, refreshToken, userId]);

//   const sock = getSocket();
//   const joinRoom = (otherUserId) => {
//     if (!sock || !userId || !otherUserId) return;
//     const roomId = [userId, otherUserId].sort((a, b) => a - b).join("-");
//     console.log("ROOM JOINED-----", roomId);

//     sock.emit("join_room", roomId);
//     return roomId;
//   };
//   useEffect(() => {
//     const sock = getSocket();
//     if (sock && selectedUser && userId) {
//       const roomId = [userId, selectedUser.user_id]
//         .sort((a, b) => a - b)
//         .join("-");
//       sock.emit("join_room", roomId);
//       console.log("Auto joined room on page load:", roomId);
//     }
//   }, [selectedUser, userId]);
//   const sendMessage = (message) => {
//     sock.emit("send_message", message);
//   };

//   useEffect(() => {
//     const sock = getSocket();
//     if (!currentUserId) return;

//     sock.emit("get_recent_chats", currentUserId);

//     sock.on("recent_chats", (chats) => {
//       console.log(chats, "RECENT CHATS__SOCKET");

//       setChatList(chats);
//     });

//     sock.on("refresh_recent", ({ sender_id, receiver_id }) => {
//       if (sender_id === currentUserId || receiver_id === currentUserId) {
//         sock.emit("get_recent_chats", currentUserId);
//       }
//     });

//     sock.emit("get_online_users");

//     sock.on("online_users", (ids) => {
//       setOnlineUsers(ids);
//     });

//     sock.on("user_online", ({ userId }) => {
//       setOnlineUsers((prev) => [...prev, userId]);
//     });

//     sock.on("user_offline", ({ userId }) => {
//       setOnlineUsers((prev) => prev?.filter((id) => id !== userId));
//     });

//     return () => {
//       sock.off("recent_chats");
//       sock.off("refresh_recent");
//       sock.off("online_users");
//       sock.off("user_online");
//       sock.off("user_offline");
//     };
//   }, [currentUserId, selectedUser, location.pathname === "/app"]);

//   useEffect(() => {
//     const sock = getSocket();

//     const handleDeliveredUpdate = ({ message_id }) => {
//       console.log("MESSAGE DELIVERD WITH SOCKET---->", message_id);

//       setChatData((prev) =>
//         prev.map((msg) =>
//           msg.message_id === message_id ? { ...msg, delivered: true } : msg
//         )
//       );
//     };

//     const handleReceiveMessage = (message) => {
//       console.log("?? New message received:", message);
//       const currentUserId = parseInt(localStorage.getItem("userId"));

//       const formatted = {
//         id: message.message_id,
//         message_id: message.message_id,
//         delivered: message.delivered,
//         type: "msg",
//         subtype: "text",
//         message: message.message,
//         sender: message.sender_id,
//         receiver: message.receiver_id,
//         sent_at: message.sent_at,
//         fromMe: message.sender_id === currentUserId,
//         seen: message.seen,
//       };

//       setChatData((prev) => [...prev, formatted]);
//     };

//     const handleSeenUpdate = ({ message_id }) => {
//       setChatData((prevData) =>
//         prevData.map((msg) =>
//           msg.message_id === message_id ? { ...msg, seen: true } : msg
//         )
//       );
//     };

//     if (sock) {
//       sock.on("delivered_update", handleDeliveredUpdate);
//       sock.on("receive_message", handleReceiveMessage);
//       sock.on("mark_seen", handleSeenUpdate);
//     }

//     return () => {
//       if (sock) {
//         sock.off("delivered_update", handleDeliveredUpdate);
//         sock.off("receive_message", handleReceiveMessage);
//         sock.off("mark_seen", handleSeenUpdate);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const sock = getSocket();
//     if (!selectedUser || !chatData.length || !sock) return;

//     const unseen = chatData.filter(
//       (msg) =>
//         msg.receiver === currentUserId &&
//         msg.sender === selectedUser.user_id &&
//         msg.delivered &&
//         !msg.seen
//     );

//     if (unseen.length > 0) {
//       sock.emit("mark_seen", {
//         sender_id: selectedUser.user_id,
//         receiver_id: currentUserId,
//       });
//     }
//   }, [selectedUser, chatData]);

//   return (
//     <SocketContext.Provider
//       value={{ connectSocketWithAuth, onlineUsers, joinRoom, sendMessage }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export const useSocket = () => useContext(SocketContext);
import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { connectSocketWithAuth, getSocket } from "../socket";
import { useChat } from "./ChatContext";
import { useLocation } from "react-router-dom";
import { useCall } from "./CallContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const location = useLocation();
  const { authToken, refreshToken, userId, logout, userData } = useAuth();
  const {
    setChatData,
    selectedUser,
    setChatList,
    chatData,
    onlineUsers,
    setOnlineUsers,
    resetSelectedUser,
    setGroupList,
  } = useChat();

  const currentUserId = parseInt(localStorage.getItem("userId"));
  useEffect(() => {
    const isOnChatPage =
      location.pathname === "/app" || location.pathname === "/allContact";
    // if (!isOnChatPage) {
    //   resetSelectedUser();
    // }
  }, [location.pathname]);

  useEffect(() => {
    if (!authToken || !refreshToken) return;

    const socket = connectSocketWithAuth(authToken, refreshToken);

    socket.on("connect", () => {
      let email = localStorage.getItem("email");
      // console.log(authToken, "CHECK BEFORE EMIT", email);

      socket.emit("login-check", {
        email: email,
        token: authToken,
      });
    });
    // socket.on("connect", () => {
    //   // console.log("?? Socket connected. Registering user...");
    //   socket.emit("register_user");
    // });

    // socket.on("user_online", ({ userId }) => {
    //   console.log(userId, "user_online-----------");
    //   setOnlineUsers((prev) => new Set([...prev, userId]));
    // });

    // socket.on("user_offline", ({ userId }) => {
    //   console.log(userId, "user_offline-----------");
    //   setOnlineUsers((prev) => {
    //     const updated = new Set(prev);
    //     updated.delete(userId);
    //     return updated;
    //   });
    // });

    return () => {
      socket.disconnect();
      // console.log("? Socket disconnected (on unmount)");
    };
  }, [authToken, refreshToken, userId]);

  const sock = getSocket();
  // console.log(sock, "TEST SOCKET PROVIDER");
  const joinRoom = (otherUserId) => {
    if (!sock || !userId || !otherUserId) return;
    const roomId = [userId, otherUserId].sort((a, b) => a - b).join("-");
    // console.log("ROOM JOINED-----", roomId);
    sock.emit("join_room", roomId);
    return roomId;
  };

  useEffect(() => {
    const sock = getSocket();
    if (sock && selectedUser && userId && location.pathname === "/app") {
      const roomId = [userId, selectedUser.user_id]
        .sort((a, b) => a - b)
        .join("-");
      sock.emit("join_room", roomId);
      // console.log("Auto joined room on page load:", roomId);
    }
  }, [selectedUser, userId]);

  // join Group
  useEffect(() => {
    const sock = getSocket();
    if (sock && selectedUser && userId && location.pathname === "/group") {
      const roomId = { group_id: selectedUser.group_id };
      // .sort((a, b) => a - b)
      // .join("-");
      sock.emit("join_group_room", roomId);
      // console.log("Auto joined join_group_room on page load:", roomId);
    }
  }, [selectedUser, userId]);

  const sendMessage = (message) => {
    sock.emit("send_message", message);
  };

  // Send Group Message
  const sendGroupMessage = (id, message) => {
    sock.emit("send_group_message", { group_id: id, message: message });
  };
  useEffect(() => {
    const sock = getSocket();
    if (!currentUserId) return;

    sock.emit("get_recent_chats", currentUserId);

    sock.on("recent_chats", (chats) => {
      // console.log(chats, "RECENT CHATS__SOCKET");
      setChatList(chats);
    });

    sock.on("refresh_recent", ({ sender_id, receiver_id }) => {
      // console.log(sender_id, receiver_id, "refresh_recent");

      if (sender_id === currentUserId || receiver_id === currentUserId) {
        sock.emit("get_recent_chats", currentUserId);
      }
    });

    sock.emit("get_online_users");

    sock.on("online_users", (ids) => {
      // console.log(ids, "online_users----ids");

      setOnlineUsers(ids);
    });

    sock.on("user_online", ({ userId }) => {
      console.log(userId, "user_online----ids");
      setOnlineUsers((prev) => [...prev, userId]);
    });

    // sock.on("user_offline", ({ userId }) => {
    //   setOnlineUsers((prev) => prev?.filter((id) => id !== userId));
    // });
    sock.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) =>
        Array.isArray(prev) ? prev.filter((id) => id !== userId) : []
      );
    });
    const handleLogout = () => {
      console.log("handleLogout=============");

      logout();
    };
    sock.on("force-logout", handleLogout);
    return () => {
      sock.off("recent_chats");
      sock.off("force-logout", handleLogout);
      sock.off("refresh_recent");
      sock.off("online_users");
      sock.off("user_online");
      sock.off("user_offline");
    };
  }, [currentUserId, selectedUser]);

  // get user group users
  useEffect(() => {
    const sock = getSocket();
    if (!currentUserId) return;

    // 🔁 Request group chats
    sock.emit("get_user_groups");

    // 🟢 Listener: receive group chat list
    sock.on("user_groups", (groups) => {
      // console.log("Group Chats via Socket:", groups);
      setGroupList(groups); // update state
    });

    // Optional: handle error
    sock.on("user_groups_error", (error) => {
      console.error("Error fetching group chats:", error);
    });

    // ✅ Cleanup
    return () => {
      sock.off("user_groups");
      sock.off("user_groups_error");
    };
  }, [location.pathname === "/group"]);

  useEffect(() => {
    const sock = getSocket();

    const handleDeliveredUpdate = ({ message_id }) => {
      setChatData((prev) =>
        prev.map((msg) =>
          msg.message_id === message_id ? { ...msg, delivered: true } : msg
        )
      );
    };

    const handleReceiveMessage = (message) => {
      const currentUserId = parseInt(localStorage.getItem("userId"));
      // console.log(message, "handleReceiveMessage");
      const formattedMessage = {
        ...message,
        id: message.message_id,
        message_id: message.message_id,
        message: message.message,
        sender_id: message.sender_id,
        sender: message.sender_id,
        receiver: message.receiver_id,
        sent_at: message.sent_at,
        delivered: message.delivered || false,
        seen: message.seen || false,
        fromMe: message.sender_id === currentUserId, // 👈 Always false for server messages
        type: message.type,
        subtype: "text",
        is_group: message.is_group,
        group_id: message.group_id,
      };

      // Prevent duplicates
      setChatData((prev) => {
        const exists = prev.some(
          (m) => m.message_id === formattedMessage.message_id
        );
        return exists ? prev : [...prev, formattedMessage];
      });
    };
    const handleReceiveFile = (message) => {
      const currentUserId = parseInt(localStorage.getItem("userId"));
      // console.log(message, "handleReceiveFile");
      const formattedMessage = {
        ...message,
        id: message.message_id,
        message_id: message.message_id,
        message: message.message,
        sender_id: message.sender_id,
        sender: message.sender_id,
        receiver: message.receiver_id,
        sent_at: message.sent_at,
        delivered: message.delivered || false,
        seen: message.seen || false,
        fromMe: message.sender_id === currentUserId, // 👈 Always false for server messages
        type: message.type,
        subtype: "text",
        is_group: message.is_group,
        group_id: message.group_id,
      };

      // Prevent duplicates
      setChatData((prev) => {
        const exists = prev.some((m) => m.file_id === formattedMessage.file_id);
        return exists ? prev : [...prev, formattedMessage];
      });
    };

    const handleSeenUpdate = ({ message_id }) => {
      // console.log(
      //   message_id,
      //   "handleSeenUpdate======================================================================================================================================"
      // );

      setChatData((prevData) =>
        prevData.map((msg) =>
          msg.message_id === message_id ? { ...msg, seen: true } : msg
        )
      );
    };

    const bindSocketEvents = () => {
      sock
        .off("delivered_update")
        .on("delivered_update", handleDeliveredUpdate);
      sock.off("receive_message").on("receive_message", handleReceiveMessage);
      sock.off("receive_file").on("receive_file", handleReceiveFile);
      sock.off("mark_seen").on("mark_seen", handleSeenUpdate);
    };

    if (sock) {
      bindSocketEvents();
      sock.on("connect", bindSocketEvents);
    }

    return () => {
      if (sock) {
        sock.off("connect", bindSocketEvents);
        sock.off("delivered_update", handleDeliveredUpdate);
        sock.off("receive_message", handleReceiveMessage);
        sock.off("receive_file", handleReceiveFile);
        sock.off("mark_seen", handleSeenUpdate);
      }
    };
  }, [selectedUser]);

  useEffect(() => {
    const sock = getSocket();
    if (!selectedUser || !chatData.length || !sock) return;

    const unseen = chatData.filter(
      (msg) =>
        msg.receiver === currentUserId &&
        msg.sender === selectedUser.user_id &&
        msg.delivered &&
        !msg.seen
    );

    if (unseen.length > 0) {
      sock.emit("mark_seen", {
        sender_id: selectedUser.user_id,
        receiver_id: currentUserId,
      });
    }
  }, [selectedUser, chatData]);

  return (
    <SocketContext.Provider
      value={{
        connectSocketWithAuth,
        onlineUsers,
        joinRoom,
        sendMessage,
        sendGroupMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

import React, { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { connectSocketWithAuth, getSocket } from "../socket";
import { useChat } from "./ChatContext";
import { useLocation } from "react-router-dom";
import { useCall } from "./CallContext";
import useEnhancedEffect from "@mui/material/utils/useEnhancedEffect";

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
    if (authToken && refreshToken) {
      socket = connectSocketWithAuth(authToken, refreshToken);
    }
    // console.log(socket, "SOCKET----USEEFECT------");

    // return () => {
    //   socket.disconnect();
    // };
  }, [authToken, userId]);
  var socket = getSocket();
  // console.log(socket, "GET SOCKET---");

  // const sock = getSocket();
  // console.log(sock, "TEST SOCKET PROVIDER");
  // const joinRoom = (otherUserId) => {
  //   console.log(otherUserId, "USERID JOIN ROOM ");

  //   if (!socket || !userId || !otherUserId) return;
  //   const roomId = [userId, otherUserId].sort((a, b) => a - b).join("-");
  //   // console.log("ROOM JOINED-----", roomId);
  //   socket.emit("join_room", roomId);
  //   return roomId;
  // };

  useEffect(() => {
    // const sock = getSocket();
    if (socket && selectedUser && userId && location.pathname === "/app") {
      const roomId = [userId, selectedUser.user_id]
        .sort((a, b) => a - b)
        .join("-");
      // console.log(selectedUser.user_id, "Use Effect ===USERID JOIN ROOM ");
      socket.emit("join_room", roomId);
      // console.log("Auto joined room on page load:", roomId);
    }
  }, [selectedUser, userId]);

  // join Group
  useEffect(() => {
    if (socket && selectedUser && userId && location.pathname === "/group") {
      const roomId = { group_id: selectedUser.group_id };
      // .sort((a, b) => a - b)
      // .join("-");
      socket.emit("join_group_room", roomId);
      // console.log("Auto joined join_group_room on page load:", roomId);
    }
  }, [selectedUser, userId]);

  const sendMessage = (message) => {
    // console.log(message, "SENDMESSAGE");

    socket.emit("send_message", message);
  };

  // Send Group Message
  const sendGroupMessage = (id, message) => {
    socket.emit("send_group_message", { group_id: id, message: message });
  };
  // useEffect(() => {
  //   sock.on("recent_chats", (chats) => {
  //     console.log(chats, "RECENT CHATS__SOCKET");
  //     setChatList(chats);
  //   });
  // }, [third])

  useEffect(() => {
    if (!currentUserId) return;
    if (location.pathname === "/app") {
      socket.emit("get_recent_chats", currentUserId);
      // console.log("GET RECENT CHATS---", currentUserId, location.pathname);
    }
    socket.on("recent_chats", (chats) => {
      // console.log(chats, "RECENT CHATS__SOCKET CHAT LIST-----------=====585");
      setChatList(chats);
    });
    socket.on("refresh_recent", ({ sender_id, receiver_id }) => {
      // console.log(sender_id, receiver_id, "refresh_recent");

      if (sender_id === currentUserId || receiver_id === currentUserId) {
        // console.log(currentUserId, "get_recent_chats--------");

        socket.emit("get_recent_chats", currentUserId);
      }
    });

    socket.emit("get_online_users");

    socket.on("online_users", (ids) => {
      // console.log(ids, "online_users----ids");

      setOnlineUsers(ids);
    });

    socket.on("user_online", ({ userId }) => {
      // console.log(userId, "user_online----ids");
      setOnlineUsers((prev) => [...prev, userId]);
    });

    // sock.on("user_offline", ({ userId }) => {
    //   setOnlineUsers((prev) => prev?.filter((id) => id !== userId));
    // });
    socket.on("user_offline", ({ userId }) => {
      setOnlineUsers((prev) =>
        Array.isArray(prev) ? prev.filter((id) => id !== userId) : []
      );
    });
    const handleLogout = () => {
      // console.log("handleLogout=============");

      logout();
    };
    socket.on("force-logout", handleLogout);
    return () => {
      socket.off("recent_chats");
      socket.off("force-logout", handleLogout);
      socket.off("refresh_recent");
      socket.off("online_users");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [currentUserId, selectedUser, location.pathname === "/app"]);

  // get user group users
  useEffect(() => {
    if (!currentUserId) return;

    // 🔁 Request group chats
    socket.emit("get_user_groups");
    // console.log(location.pathname, "GROUPS----");

    // 🟢 Listener: receive group chat list
    socket.on("user_groups", (groups) => {
      // console.log("Group Chats via Socket:", groups);
      setGroupList(groups); // update state
    });

    // Optional: handle error
    socket.on("user_groups_error", (error) => {
      // console.error("Error fetching group chats:", error);
    });

    // ✅ Cleanup
    return () => {
      socket.off("user_groups");
      socket.off("user_groups_error");
    };
  }, [location.pathname === "/group"]);

  useEffect(() => {
    const handleDeliveredUpdate = ({ message_id }) => {
      // console.log(message_id, "handleDeliveredUpdate");

      setChatData((prev) =>
        prev.map((msg) =>
          msg.message_id === message_id ? { ...msg, delivered: true } : msg
        )
      );
    };
    // const handleFileDeliveredUpdate = ({
    //   file_id,
    //   sender_id,
    //   receiver_id,
    //   delivered,
    // }) => {
    //   console.log(
    //     file_id,
    //     sender_id,
    //     receiver_id,
    //     delivered,
    //     "handleFileDeliveredUpdate---"
    //   );

    //   // setChatData((prev) =>
    //   //   prev.map((msg) =>
    //   //     msg.message_id === message_id ? { ...msg, delivered: true } : msg
    //   //   )
    //   // );
    // };

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
      socket
        .off("delivered_update")
        .on("delivered_update", handleDeliveredUpdate);
      // socket
      //   .off("file_delivered_update")
      //   .on("file_delivered_update", handleFileDeliveredUpdate);
      socket.off("receive_message").on("receive_message", handleReceiveMessage);
      socket.off("receive_file").on("receive_file", handleReceiveFile);
      socket.off("mark_seen").on("mark_seen", handleSeenUpdate);
    };

    if (socket) {
      bindSocketEvents();
      socket.on("connect", bindSocketEvents);
    }

    return () => {
      if (socket) {
        socket.off("connect", bindSocketEvents);
        socket.off("delivered_update", handleDeliveredUpdate);
        socket.off("receive_message", handleReceiveMessage);
        socket.off("receive_file", handleReceiveFile);
        socket.off("mark_seen", handleSeenUpdate);
      }
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || !chatData.length || !socket) return;
    // console.log(chatData, "CHAT DATA MARK SEEN");

    const unseen = chatData.filter(
      (msg) =>
        msg.receiver_id === currentUserId &&
        msg.sender_id === selectedUser.user_id &&
        msg.delivered &&
        !msg.seen
    );
    // console.log(unseen, "1MARK SEEN EMIT----");
    if (unseen.length > 0) {
      // console.log(unseen, "2MARK SEEN EMIT----");

      socket.emit("mark_seen", {
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
        // joinRoom,
        sendMessage,
        sendGroupMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

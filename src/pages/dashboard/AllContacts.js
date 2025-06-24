import React, { useEffect, useState } from "react";
import { AxiosGetWithParams } from "../../services/apiServices";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import Chats from "./Chats";
import { useSelector } from "react-redux";
import Conversation from "../../components/Conversation";
import socket from "../../socket";
import { useChat } from "../../contexts/ChatContext";
import useSettings from "../../hooks/useSettings";
import ChatListPane from "../../components/commonComponent/ChatListPane";
import { useNavigate } from "react-router-dom";
import ConversationChat from "../../components/commonComponent/ConversationChat";

export default function AllContacts() {
  const theme = useTheme();
  const {
    chatList,
    setChatList,
    selectedUser,
    setSelectedUser,

    selectedMenu,
    setSelectedMenu,
  } = useChat();
  const { sidebar } = useSelector((store) => store.app); // access our store inside component
  // const [chatList, setChatList] = useState([]); // Stores all chats
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { chatDrawer, onToggleChatDrawer } = useSettings();

  // const [selectedUser, setSelectedUser] = useState(null);
  // const [onlineUsers, setOnlineUsers] = useState([]);

  const [filteredChats, setFilteredChats] = useState([]); // Stores search results
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  // Fetch all chat list on mount
  useEffect(() => {
    setLoading(true);
    AxiosGetWithParams("/api/auth/search") // API call for all chats
      .then((data) => {
        setChatList(data.users);
        setFilteredChats(data.users); // Show all chats initially
      })
      .catch((error) => console.error("Chat API Error:", error))
      .finally(() => setLoading(false));
  }, []);
  // useEffect(() => {
  //   if (!currentUserId) return;

  //   // Request recent chats
  //   socket.emit("get_recent_chats", currentUserId);

  //   // Listen for response
  //   socket.on("recent_chats", (chats) => {
  //     console.log(chats, "recent_chats");
  //     setChatList(chats);
  //   });

  //   // Refresh recent chats if new message sent/received
  //   socket.on("refresh_recent", ({ sender_id, receiver_id }) => {
  //     if (sender_id === currentUserId || receiver_id === currentUserId) {
  //       socket.emit("get_recent_chats", currentUserId);
  //     }
  //   });

  //   // Get list of online users
  //   socket.emit("get_online_users");

  //   socket.on("online_users", (ids) => {
  //     // console.log("Online Users:", ids);
  //     setOnlineUsers(ids);

  //     if (selectedUser) {
  //       const isOnline = ids.includes(selectedUser.user_id);
  //       console.log(
  //         `Selected user (${selectedUser.user_id}) is ${
  //           isOnline ? "online" : "offline"
  //         }`
  //       );
  //     }
  //   });

  //   socket.on("user_online", ({ userId }) => {
  //     console.log(`User ${userId} just came online`);
  //     setOnlineUsers((prev) => [...prev, userId]);
  //   });

  //   socket.on("user_offline", ({ userId }) => {
  //     console.log(`User ${userId} went offline`);
  //     setOnlineUsers((prev) => prev.filter((id) => id !== userId));
  //   });

  //   return () => {
  //     socket.off("recent_chats");
  //     socket.off("refresh_recent");
  //     socket.off("online_users");
  //     socket.off("user_online");
  //     socket.off("user_offline");
  //   };
  // }, [currentUserId, selectedUser]);
  //   Handle search dynamically
  useEffect(() => {
    if (searchQuery.length > 0) {
      setLoading(true);
      AxiosGetWithParams(`/api/auth/search`, { searchQuery })
        .then((data) => setFilteredChats(data))
        .catch((error) => console.error("Search API Error:", error))
        .finally(() => setLoading(false));
    } else {
      setFilteredChats(chatList); // Reset search results when query is cleared
    }
  }, [searchQuery, chatList]);
  const handleUserClick = (user) => {
    // console.log(user, "SELECTED ISER_---");
    setSelectedUser(user);
    setSelectedMenu(1);
    navigate("/app");
    // if (isMobile) onToggleChatCollapse(); // auto-close on mobile
    if (isMobile) onToggleChatDrawer();
  };
  return (
    <>
      {isMobile ? (
        chatDrawer ? (
          // <Chats chatList={chatList} setChatList={setChatList} />
          <ChatListPane
            mode="user"
            title="Chats"
            data={chatList}
            selectedId={selectedUser?.user_id}
            onSelect={handleUserClick}
          />
        ) : (
          <ConversationChat selectedUser={selectedUser} isGroup={false} />
          // <Conversation selectedUser={selectedUser} />
        )
      ) : (
        <Stack direction="row" sx={{ width: "100%" }}>
          {/* <Chats chatList={chatList} setChatList={setChatList} /> */}
          <ChatListPane
            mode="user"
            title="Chats"
            data={chatList}
            selectedId={selectedUser?.user_id}
            onSelect={handleUserClick}
          />
          <Box
            sx={{
              height: "100%",
              width: sidebar.open
                ? "calc(100vw - 740px)"
                : "calc(100vw - 420px)",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F0F4FA"
                  : theme.palette.background.default,
            }}
          >
            <ConversationChat selectedUser={selectedUser} isGroup={false} />
            {/* <Conversation selectedUser={selectedUser} /> */}
          </Box>
          {/* {sidebar.open &&
            (() => {
              switch (sidebar.type) {
                case "CONTACT":
                  return <Contact />;
                case "STARRED":
                  return <StarredMessages />;
                case "SHARED":
                  return <SharedMessages />;
                default:
                  return null;
              }
            })()} */}
        </Stack>
      )}
    </>
    // <>
    //   <Stack direction="row" sx={{ width: "100%" }}>
    //     <Chats
    //       chatList={chatList}
    //       setChatList={setChatList}
    //       // isOnline={onlineUsers}
    //     />
    //     <Box
    //       sx={{
    //         height: "100%",
    //         width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
    //         backgroundColor:
    //           theme.palette.mode === "light"
    //             ? "#F0F4FA"
    //             : theme.palette.background.default,
    //       }}
    //     >
    //       {/* Conversation */}
    //       <Conversation selectedUser={selectedUser} />
    //     </Box>
    //   </Stack>
    // </>
  );
}

import React, { useEffect, useState } from "react";
import Chats from "./Chats";
import { Box, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Contact from "../../components/Contact";
import { useSelector } from "react-redux";
import SharedMessages from "../../components/SharedMessages";
import StarredMessages from "../../components/StarredMessages";
import { useChat } from "../../contexts/ChatContext";
import useSettings from "../../hooks/useSettings";
import ChatListPane from "../../components/commonComponent/ChatListPane";
import { useNavigate } from "react-router-dom";
import ConversationChat from "../../components/commonComponent/ConversationChat";
import Conversation from "../../components/Conversation";

const GeneralApp = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { chatDrawer, onToggleChatDrawer } = useSettings();
  const { sidebar } = useSelector((store) => store.app); // access our store inside component
  const {
    chatList,
    setChatList,
    selectedUser,
    setSelectedUser,
    setSelectedMenu,
  } = useChat();
  const navigate = useNavigate();
  // console.log(chatList, "CHATLIST===========");

  const handleUserClick = (user) => {
    // console.log(user, "SELECTED ISER_---");
    setSelectedUser(user);
    setSelectedMenu(1);
    navigate("/app");
    // if (isMobile) onToggleChatCollapse(); // auto-close on mobile
    if (isMobile) onToggleChatDrawer();
  };
  // useEffect(() => {
  //   if (selectedUser !== null) {
  //     console.log(selectedUser, "SELECTED USER GENERAL APP======>");
  //   }
  // }, [selectedUser]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  return (
    <>
      {isMobile ? (
        chatDrawer ? (
          // <Chats isOnline={onlineUsers} />
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
            {/* <Conversation selectedUser={selectedUser} /> */}
            <ConversationChat selectedUser={selectedUser} isGroup={false} />
          </Box>
          {sidebar.open &&
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
            })()}
        </Stack>
      )}
    </>
  );

  // return (
  //   <Stack direction="row" sx={{ width: "100%" }}>
  //     {/* Chats */}
  //     <Chats isOnline={onlineUsers} />

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
  //     {/* Contact */}
  //     {sidebar.open &&
  //       (() => {
  //         switch (sidebar.type) {
  //           case "CONTACT":
  //             return <Contact />;

  //           case "STARRED":
  //             return <StarredMessages />;

  //           case "SHARED":
  //             return <SharedMessages />;

  //           default:
  //             break;
  //         }
  //       })()}
  //   </Stack>
  // );
};

export default GeneralApp;

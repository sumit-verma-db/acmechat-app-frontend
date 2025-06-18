import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect } from "react";
import { useTheme } from "@mui/material/styles";

import { axiosGet } from "../../services/apiServices";
import { useChat } from "../../contexts/ChatContext";
import { useCall } from "../../contexts/CallContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import NoChat from "../../assets/Illustration/NoChat";
import Chats from "../../pages/dashboard/Chats";
import Header1 from "../Conversation/Header1";
import Message1 from "../Conversation/Message1";
import Footer1 from "../Conversation/Footer1";
import IncomingCallPopup from "../Conversation/IncomingCallPopup";
import ChatHeader from "./ChatHeader";
import ChatListPane from "./ChatListPane";
import useSettings from "../../hooks/useSettings";
import { useNavigate } from "react-router-dom";
import ChatMessages from "./ChatMessage";
import ChatFooter from "./ChatFooter";
import IncomingCallPopupGroup from "../ConversationGroup/IncomingCallPopup";

const ConversationChat = ({ selectedUser, selectedGroup, isGroup }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { chatData, setChatData, groupList, chatList } = useChat();

  const currentUserId = parseInt(localStorage.getItem("userId"));

  const {
    showCallPopup,
    setShowCallPopup,
    isIncomingCall,
    callerName,
    remoteStream,
    setSelectedUser,
    setSelectedMenu,
  } = useCall();
  const { answerCall, rejectCall, cleanupCall } = useCallSocket();
  const { chatDrawer, onToggleChatDrawer } = useSettings();
  const navigate = useNavigate();
  const handleAccept = () => answerCall();
  const handleReject = () => rejectCall();

  const fetchUserMessages = async (userId) => {
    try {
      const res = await axiosGet(`api/auth/messages/${userId}`);
      const formatted = (res?.messages || []).map((msg) => ({
        ...msg,
        id: msg.message_id,
        fromMe: msg.sender_id === currentUserId,
      }));
      setChatData(formatted);
    } catch (err) {
      console.error("User message fetch error:", err);
      setChatData([]);
    }
  };

  const fetchGroupMessages = async (groupId) => {
    try {
      const res = await axiosGet(`api/auth/group/messages/${groupId}`);
      const formatted = (res?.messages || []).map((msg) => ({
        ...msg,
        id: msg.message_id,
        fromMe: msg.sender_id === currentUserId,
      }));
      setChatData(formatted);
    } catch (err) {
      console.error("Group message fetch error:", err);
      setChatData([]);
    }
  };

  useEffect(() => {
    if (selectedUser?.user_id) {
      fetchUserMessages(selectedUser.user_id);
    } else if (selectedGroup?.group_id) {
      fetchGroupMessages(selectedGroup.group_id);
    }
  }, [selectedUser, selectedGroup]);

  const showChat = selectedUser || selectedGroup;
  console.log(selectedUser, selectedGroup, showChat, "SHOWCHATT");

  const handleGroupClick = (user) => {
    console.log(user, "USERRRRRRR------>");
    // const roomId = joinRoom(user.user_id);
    // console.log(roomId, "ROOOOMID---->");
    if (isMobile) onToggleChatDrawer();
    setSelectedUser(user);
    // setSelectedMenu(1);
    // fetchGroupMessages(user.group_id); // ✅ FORCE FETCH
    // navigate("/app");
  };
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedMenu(1);
    navigate("/app");
    // if (isMobile) onToggleChatCollapse(); // auto-close on mobile
    if (isMobile) onToggleChatDrawer();
    // fetchUserMessages(user.user_id);
  };
  return (
    <Stack
      height="100dvh"
      width="100%"
      sx={{
        maxHeight: { xs: "94vh", sm: "100vh" },
        overflow: "hidden",
        [theme.breakpoints.down("sm")]: {
          width: "100vw",
        },
      }}
    >
      <audio id="remoteAudio" autoPlay style={{ display: "none" }} />
      {isGroup ? (
        <IncomingCallPopupGroup
          isGroup={isGroup}
          open={showCallPopup}
          onClose={() => {
            cleanupCall();
            setShowCallPopup(false);
          }}
          onAccept={handleAccept}
          onReject={handleReject}
          isIncoming={isIncomingCall}
          callerName={callerName}
          remoteStream={remoteStream}
        />
      ) : (
        <IncomingCallPopup
          isGroup={isGroup}
          open={showCallPopup}
          onClose={() => {
            cleanupCall();
            setShowCallPopup(false);
          }}
          onAccept={handleAccept}
          onReject={handleReject}
          isIncoming={isIncomingCall}
          callerName={callerName}
          remoteStream={remoteStream}
        />
      )}
      {/* HEADER */}
      {showChat ? (
        <ChatHeader
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          isGroup={isGroup}
        />
      ) : isMobile ? (
        <ChatListPane
          mode={selectedUser ? "user" : "group"}
          title="Chats"
          data={selectedUser ? chatList : groupList}
          selectedId={
            selectedUser ? selectedUser?.user_id : selectedGroup?.group_id
          }
          onSelect={selectedUser ? handleUserClick : handleGroupClick}
        />
      ) : (
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100%", // Fill parent
            background: (theme) =>
              theme.palette.mode === "light"
                ? "url('/assets/bg-whatsapp-light.png'), #f0f2f5"
                : "url('/assets/bg-whatsapp-dark.png'), #222e35",
            backgroundSize: "cover",
            backgroundRepeat: "repeat",
            color: "text.secondary",
          }}
        >
          <NoChat />
          <Typography variant="h6" mt={2} color="text.secondary">
            Select a user to start a conversation
          </Typography>
          <Typography
            variant="body2"
            color="text.disabled"
            mt={1}
            textAlign="center"
            maxWidth={280}
          >
            Your recent messages will appear here. Start chatting by selecting a
            user from the list.
          </Typography>
        </Box>
      )}

      {/* MESSAGES */}
      <Box
        className="scrollbar"
        width="100%"
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          height: "100vh",
          py: 2,
          [theme.breakpoints.down("sm")]: {
            height: "calc(100vh - 140px)",
          },
        }}
      >
        {showChat && (
          <ChatMessages
            chatData={chatData}
            selectedUser={selectedUser}
            selectedGroup={selectedGroup}
          />
        )}
      </Box>

      {/* FOOTER */}

      {selectedUser && (
        <ChatFooter selectedUser={selectedUser} setChatData={setChatData} />
      )}
      {selectedGroup && (
        <ChatFooter selectedUser={selectedGroup} setChatData={setChatData} />
      )}
    </Stack>
  );
};

export default ConversationChat;

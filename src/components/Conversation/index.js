import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Header from "./Header";
import Footer from "./Footer";
import Message from "./Message";
import { axiosGet } from "../../services/apiServices";
import Message1 from "./Message1";
import Footer1 from "./Footer1";
import { useChat } from "../../contexts/ChatContext";
import Header1 from "./Header1";
import { useCall } from "../../contexts/CallContext";
import IncomingCallPopup from "./IncomingCallPopup";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import Chats from "../../pages/dashboard/Chats";
import NoChat from "../../assets/Illustration/NoChat";

const Conversation = ({ selectedUser }) => {
  // console.log(selectedUser, "SELECTED USER");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { chatData, setChatData } = useChat();
  // const [chatData, setChatData] = useState([]);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const {
    showCallPopup,
    setShowCallPopup,
    isIncomingCall,
    callerName,
    remoteStream,
  } = useCall();
  const { answerCall, rejectCall, cleanupCall } = useCallSocket();

  const handleAccept = () => {
    answerCall();
  };

  const handleReject = () => {
    rejectCall();
  };
  const fetchMessages = async (userId) => {
    console.log("API_HITTT", userId);
    try {
      const response = await axiosGet(`api/auth/messages/${userId}`);
      if (response?.messages?.length > 0) {
        const formattedMessages = response.messages.map((msg) => ({
          ...msg,
          id: msg.message_id,
          message_id: msg.message_id,
          delivered: msg.delivered,
          type: msg.type,

          message: msg.message,
          sender: msg.sender_id,
          receiver: msg.receiver_id,
          sent_at: msg.sent_at,
          fromMe: msg.sender_id === currentUserId,
          seen: msg.seen,
        }));
        setChatData(formattedMessages);
        console.log(formattedMessages, "fetchMessages-----API");
      } else {
        setChatData([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  useEffect(() => {
    console.log(selectedUser, "SELECTYED USER------");
    if (selectedUser?.user_id !== undefined) {
      fetchMessages(selectedUser?.user_id);
    }
  }, [selectedUser]);

  const onClose = () => {
    cleanupCall(); // You can also pass it down as a prop
    setShowCallPopup(false);
  };

  return (
    <Stack
      height="100dvh" // ✅ Correct mobile viewport handling
      width="100%"
      sx={{
        maxHeight: {
          xs: "94vh", // mobile
          sm: "100vh", // tablet and up
        },
        overflow: "hidden", // prevent scroll bleed
        [theme.breakpoints.down("sm")]: {
          width: "100vw",
        },
      }}
    >
      {/* // <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}> */}
      <audio id="remoteAudio" autoPlay style={{ display: "none" }} />
      <IncomingCallPopup
        open={showCallPopup}
        onClose={onClose}
        onAccept={handleAccept}
        onReject={handleReject}
        isIncoming={isIncomingCall}
        callerName={callerName}
        remoteStream={remoteStream} // Pass the remote stream here
      />

      {/* Chat header */}
      {selectedUser ? (
        <Header1 />
      ) : isMobile ? (
        <Chats />
      ) : (
        <>
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
            }}
          >
            <NoChat />
            <Typography variant="h6" mt={2} color="text.secondary">
              Select a user to start a conversation
            </Typography>
          </Box>
        </>
      )}
      {/* Msg */}
      <Box
        className="scrollbar"
        width="100%"
        sx={{
          flexGrow: 1,

          overflowY: "auto",
          height: "100vh",
          py: 2,

          [theme.breakpoints.down("sm")]: {
            height: "calc(100vh - 140px)", // adjust for header + footer
          },
        }}
      >
        {/* <Box
        className="scrollbar"
        width={"100%"}
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      > */}
        {/* <Box
        className="scrollbar"
        sx={{
          flexGrow: 1,
          minHeight: 100%,
          overflowY: "auto",
          px: 2,
        }}
      > */}
        {selectedUser ? (
          <Message1 chatData={chatData} selectedUser={selectedUser} />
        ) : null}
        {/* <Message menu={true} /> */}
      </Box>
      {/* Chat footer */}
      {selectedUser && (
        <Footer1 selectedUser={selectedUser} setChatData={setChatData} />
      )}
      {/* <Footer /> */}
    </Stack>
  );
};

export default Conversation;

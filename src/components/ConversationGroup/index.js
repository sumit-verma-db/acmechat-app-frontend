import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";

import { axiosGet } from "../../services/apiServices";

import { useChat } from "../../contexts/ChatContext";
import { useCall } from "../../contexts/CallContext";
import IncomingCallPopup from "./IncomingCallPopup";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import Header1 from "./Header1";
// import Message1 from "./Message1";
import Footer1 from "./Footer1";
import Message1 from "../Conversation/Message1";

const GroupConversation = ({ selectedUser }) => {
  // console.log(selectedUser, "SELECTED USER");
  const theme = useTheme();
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
  const fetchMessages = async (groupId) => {
    const currentUserId = parseInt(localStorage.getItem("userId"));
    try {
      const response = await axiosGet(`api/auth/group/messages/${groupId}`);
      if (response?.messages?.length > 0) {
        const formattedMessages = response.messages.map((msg) => {
          let messageContent = msg.message;

          // 🔍 Parse JSON string if necessary
          try {
            const parsed = JSON.parse(msg.message);
            if (typeof parsed === "object" && parsed.message) {
              messageContent = parsed.message;
            }
          } catch (err) {
            // It's a normal string, skip parsing
          }

          return {
            id: msg.message_id,
            message_id: msg.message_id,
            type: "msg",
            subtype: "text",
            message: messageContent,
            sender: msg.sender_id,
            sender_name: `${msg.sender_first_name} ${msg.sender_last_name}`,
            sent_at: msg.sent_at,
            sender_id: msg.sender_id,
            fromMe: msg.sender_id === currentUserId,
            delivered: msg.delivered || false,
            seen: msg.seen || false,
            is_group: true,
            group_id: msg.group_id,
          };
        });

        setChatData(formattedMessages);
        console.log(response?.messages, "fetchMessages-----API");
      } else {
        setChatData([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    console.log(selectedUser, "SELECTYED USER------");
    if (selectedUser?.group_id !== undefined) {
      fetchMessages(selectedUser?.group_id);
    }
  }, [selectedUser]);

  const onClose = () => {
    cleanupCall(); // You can also pass it down as a prop
    setShowCallPopup(false);
  };

  return (
    <Stack height={"100%"} maxHeight={"100vh"} width={"auto"}>
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
      ) : (
        <Typography align="center" sx={{ p: 2 }}>
          Select a user to start a conversation
        </Typography>
      )}
      {/* Msg */}
      <Box
        className="scrollbar"
        width={"100%"}
        sx={{ flexGrow: 1, height: "100%", overflowY: "scroll" }}
      >
        {selectedUser ? (
          <Message1 chatData={chatData} selectedUser={selectedUser} />
        ) : null}
        {/* <Message menu={true} /> */}
      </Box>
      {/* Chat footer */}
      {selectedUser && <Footer1 selectedUser={selectedUser} />}
      {/* <Footer /> */}
    </Stack>
  );
};

export default GroupConversation;

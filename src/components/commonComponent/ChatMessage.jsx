import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Check, Checks } from "phosphor-react";
import {
  TextMsg,
  DocMsg,
  LinkMsg,
  MediaMsg,
  ReplyMsg,
} from "../Conversation/MsgTypes1";
// import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg } from "./MsgTypes1";

const ChatMessages = ({ chatData, selectedUser, isGroup }) => {
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  // const isGroup = Boolean(selectedGroup);
  console.log(chatData, "ChatDATAT", selectedUser, isGroup);
  const chatTarget = selectedUser;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  const filteredMessages = chatData.filter((msg) => {
    if (isGroup) {
      return msg.group_id && msg.group_id === selectedUser.group_id;
    } else {
      return (
        (msg.sender_id === selectedUser?.user_id &&
          msg.receiver_id === currentUserId) ||
        (msg.sender_id === currentUserId &&
          msg.receiver_id === selectedUser?.user_id)
      );
    }
  });
  console.log(filteredMessages, "FILTERED MESSAGEG__-");
  const groupedByDate = {};
  filteredMessages.forEach((msg) => {
    const key = new Date(msg.sent_at).toISOString().split("T")[0];
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(msg);
  });

  const getReadableDate = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(today, date)) return "Today";
    if (isSameDay(yesterday, date)) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderMessage = (el, fromMe) => {
    switch (el.type) {
      case "text":
        return <TextMsg el={el} fromMe={fromMe} menu={false} />;
      case "document":
        if (el.file_type?.startsWith("image/")) {
          return <MediaMsg el={el} fromMe={fromMe} menu={false} />;
        }
        return <DocMsg el={el} fromMe={fromMe} menu={false} />;
      case "link":
        return <LinkMsg el={el} fromMe={fromMe} menu={false} />;
      case "reply":
        return <ReplyMsg el={el} fromMe={fromMe} menu={false} />;
      default:
        return <TextMsg el={el} fromMe={fromMe} menu={false} />;
    }
  };

  return (
    <Box
      p={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "100%",
        minWidth: "2rem",
        overflowY: "auto",
      }}
    >
      <Stack spacing={2}>
        {Object.entries(groupedByDate).map(([date, messages]) => (
          <React.Fragment key={date}>
            <Typography
              align="center"
              sx={{ fontSize: 13, color: "#888", my: 1 }}
            >
              {getReadableDate(date)}
            </Typography>

            {messages.map((el, index) => {
              const fromMe =
                el.sender === currentUserId || el.sender_id === currentUserId;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: fromMe ? "flex-end" : "flex-start",
                  }}
                >
                  <Box sx={{ maxWidth: "100%" }}>
                    {isGroup && !fromMe && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                          mb: 0.5,
                          ml: 1,
                        }}
                      >
                        {el.sender_name || `User ${el.sender_id}`}
                      </Typography>
                    )}
                    {renderMessage(el, fromMe)}
                  </Box>
                </Box>
              );
            })}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  );
};

export default ChatMessages;

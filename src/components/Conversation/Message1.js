import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
// import { Check, Checks } from "phosphor-react";
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg } from "./MsgTypes1";

const Message1 = ({ chatData, selectedUser }) => {
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem("userId"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  const isGroup = selectedUser?.group_id !== undefined;

  const filteredMessages = chatData.filter((msg) => {
    if (isGroup) {
      return msg.is_group && msg.group_id === selectedUser.group_id;
    } else {
      return (
        (msg.sender === selectedUser?.user_id &&
          msg.receiver === currentUserId) ||
        (msg.sender === currentUserId && msg.receiver === selectedUser?.user_id)
      );
    }
  });

  // Group messages by date
  const groupedByDate = {};
  filteredMessages.forEach((msg) => {
    const dateKey = new Date(msg.sent_at).toISOString().split("T")[0];
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(msg);
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
        // if it's an image file (mime starts with "image/"), show MediaMsg
        if (el.file_type?.startsWith("image/")) {
          return <MediaMsg el={el} fromMe={fromMe} menu={false} />;
        }
        // otherwise use your document bubble
        return <DocMsg el={el} fromMe={fromMe} menu={false} />;

      case "link":
        return <LinkMsg el={el} fromMe={fromMe} menu={false} />;

      case "reply":
        return <ReplyMsg el={el} fromMe={fromMe} menu={false} />;

      // you can add more custom types here…

      default:
        // fallback to plain text
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
                  {/* <Box
                    sx={{
                      maxWidth: { xs: "85%", sm: "70%", md: "60%" }, // ✅ responsive width
                      // maxWidth: "60%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: fromMe ? "#DCF8C6" : "#EAEAEA",
                      color: "#000",
                      whiteSpace: "pre-wrap", // ✅ allow line breaks
                      wordBreak: "break-word", // ✅ prevent overflow
                    }}
                  >
                    {isGroup && !fromMe && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {el.sender_name || `User ${el.sender_id || el.sender}`}
                      </Typography>
                    )}

                    <Typography variant="body1">{el.message}</Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#555" }}>
                        {new Date(el.sent_at).toLocaleTimeString()}
                      </Typography>
                      {fromMe && (
                        <>
                          {el.seen ? (
                            <Checks size={14} weight="bold" color="blue" />
                          ) : el.delivered ? (
                            <Checks size={14} weight="bold" />
                          ) : (
                            <Check size={14} weight="regular" />
                          )}
                        </>
                      )}
                    </Box>
                  </Box> */}
                  {renderMessage(el, fromMe)}
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

export default Message1;

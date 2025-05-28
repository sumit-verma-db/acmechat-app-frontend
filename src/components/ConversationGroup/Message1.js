import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Check, Checks } from "phosphor-react";

const Message1 = ({ chatData, selectedUser }) => {
  const messagesEndRef = useRef(null);
  const currentUserId = parseInt(localStorage.getItem("userId"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    console.log(chatData, "--------chatData-----");
  }, [chatData]);
  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  return (
    <Box
      p={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "100%",
        minWidth: "2rem",
      }}
    >
      <Stack spacing={2}>
        {chatData
          .filter((msg) => {
            return msg.is_group && msg.group_id === selectedUser?.group_id;
          })
          .map((el, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: el.fromMe ? "flex-end" : "flex-start",
              }}
            >
              <Box
                sx={{
                  maxWidth: "60%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  backgroundColor: el.fromMe ? "#DCF8C6" : "#EAEAEA",
                  color: "#000",
                }}
              >
                {/* Group: show sender name */}
                {selectedUser?.group_id && !el.fromMe && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: "#1976d2",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    {el.sender_id || `User ${el.sender_id}`}
                  </Typography>
                )}

                {/* Message text */}
                <Typography variant="body1">{el.message}</Typography>

                {/* Timestamp + Seen/Delivered for sender */}
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

                  {el.fromMe && (
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
              </Box>
            </Box>
          ))}
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  );
};

export default Message1;

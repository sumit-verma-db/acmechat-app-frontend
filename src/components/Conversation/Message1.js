import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Check, Checks } from "phosphor-react";

const Message1 = ({ chatData, selectedUser }) => {
  // console.log(chatData, "CHAT DATA   ====");
  const messagesEndRef = useRef(null);
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatData]);
  const currentUserId = parseInt(localStorage.getItem("userId"));

  return (
    <Box
      p={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "100%",
        minWidth: "2rem",
        // overflowY: "auto",
        // px: 2,
        // py: 1,
        // height: "calc(100vh - 150px)",
        // overflowY: "auto",
      }}
    >
      <Stack spacing={2}>
        {chatData
          .filter(
            (msg) =>
              (msg.sender === selectedUser?.user_id &&
                msg.receiver === currentUserId) ||
              (msg.sender === currentUserId &&
                msg.receiver === selectedUser?.user_id)
          )
          .map((el, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: el.fromMe ? "flex-end" : "flex-start",
              }}
              // className="message"
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
                  {/* {el.fromMe && (
                    <>
                      {el.delivered ? (
                        <Checks size={14} weight="bold" />
                      ) : (
                        <Check size={14} weight="regular" />
                      )}
                      {el.delivered && el.seen ? (
                        <Checks size={14} weight="bold" color="blue" />
                      ) : (
                        // <Typography variant="caption" sx={{ color: "gray" }}>
                        //   "Seen"
                        // </Typography>
                        ""
                      )}
                    </>
                  )} */}
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

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
    scrollToBottom();
  }, [chatData]);

  // Format date to YYYY-MM-DD
  const formatDateKey = (date) => new Date(date).toISOString().split("T")[0];

  // Get readable label
  const getReadableDate = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter for current group
  const groupMessages = chatData.filter(
    (msg) => msg.is_group && msg.group_id === selectedUser?.group_id
  );

  // Group by date
  const groupedByDate = {};
  groupMessages.forEach((msg) => {
    const key = formatDateKey(msg.sent_at);
    if (!groupedByDate[key]) groupedByDate[key] = [];
    groupedByDate[key].push(msg);
  });

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
        {Object.entries(groupedByDate).map(([date, messages]) => (
          <React.Fragment key={date}>
            <Typography
              align="center"
              sx={{ fontSize: 13, color: "#888", my: 1 }}
            >
              {getReadableDate(date)}
            </Typography>

            {messages.map((el, index) => {
              const fromMe = el.sender_id === currentUserId;
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: fromMe ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: "60%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: fromMe ? "#DCF8C6" : "#EAEAEA",
                      color: "#000",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {!fromMe && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "#1976d2",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {el.sender_name || `User ${el.sender_id}`}
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

export default Message1;

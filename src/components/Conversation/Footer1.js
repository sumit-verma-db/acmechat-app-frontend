import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { PaperPlaneTilt, Smiley } from "phosphor-react";
import socket from "../../socket";
import { useSocket } from "../../contexts/SocketProvider";
// ?? CORRECT
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const Footer1 = ({ selectedUser, setChatData }) => {
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const { sendMessage } = useSocket();

  const handleSendMessage = () => {
    if (message.trim() !== "" && selectedUser) {
      const currentTime = new Date().toLocaleTimeString(); // Get the current time
      const newMessage = {
        delivered: true,
        pending: true,
        sender_id: currentUserId,
        receiver_id: selectedUser?.user_id,
        message: `${message}`, // Append the time to the message
        sent_at: new Date().toISOString(),
      };
      const sentMessage = sendMessage(newMessage); // Automatically joins and returns roomId
      console.log(sentMessage, newMessage, "SENTMESSAGE------->");

      setMessage("");
      setOpenPicker(false);
    }
  };
  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native); // ?? Append emoji to input
  };
  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      {openPicker && ( // ?? Show emoji picker
        <Box sx={{ position: "absolute", bottom: 70, right: 20, zIndex: 1000 }}>
          <Picker
            data={data}
            onEmojiSelect={(emoji) => {
              setMessage((prev) => prev + emoji.native); // ?? Append emoji to message
              setOpenPicker(false); // Optional: close after select
            }}
          />
        </Box>
      )}
      <Stack direction="row" alignItems={"center"} spacing={3}>
        <TextField
          fullWidth
          placeholder="Write a message..."
          variant="filled"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            // handleTyping();
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          InputProps={{
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setOpenPicker(!openPicker)}>
                  <Smiley />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconButton onClick={handleSendMessage}>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default Footer1;

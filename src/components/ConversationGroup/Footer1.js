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
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useSocket } from "../../contexts/SocketProvider";

const Footer1 = ({ selectedUser, setChatData }) => {
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const { sendGroupMessage } = useSocket(); // ✅ Use abstraction if needed

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const newMessage = {
      sender_id: currentUserId,
      group_id: selectedUser.group_id,
      message: message.trim(),
      sent_at: new Date().toISOString(),
    };

    // ✅ Send via socket
    sendGroupMessage(selectedUser.group_id, newMessage);
    console.log("SENT MESSAGE --->", newMessage);

    // ✅ Optimistically update chat UI
    // setChatData((prev) => [
    //   ...prev,
    //   {
    //     ...newMessage,
    //     message_id: Date.now(), // Temporary ID
    //     fromMe: true,
    //     delivered: false,
    //     seen: false,
    //     is_group: true,
    //     group_id: selectedUser.group_id,
    //   },
    // ]);

    setMessage("");
    setOpenPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setOpenPicker(false);
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        position: "sticky",
        bottom: { xs: 56, sm: 0 }, // Push above mobile navbar (56px is typical BottomNav height)
        zIndex: 10,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      {openPicker && (
        <Box sx={{ position: "absolute", bottom: 70, right: 20, zIndex: 1000 }}>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={2}>
        <TextField
          fullWidth
          placeholder="Write a message..."
          variant="filled"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          InputProps={{
            disableUnderline: true,
            sx: {
              padding: "10px 14px",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F0F4FA"
                  : theme.palette.background.default,
              borderRadius: 2,
              "& .MuiInputBase-input": {
                padding: 0,
                fontSize: 16,
              },
            },
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
            // height: 48,
            // width: 48,
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

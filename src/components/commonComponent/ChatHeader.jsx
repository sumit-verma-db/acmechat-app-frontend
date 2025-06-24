import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowLeft,
  MagnifyingGlass,
  Phone,
  VideoCamera,
  UsersThree,
} from "phosphor-react";
import React from "react";
import { useTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";

import StyledBadge from "../StyledBadge";
import { ToggleSidebar } from "../../redux/slices/app";
import { useCallSocket } from "../../contexts/CallSocketProvider";
// import { connectVoiceSocket } from "../../voiceSocket";
import { useAuth } from "../../contexts/useAuth";
import useSettings from "../../hooks/useSettings";
import { useChat } from "../../contexts/ChatContext";
import { connectVoiceSocket } from "../../voiceSocket";

const ChatHeader = ({ selectedUser, selectedGroup, isGroup = true }) => {
  // console.log(isGroup, "ISGROUP=======>");

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { onlineUsers } = useChat();
  const { chatDrawer, onToggleChatDrawer } = useSettings();
  const { callUser, callGroup, initializeVoiceSocket } = useCallSocket();
  const { authToken } = useAuth();

  const chat = selectedUser || selectedGroup;

  if (!chat) return null;

  const handleCall = async () => {
    if (!chat) {
      console.warn("No chat data available");
      return;
    }
    try {
      // console.log(authToken, "AUTH TOKEN------------------------");

      await connectVoiceSocket(authToken);
      if (isGroup) {
        // console.log("CAllGROUP");

        callGroup(chat.group_id, chat.group_name);
      } else {
        const userId = localStorage.getItem("userId");

        // console.log("callUser");
        const roomId = `room-${Date.now()}-${userId}-${chat.user_id}`;
        callUser(userId, chat.user_id, roomId, chat.first_name);
      }
    } catch (err) {
      console.error("Call initiation failed:", err);
    }
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        minHeight: 64,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack direction="row" spacing={2}>
          {isMobile && (
            <IconButton onClick={onToggleChatDrawer}>
              <ArrowLeft />
            </IconButton>
          )}

          <Box onClick={() => dispatch(ToggleSidebar())}>
            {isGroup ? (
              <Avatar>{chat.group_name?.[0]}</Avatar>
            ) : (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                isOnline={onlineUsers?.includes(chat.user_id)}
              >
                <Avatar alt={chat.first_name} src={chat.img} />
              </StyledBadge>
            )}
          </Box>

          <Stack spacing={0.2}>
            <Typography variant="subtitle2">
              {isGroup ? chat.group_name : `${chat.first_name}`}
            </Typography>
            <Typography variant="caption">
              {isGroup
                ? "Group Chat"
                : onlineUsers?.includes(chat.user_id)
                ? "Online"
                : "Offline"}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={3}>
          {isGroup ? (
            <IconButton onClick={handleCall}>
              <UsersThree />
            </IconButton>
          ) : (
            <>
              <IconButton>
                <VideoCamera />
              </IconButton>
              <IconButton onClick={handleCall}>
                <Phone />
              </IconButton>
            </>
          )}
          <IconButton>
            <MagnifyingGlass />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatHeader;

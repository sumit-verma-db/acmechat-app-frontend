import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowLeft,
  CaretDown,
  MagnifyingGlass,
  Phone,
  VideoCamera,
} from "phosphor-react";
import React, { useRef } from "react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../StyledBadge";
import { ToggleSidebar } from "../../redux/slices/app";
import { useDispatch } from "react-redux";
import { useChat } from "../../contexts/ChatContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import { connectVoiceSocket } from "../../voiceSocket";
import { useAuth } from "../../contexts/useAuth";
import { useCall } from "../../contexts/CallContext";
import useSettings from "../../hooks/useSettings";

const Header1 = () => {
  // console.log(user, "USSSSSS", isOnline);
  const audioRef = (useRef < HTMLAudioElement) | (null > null);
  const { authToken, refreshToken, userId } = useAuth();

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // ✅ Detect mobile

  const {
    setChatData,
    selectedUser,

    setChatList,
    onlineUsers,
    setOnlineUsers,
  } = useChat();
  const { setIsIncomingCall, setActiveCall, setShowCallPopup, setCallerName } =
    useCall();
  const { chatDrawer, onToggleChatDrawer } = useSettings();

  const { callUser } = useCallSocket();
  if (!selectedUser) return null; // Prevent rendering if no user is selected

  const handleCall = (user) => {
    // console.log(user, "USR------>");
    const socketInstance = connectVoiceSocket(authToken);
    // console.log(socketInstance, "SOCKET CONNNCTION-------");
    callUser(selectedUser.user_id, selectedUser.first_name); // send name for UI
    // setIsIncomingCall(true);
    // setShowCallPopup(true);
    // setActiveCall(false);
    // setCallerName(user);
  };

  return (
    <Box
      p={2}
      sx={{
        width: "100%",
        minHeight: 64, // ✅ ensures enough space
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack
        alignItems={"center"}
        direction="row"
        justifyContent={"space-between"}
        sx={{ width: "100%", height: "100%" }}
      >
        {/* <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap" // ✅ allows icon group to wrap below if needed
        sx={{ width: "100%" }}
      > */}
        <Stack direction={"row"} spacing={2}>
          {/* 👇 Show back button only on mobile */}
          {isMobile && (
            <IconButton onClick={onToggleChatDrawer}>
              <ArrowLeft />
            </IconButton>
          )}
          <Box
            onClick={() => {
              dispatch(ToggleSidebar());
            }}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              isonline={
                selectedUser
                  ? onlineUsers?.includes(selectedUser.user_id)
                  : null
              }
            >
              <Avatar alt={selectedUser.first_name} src={selectedUser.img} />
            </StyledBadge>
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">
              {selectedUser.first_name}
            </Typography>
            {/* {isTyping && (
              <Typography
                variant="caption"
                align="center"
                sx={{ p: 1, color: "gray" }}
              >
                Typing...
              </Typography>
            )} */}

            <Typography variant="caption">
              {onlineUsers?.includes(selectedUser.user_id)
                ? "Online"
                : "Offline"}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3}>
          <IconButton>
            <VideoCamera />
          </IconButton>
          <IconButton onClick={() => handleCall(selectedUser.user_id)}>
            <Phone />
          </IconButton>
          <IconButton>
            <MagnifyingGlass />
          </IconButton>
          {/* <Divider orientation="vertical" flexItem /> */}
          {/* <IconButton>
            <CaretDown />
          </IconButton> */}
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header1;

import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { CaretDown, MagnifyingGlass, Phone, VideoCamera } from "phosphor-react";
import React from "react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../StyledBadge";
import { ToggleSidebar } from "../../redux/slices/app";
import { useDispatch } from "react-redux";
import { useChat } from "../../contexts/ChatContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import { connectVoiceSocket } from "../../voiceSocket";
import { useAuth } from "../../contexts/useAuth";
import { useCall } from "../../contexts/CallContext";

const Header1 = () => {
  // console.log(user, "USSSSSS", isOnline);
  const { authToken, refreshToken, userId } = useAuth();

  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    setChatData,
    selectedUser,

    setChatList,
    onlineUsers,
    setOnlineUsers,
  } = useChat();
  const { setIsIncomingCall, setActiveCall, setShowCallPopup, setCallerName } =
    useCall();

  const { callUser } = useCallSocket();
  if (!selectedUser) return null; // Prevent rendering if no user is selected

  // const handleCall = (user) => {
  //   console.log(user, "USR------>");
  //   const socketInstance = connectVoiceSocket(authToken);
  //   console.log(socketInstance, "SOCKET CONNNCTION-------");
  //   callUser(selectedUser.user_id, selectedUser.first_name); // send name for UI
  //   // setIsIncomingCall(true);
  //   // setShowCallPopup(true);
  //   // setActiveCall(false);
  //   // setCallerName(user);
  // };

  const handleCall = async (user) => {
    console.log(user, "USR------>");
    try {
      const socketInstance = await connectVoiceSocket(authToken);
      console.log(socketInstance, "SOCKET CONNECTION READY");
      callUser(selectedUser.user_id, selectedUser.first_name); // send name for UI
    } catch (err) {
      console.error("Socket connection failed:", err);
    }
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
      <Stack
        alignItems={"center"}
        direction="row"
        justifyContent={"space-between"}
        sx={{ width: "100%", height: "100%" }}
      >
        <Stack
          onClick={() => {
            dispatch(ToggleSidebar());
          }}
          direction={"row"}
          spacing={2}
        >
          <Box>
            <StyledBadge
              overlap="circular"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              variant="dot"
              isOnline={
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
          <Divider orientation="vertical" flexItem />
          <IconButton>
            <CaretDown />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Header1;

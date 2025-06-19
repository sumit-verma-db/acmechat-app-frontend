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
  CaretDown,
  MagnifyingGlass,
  Phone,
  VideoCamera,
  UsersThree,
  ArrowLeft,
} from "phosphor-react";
import React from "react";
import { useTheme } from "@mui/material/styles";
import StyledBadge from "../StyledBadge";
import { ToggleSidebar } from "../../redux/slices/app";
import { useDispatch } from "react-redux";
import { useChat } from "../../contexts/ChatContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import { connectVoiceSocket } from "../../voiceSocket";
import { useAuth } from "../../contexts/useAuth";
import useSettings from "../../hooks/useSettings";

const Header1 = ({ isGroup }) => {
  const { authToken } = useAuth();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // ✅ Detect mobile
  const { chatDrawer, onToggleChatDrawer } = useSettings();

  const { selectedUser, onlineUsers } = useChat();
  const { callUser, callGroup } = useCallSocket();

  if (!selectedUser) return null;
  // console.log(selectedUser, "SELECTED USER");

  // const isGroup = selectedUser?.group_id;

  // console.log(isGroup, "CHECK IS GROUP======");
  const handleCall = async () => {
    try {
      await connectVoiceSocket(authToken); // Reuse the connection
      // if (isGroup) {
      callGroup(selectedUser.group_id); // group_id expected in selectedUser
      // }
      // else {
      //   callUser(selectedUser.user_id, selectedUser.first_name);
      // }
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
          // onClick={() => {
          //   dispatch(ToggleSidebar());
          // }}
          direction={"row"}
          spacing={2}
        >
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
            {isGroup ? (
              <Avatar>{selectedUser.group_name?.[0]}</Avatar>
            ) : (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                variant="dot"
                isOnline={onlineUsers?.includes(selectedUser.user_id)}
              >
                <Avatar alt={selectedUser.first_name} src={selectedUser.img} />
              </StyledBadge>
            )}
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2">
              {isGroup ? selectedUser.group_name : selectedUser.first_name}
            </Typography>
            <Typography variant="caption">
              {isGroup
                ? "Group Chat"
                : onlineUsers?.includes(selectedUser.user_id)
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

import {
  Avatar,
  Box,
  Typography,
  IconButton,
  Stack,
  useMediaQuery,
  Tooltip,
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
import { useMicControl } from "../../contexts/useMicControl";
import { useCall } from "../../contexts/CallContext";

const ChatHeader = ({ selectedUser, selectedGroup, isGroup = true }) => {
  // console.log(isGroup, "ISGROUP=======>");

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    // Mic state
    micList,
    currentMicId,
    setCurrentMicId,
    currentMicLabel,
    setCurrentMicLabel,
    setMicActive,
    micActive,

    // Speaker state
    speakerList,
    currentSpeakerId,
    setCurrentSpeakerId,
    setCurrentSpeakerLabel,
  } = useCall();
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

      // await connectVoiceSocket(authToken);
      if (isGroup) {
        // console.log("CAllGROUP");

        callGroup(chat.group_id, chat.group_name);
      } else {
        const userId = localStorage.getItem("userId");

        // console.log("callUser");
        const roomId = `room-${Date.now()}-${userId}-${chat.user_id}`;
        // console.log(chat, "CHAT------------");

        callUser(userId, chat.user_id, roomId, chat.first_name, chat.email);
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

          <Box
          // onClick={() => dispatch(ToggleSidebar())}
          >
            {isGroup ? (
              <Avatar>{chat.group_name?.[0]}</Avatar>
            ) : (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                isonline={onlineUsers?.includes(chat.user_id)}
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
          <Tooltip title={micActive ? `Mic On: ${currentMicLabel}` : "Mic Off"}>
            <IconButton size="small" sx={{ p: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: micActive ? "green" : "red",
                  boxShadow: micActive
                    ? "0 0 6px 2px rgba(0,255,0,0.6)"
                    : "0 0 2px 1px rgba(255,0,0,0.3)",
                  transition: "all 0.3s ease-in-out",
                }}
              />
            </IconButton>
          </Tooltip>
          {/* 🎤 Mic Status Toggle */}
          {/* <Tooltip title={micActive ? `Mic: ${currentMicLabel}` : "Mic Off"}>
            <IconButton
            // onClick={toggleMic}
            >
              {micActive ? (
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "green",
                    display: "inline-block",
                    mr: 1,
                  }}
                />
              ) : (
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "red",
                    display: "inline-block",
                    mr: 1,
                  }}
                />
              )}
            </IconButton>
          </Tooltip> */}

          {/* 🎧 Mic Selector Dropdown */}
          {/* <Box sx={{ minWidth: 160 }}>
            <select
              value={currentMicId}
              onChange={(e) => changeMic(e.target.value)}
              style={{
                fontSize: "0.75rem",
                padding: "4px 6px",
                borderRadius: 6,
                border: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
            >
              {micList.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Mic ${mic.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </Box> */}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatHeader;

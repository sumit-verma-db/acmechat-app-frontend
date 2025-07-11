import React from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
} from "@mui/material";
import { Phone, PhoneX, MicrophoneSlash, Microphone } from "phosphor-react";
import { useCall } from "../../contexts/CallContext";
import { keyframes } from "@emotion/react";
import CircularPulseAvatar from "./CircularPulseAvatar";
const dots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;
// Avatar ring pulse
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const UnifiedReceiving = ({ muted, callerName, answerCall, rejectCall }) => {
  const {
    micActive,
    micList,
    currentMicId,
    setCurrentMicId,
    setCurrentMicLabel,
    speakerList,
    currentSpeakerId,
    setCurrentSpeakerId,
    setCurrentSpeakerLabel,
    remoteMicActive,
    remoteMuted,
    remoteStream,
    localStream,
    callIncoming,
  } = useCall();
  const trimLabel = (label = "") =>
    label
      .replace(/\(Realtek.*?\)/gi, "")
      .replace(/-+$/, "")
      .trim();

  const setMicById = (id) => {
    const mic = micList.find((m) => m.deviceId === id);
    setCurrentMicId(id);
    setCurrentMicLabel(mic?.label || "");
  };

  const setSpeakerById = (id) => {
    const spk = speakerList.find((s) => s.deviceId === id);
    setCurrentSpeakerId(id);
    setCurrentSpeakerLabel(spk?.label || "");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        mt: 2,
        mb: 3,
        px: 3,
        py: 2,
        borderRadius: 4,
        // backgroundColor: "rgba(255, 255, 255, 0.1)",
        // backdropFilter: "blur(8px)",
        // WebkitBackdropFilter: "blur(8px)", // Safari support
        // boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <Box sx={{ zIndex: 1, textAlign: "center", mt: 1 }}>
        <Typography variant="h6" color="white" fontWeight="bold">
          Calling
        </Typography>
        {/* <Typography
          variant="subtitle2"
          color="white"
          fontWeight="bold"
          mb={1}
          sx={{ letterSpacing: 0.5 }}
        >
          📞 {callerName} is calling
        </Typography> */}

        {/* <Avatar
          sx={{
            width: 96,
            height: 96,
            mx: "auto",
            fontSize: 36,
            fontWeight: 700,
            bgcolor: "#4f46e5",
            color: "white",
            animation: `${pulse} 2s infinite`,
            mb: 1,
          }}
        >
          {callerName?.charAt(0).toUpperCase()}
        </Avatar>

        <Typography
          variant="caption"
          color="white"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          Mic:{" "}
          {micActive ? <Microphone size={14} /> : <MicrophoneSlash size={14} />}
        </Typography> */}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
          textAlign: "center",
          mt: 2,
          mb: 3,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 1,
            // border: "2px solid gray",
            fontSize: 28,
            fontWeight: "bold",
            animation: `${pulse} 2s infinite`,
            bgcolor: "#0ea5e9",
            color: "white",
            // bgcolor: "#e0f2fe", // light blue
            // color: "#0c4a6e", // dark blue text
            border: "2px solid #bae6fd", // soft border
          }}
        >
          {/* setCallIncoming */}
          {callIncoming?.name?.charAt(0)}
        </Avatar>
        {/* <CircularPulseAvatar
          stream={localStream}
          active={!muted && micActive}
          label={callerName?.callerName?.charAt(0) || "U"}
        /> */}
        <Typography variant="body1" fontWeight="bold">
          {callIncoming?.name || callerName}
        </Typography>
        <Typography
          variant="caption"
          // color="white"
          sx={{
            display: "inline-block",
            "&::after": {
              display: "inline-block",
              animation: `${dots} 1.2s steps(4, end) infinite`,
              content: '""',
              whiteSpace: "pre",
            },
          }}
        >
          Incoming
        </Typography>
        {/* {!activeCall && (
          <Typography
            variant="caption"
            color="white"
            sx={{
              display: "inline-block",
              "&::after": {
                display: "inline-block",
                animation: `${dots} 1.2s steps(4, end) infinite`,
                content: '""',
                whiteSpace: "pre",
              },
            }}
          >
            {onlineUsers?.includes(callerName?.receiverId)
              ? "Ringing"
              : "Requesting"}
          </Typography>
        )} */}
        {/* <AudioWave stream={localStream} active={!muted && micActive} /> */}
        {/* <Typography
          variant="caption"
          color="white"
          display="flex"
          alignItems="center"
        >
          You {muted ? <MicrophoneSlash size={12} /> : <Microphone size={12} />}
        </Typography> */}
      </Box>
      {/* <Paper
        elevation={8}
        sx={{
          backgroundColor: "#f1f5f9",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          p: 3,
          pb: 4,
        }}
      >
       
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="primary"
          mb={2}
        >
          Audio Settings
        </Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "0.75rem" }}>Mic</InputLabel>
            <Select
              value={currentMicId || ""}
              onChange={(e) => setMicById(e.target.value)}
              label="Mic"
              sx={{ fontSize: "0.75rem", height: 36 }}
            >
              {micList.map((mic) => (
                <MenuItem
                  key={mic.deviceId}
                  value={mic.deviceId}
                  sx={{ fontSize: "0.75rem" }}
                >
                  {trimLabel(mic.label || `Mic ${mic.deviceId.slice(-4)}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "0.75rem" }}>Speaker</InputLabel>
            <Select
              value={currentSpeakerId || ""}
              onChange={(e) => setSpeakerById(e.target.value)}
              label="Speaker"
              sx={{ fontSize: "0.75rem", height: 36 }}
            >
              {speakerList.map((spk) => (
                <MenuItem
                  key={spk.deviceId}
                  value={spk.deviceId}
                  sx={{ fontSize: "0.75rem" }}
                >
                  {trimLabel(spk.label || `Speaker ${spk.deviceId.slice(-4)}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

      
        <Stack direction="row" spacing={3} justifyContent="center">
          <IconButton
            onClick={rejectCall}
            sx={{
              bgcolor: "#ef4444",
              color: "white",
              "&:hover": { bgcolor: "#dc2626" },
              p: 2,
            }}
          >
            <PhoneX size={22} />
          </IconButton>
          <IconButton
            onClick={answerCall}
            sx={{
              bgcolor: "#10b981",
              color: "white",
              "&:hover": { bgcolor: "#059669" },
              p: 2,
            }}
          >
            <Phone size={22} />
          </IconButton>
        </Stack>
      </Paper> */}
    </Box>
  );
};

export default UnifiedReceiving;

// src/components/CallingUi/ActiveCall.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  MicrophoneSlash,
  Microphone,
  Phone,
  Waveform,
  SpeakerSimpleSlash,
  SpeakerSimpleHigh,
} from "phosphor-react";
import { useCall } from "../../contexts/CallContext";
import { keyframes } from "@emotion/react";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const wave = keyframes`
  0% { transform: scaleY(0.1); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(0.1); }
`;

const AudioWave = ({ active }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "end",
      gap: "2px",
      height: 20,
      mb: 1,
    }}
  >
    {[...Array(5)].map((_, i) => (
      <Box
        key={i}
        sx={{
          width: 2,
          height: 10,
          bgcolor: active ? "#10b981" : "#d1d5db",
          animation: active
            ? `${wave} 0.8s ease-in-out ${i * 0.1}s infinite`
            : "none",
        }}
      />
    ))}
  </Box>
);

const ActiveCall = ({ muted, toggleMute, callerName, handleCancel }) => {
  const {
    micActive,
    callerProfileImg,
    receiverProfileImg,
    isIncomingCall,
    remoteMicActive,
    remoteMuted,
  } = useCall();

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        height: 300,
      }}
    >
      <Stack direction="row" spacing={5} alignItems="center" mb={3}>
        {/* Caller Avatar */}
        <Stack alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#0ea5e9",
              animation: `${pulse} 2s infinite`,
            }}
          >
            Y
          </Avatar>
          <AudioWave active={!muted && micActive} />
          <Typography variant="caption" display="flex" alignItems="center">
            You
            {muted ? <MicrophoneSlash size={12} /> : <Microphone size={12} />}
          </Typography>
        </Stack>

        {/* Receiver Avatar */}
        <Stack alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#6366f1",
              animation: `${pulse} 2s infinite`,
            }}
          >
            {callerName?.charAt(0)}
          </Avatar>
          <AudioWave active={!remoteMuted && remoteMicActive} />
          <Typography variant="caption" display="flex" alignItems="center">
            {callerName}
            {remoteMuted ? (
              <MicrophoneSlash size={12} />
            ) : (
              <Microphone size={12} />
            )}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2}>
        <IconButton
          onClick={toggleMute}
          sx={{
            bgcolor: "#a855f7",
            color: "white",
            "&:hover": { bgcolor: "#9333ea" },
            p: 1.5,
          }}
        >
          {muted ? <MicrophoneSlash /> : <Microphone />}
        </IconButton>

        <IconButton
          onClick={handleCancel}
          sx={{
            bgcolor: "#ef4444",
            color: "white",
            "&:hover": { bgcolor: "#dc2626" },
            p: 1.5,
          }}
        >
          <Phone />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ActiveCall;

// === File: src/components/CallSidebar/UnifiedDialing.jsx ===
import { useState, useEffect } from "react";
import {
  Phone,
  MicrophoneSlash,
  Microphone,
  VideoCameraSlash,
} from "phosphor-react";
import { Box, Typography, Avatar, IconButton, Stack } from "@mui/material";
import { keyframes } from "@emotion/react";
import { useChat } from "../../contexts/ChatContext";
import { useCall } from "../../contexts/CallContext";
import AudioWave from "./AudioWave";
import CircularPulseAvatar from "./CircularPulseAvatar";

const dots = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255,255,255, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(255,255,255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255, 0); }
`;
// const wave = keyframes`
//   0% { transform: scaleY(0.1); }
//   50% { transform: scaleY(1); }
//   100% { transform: scaleY(0.1); }
// `;

// const AudioWave = ({ active }) => (
//   <Box
//     sx={{ display: "flex", alignItems: "end", gap: "2px", height: 20, mb: 1 }}
//   >
//     {[...Array(5)].map((_, i) => (
//       <Box
//         key={i}
//         sx={{
//           width: 2,
//           height: 10,
//           bgcolor: active ? "#10b981" : "#d1d5db",
//           animation: active
//             ? `${wave} 0.8s ease-in-out ${i * 0.1}s infinite`
//             : "none",
//         }}
//       />
//     ))}
//   </Box>
// );
const UnifiedDialing = ({
  callerName = "John Doe",
  handleCancel,
  muted,
  toggleMute,
  activeCall,
  userOnline = false,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const { onlineUsers, callIncoming } = useChat();
  console.log(callerName, callIncoming, "CALLLERNAME");
  const { micActive, remoteMicActive, remoteMuted, remoteStream, localStream } =
    useCall();

  useEffect(() => {
    let timer;
    if (activeCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
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
          {activeCall && (
            <Typography variant="body2" color="white">
              {formatTime(callDuration)}
            </Typography>
          )}
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
          {/* <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 1,
            border: "2px solid white",
            fontSize: 28,
            fontWeight: "bold",
            animation: `${pulse} 2s infinite`,
            bgcolor: "#0ea5e9",
            color: "white",
          }}
        >
          {callerName?.callerName?.charAt(0)}
        </Avatar> */}
          <CircularPulseAvatar
            stream={localStream}
            active={!muted && micActive}
            label={callerName?.callerName?.charAt(0) || "U"}
          />
          <Typography variant="body1" color="white" fontWeight="bold">
            {callerName?.callerName}
          </Typography>
          {!activeCall && (
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
              {onlineUsers?.includes(callerName?.receiverId)
                ? "Ringing"
                : "Requesting"}
            </Typography>
          )}
          <AudioWave stream={localStream} active={!muted && micActive} />
          <Typography
            variant="caption"
            // color="white"
            display="flex"
            alignItems="center"
          >
            You{" "}
            {muted ? <MicrophoneSlash size={12} /> : <Microphone size={12} />}
          </Typography>
        </Box>

        {/* <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            sx={{
              bgcolor: "#ffffff",
              color: "#9333ea",
              "&:hover": { bgcolor: "#f3e8ff" },
              p: 1.5,
            }}
          >
            <VideoCameraSlash size={20} />
          </IconButton>

          <IconButton
            onClick={toggleMute}
            sx={{
              bgcolor: "#a855f7",
              color: "white",
              "&:hover": { bgcolor: "#9333ea" },
              p: 1.5,
            }}
          >
            {muted ? <MicrophoneSlash size={20} /> : <Microphone size={20} />}
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
            <Phone size={20} />
          </IconButton>
        </Stack> */}
      </Box>
    </>
  );
};

export default UnifiedDialing;

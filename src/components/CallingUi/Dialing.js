import { useState, useEffect } from "react";
import {
  Phone,
  X,
  MicrophoneSlash,
  VideoCamera,
  Microphone,
  VideoCameraSlash,
  SpeakerHigh,
} from "phosphor-react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Container,
} from "@mui/material";
import { keyframes } from "@emotion/react";

const dots = keyframes`0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255,255,255, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(255,255,255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255, 0); }
`;

const Dialing = ({
  callerName = "John Doe",
  handleCancel,
  muted,
  toggleMute,
  activeCall,
  userOnline = false,
}) => {
  const [callDuration, setCallDuration] = useState(0);

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

  //   const handleCancel = () => {
  //     console.log("Call cancelled");
  //   };
  const getButtonColor = (type) => {
    if (type === "cancel") return { bg: "#ef4444", hover: "#dc2626" }; // red
    if (type === "mute") return { bg: "#1e293b", hover: "#0f172a" }; // dark blue-gray
    return { bg: "#1e3a8a", hover: "#1d4ed8" }; // blue (for video)
  };
  return (
    <>
      {/* <Box
      sx={{
        // height: "100vh",
        // background: "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
        // background: "linear-gradient(135deg, #3b82f6, #9333ea)", // blue to purple
        // background: `linear-gradient(135deg, #1f2937, #4b5563)`, // subtle green blend
        background: "linear-gradient(135deg, #60a5fa,rgb(233, 226, 241))",

        // backgroundColor: "#16a34a", // tailwind's green-600
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        // p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    > */}
      {/* Background Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05), transparent 70%)`,
          // backgroundColor: "#15803d", // green-700
          opacity: 0.2,
          transform: "rotate(45deg)",
          zIndex: 0,
        }}
      />

      {/* Top Section */}
      <Box sx={{ zIndex: 1, textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="white" fontWeight="bold">
          Call
        </Typography>

        {activeCall && (
          <Typography variant="body2" color="white">
            {formatTime(callDuration)}
          </Typography>
        )}
      </Box>

      {/* Caller Section */}
      <Box sx={{ zIndex: 1, textAlign: "center", mt: 4, mb: 6 }}>
        <Avatar
          sx={{
            width: 112,
            height: 112,
            // bgcolor: "#4ade80", // green-400
            mb: 2,
            border: "4px solid white",
            fontSize: 36,
            fontWeight: "bold",

            animation: `${pulse} 2s infinite`,
            bgcolor: "#0ea5e9", // cyan
            color: "white",
            boxShadow: "0 0 0 5px rgba(255,255,255,0.3)",
          }}
        >
          {callerName?.charAt(0)}
        </Avatar>
        <Typography variant="h5" color="white" fontWeight="bold">
          {callerName}
        </Typography>
        {!activeCall && (
          <Typography
            variant="body2"
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
            {userOnline ? "Ringing" : "Requesting"}
          </Typography>
        )}
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{ zIndex: 1, mb: 4, flexDirection: "row", alignItems: "center" }}
      >
        <Stack direction="row" spacing={4} alignItems="center">
          {/* <Stack alignItems="center">
            <IconButton
              sx={{
                bgcolor: "#a855f7",
                color: "white",
                "&:hover": { bgcolor: "#9333ea" },
                p: 2,
              }}
            >
              <SpeakerHigh size={24} />
            </IconButton>
            <Typography variant="caption" color="white">
              Speaker
            </Typography>
          </Stack> */}

          <Stack alignItems="center">
            <IconButton
              sx={{
                bgcolor: "#ffffff",
                color: "#9333ea",
                "&:hover": { bgcolor: "#f3e8ff" },
                p: 2,
              }}
            >
              <VideoCameraSlash size={24} />
            </IconButton>
            <Typography variant="caption" color="white">
              Start Video
            </Typography>
          </Stack>

          <Stack alignItems="center">
            <IconButton
              onClick={toggleMute}
              sx={{
                bgcolor: "#a855f7",
                color: "white",
                "&:hover": { bgcolor: "#9333ea" },
                p: 2,
              }}
            >
              {muted ? <MicrophoneSlash size={28} /> : <Microphone size={28} />}

              {/* {muted ? <MicrophoneSlash size={24} /> : <Microphone size={24} />} */}
            </IconButton>
            <Typography variant="caption" color="white">
              Mute
            </Typography>
          </Stack>

          <Stack alignItems="center">
            <IconButton
              onClick={handleCancel}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                "&:hover": { bgcolor: "#dc2626" },
                p: 2,
              }}
            >
              <Phone size={24} />
            </IconButton>
            <Typography variant="caption" color="white">
              End Call
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {/* </Box> */}
    </>
  );
};

export default Dialing;

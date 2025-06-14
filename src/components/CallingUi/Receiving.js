import { useState, useEffect } from "react";
import {
  Phone,
  X,
  MicrophoneSlash,
  VideoCamera,
  Microphone,
  PhoneSlash,
} from "phosphor-react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Container,
  Button,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { useChat } from "../../contexts/ChatContext";

const dots = keyframes`0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }`;
const pulseRing = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255,255,255, 0.5);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(255,255,255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255,255,255, 0);
  }
`;
const Receiving = ({ callerName = "John Doe", answerCall, rejectCall }) => {
  const [callDuration, setCallDuration] = useState(0);
  const { chatList } = useChat();
  const findCallerName = chatList.find(
    (ele) => ele.user_id == callerName
  )?.first_name;
  // console.log(chatList, "CHAT LIST", findCallerName);
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <Box
      sx={{
        // height: "100vh",
        background: "linear-gradient(135deg, #3b82f6, #9333ea)", // blue to violet
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
    >
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
        {/* <Typography variant="body2" color="white">
          {formatTime(callDuration)}
        </Typography> */}
      </Box>

      {/* Caller Section */}
      <Box sx={{ zIndex: 1, textAlign: "center", mt: 4, mb: 6 }}>
        <Avatar
          sx={{
            width: 112,
            height: 112,
            border: "4px solid rgba(255, 255, 255, 0.5)",
            bgcolor: "#0ea5e9",

            // bgcolor: "#4ade80", // green-400
            mb: 2,
            border: "4px solid white",
            fontSize: 36,
            fontWeight: "bold",
            color: "#fff",
            // color: "white",
            animation: `${pulseRing} 1.5s infinite`,
            boxShadow: "0 0 0 5px rgba(255,255,255,0.3)",
          }}
        >
          {findCallerName?.charAt(0)}
        </Avatar>
        <Typography variant="h5" color="white" fontWeight="bold">
          {findCallerName}
        </Typography>
        <Typography variant="h7" color="white">
          Voice Call
        </Typography>
        {/* <Typography
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
          Calling
        </Typography> */}
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{ zIndex: 1, mb: 4, flexDirection: "row", alignItems: "center" }}
      >
        <Stack direction="row" spacing={8} sx={{ zIndex: 1 }}>
          <Stack alignItems="center">
            <Box
              sx={{
                borderRadius: "50%",
                animation: `${pulseRing} 1.6s infinite`,
              }}
            >
              <IconButton
                onClick={answerCall}
                sx={{
                  bgcolor: "#22c55e",
                  color: "white",
                  "&:hover": { bgcolor: "#16a34a" },
                  width: 64,
                  height: 64,
                }}
              >
                <Phone size={28} />
              </IconButton>
            </Box>
            <Typography variant="caption" color="white">
              Accept
            </Typography>
          </Stack>
          <Stack alignItems="center">
            <IconButton
              onClick={rejectCall}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                "&:hover": { bgcolor: "#dc2626" },
                width: 64,
                height: 64,
              }}
            >
              <PhoneSlash size={28} />
            </IconButton>
            <Typography variant="caption" color="white">
              Decline
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {/* <Box sx={{ zIndex: 1, mb: 8 }}>
        <Stack direction="row" spacing={4} justifyContent="center">
          <IconButton
            onClick={answerCall}
            sx={{
              bgcolor: "#374151", // gray-700
              color: "white",
              "&:hover": { bgcolor: "#1f2937" }, // gray-800
              p: 2,
              //   px: 8,
              //   py: 4,
            }}
          >
            <Phone size={28} />
          </IconButton>
          
          <IconButton
            onClick={rejectCall}
            sx={{
              bgcolor: "#ef4444", // red-500
              color: "white",
              "&:hover": { bgcolor: "#dc2626" }, // red-600
              p: 2,
            }}
          >
            <PhoneSlash size={28} />
           
          </IconButton>
        </Stack>
      </Box> */}
    </Box>
  );
};

export default Receiving;

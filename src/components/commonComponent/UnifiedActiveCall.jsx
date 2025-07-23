import React, { useEffect } from "react";
import { Box, Typography, Avatar, Stack, IconButton } from "@mui/material";
import { MicrophoneSlash, Microphone, Phone } from "phosphor-react";
import { useCall } from "../../contexts/CallContext";
import { keyframes } from "@emotion/react";
import CircularPulseAvatar from "./CircularPulseAvatar";
import AudioWave from "./AudioWave";

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

const UnifiedActiveCall = ({
  localStream,
  muted,
  toggleMute,
  callerName,
  handleCancel,
}) => {
  const {
    micActive,
    remoteStream,
    remoteMicActive,
    remoteMuted,
    callIncoming,
    participants,
  } = useCall();
  // console.log(callIncoming, "CALLINCOMMING");
  // Ensure local user appears first
  const sortedParticipants = [...participants].sort((a, b) =>
    a.isLocal ? -1 : 1
  );
  // useEffect(() => {
  //   console.log(sortedParticipants, "sortedParticipants LIST");
  // }, [sortedParticipants]);

  // console.log(sortedParticipants, "PARTICIPANTS LIST");

  return (
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Typography
        variant="h6"
        // color="white"

        fontWeight="bold"
        mb={2}
      >
        In Call
      </Typography>

      <Stack
        direction="row"
        spacing={0}
        sx={{ gap: "16px" }}
        justifyContent="center"
        mb={3}
      >
        {sortedParticipants.map((p) => (
          <Box
            key={p.userId}
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
            }}
          >
            <Stack alignItems="center">
              <CircularPulseAvatar
                stream={p.isLocal ? localStream : remoteStream}
                active={!p.isMuted && micActive}
                label={p.name?.charAt?.(0) || "U"}
              />
              <AudioWave
                stream={p.isLocal ? localStream : remoteStream}
                active={!p.isMuted && micActive}
              />
              <Typography variant="caption" display="flex" alignItems="center">
                {p.isLocal ? "You" : p.name || p.userId}{" "}
                {p.isMuted ? (
                  <MicrophoneSlash size={15} />
                ) : (
                  <Microphone size={15} />
                )}
              </Typography>
            </Stack>
          </Box>
        ))}
        {/* You */}
        {/* <Box
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
          <Stack alignItems="center">
           
            <CircularPulseAvatar
              stream={localStream}
              active={!muted && micActive}
              label={callerName?.callerName?.charAt(0) || callerName || "U"}
            />
            <AudioWave stream={localStream} active={!muted && micActive} />

            <Typography
              variant="caption"
              // color="white"
              display="flex"
              alignItems="center"
            >
              You{" "}
              {muted ? <MicrophoneSlash size={15} /> : <Microphone size={15} />}
            </Typography>
          </Stack>
        </Box> */}
        {/* Remote */}
        {/* <Box
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
          <Stack alignItems="center">
            
            <CircularPulseAvatar
              stream={remoteStream}
              active={!muted && micActive}
              //  {fromUserId: 13, callType: 'audio', roomId: 'room-1751891745592-13-5'}
              label={callIncoming?.fromUserId || "U"}
            />
            <AudioWave stream={remoteStream} active={!muted && micActive} />
            <Typography
              variant="caption"
              // color="white"
              display="flex"
              alignItems="center"
            >
              {callIncoming?.fromUserId}{" "}
              {remoteMuted ? (
                <MicrophoneSlash size={15} />
              ) : (
                <Microphone size={15} />
              )}
            </Typography>
          </Stack>
        </Box> */}
      </Stack>
    </Box>
  );
};

export default UnifiedActiveCall;

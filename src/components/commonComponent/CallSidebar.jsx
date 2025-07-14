import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Slide,
} from "@mui/material";
import {
  Microphone,
  MicrophoneSlash,
  Minus,
  Phone,
  PhoneX,
  VideoCameraSlash,
  CaretLeft,
  CaretRight,
} from "phosphor-react";
import { useCall } from "../../contexts/CallContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import Dialing from "./UnifiedDialing";
import Receiving from "./UnifiedReceiving";
import ActiveCall from "./UnifiedActiveCall";
import UnifiedDialing from "./UnifiedDialing";
import UnifiedReceiving from "./UnifiedReceiving";
import UnifiedActiveCall from "./UnifiedActiveCall";

export default function CallSidebar({ isGroup }) {
  const {
    showCallPopup,
    isIncomingCall,
    callerName,
    activeCall,
    localStream,
    remoteStream,
    setShowCallPopup,
    callAccepted,
    callIncoming,
    micList,
    currentMicId,
    setCurrentMicId,
    setCurrentMicLabel,
    speakerList,
    currentSpeakerId,
    setCurrentSpeakerId,
    setCurrentSpeakerLabel,
  } = useCall();

  const { answerCall, rejectCall, disconnectCall, IndicateMic } =
    useCallSocket();

  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // useEffect(() => {
  //   if (remoteStream && remoteAudioRef.current) {
  //     remoteAudioRef.current.srcObject = remoteStream;
  //   }
  // }, [remoteStream]);
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      const audioEl = remoteAudioRef.current;
      audioEl.srcObject = remoteStream;
      // make sure it actually starts
      const p = audioEl.play();
      if (p && p.catch)
        p.catch((err) => console.warn("Remote audio play blocked:", err));
    }
  }, [remoteStream]);
  useEffect(() => {
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleMute = () => {
    if (!localStream) return;
    const newMuteState = !muted;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !newMuteState));
    IndicateMic();
    setMuted(newMuteState);
  };

  const handleCancel = () => {
    setMuted(false);
    disconnectCall();
    setShowCallPopup(false);
  };

  const handleAccept = () => {
    answerCall(callIncoming?.roomId, callIncoming.fromUserId);
  };

  const setMicById = (deviceId) => {
    const mic = micList.find((m) => m.deviceId === deviceId);
    setCurrentMicId(deviceId);
    setCurrentMicLabel(mic?.label || "");
  };

  const setSpeakerById = (deviceId) => {
    const speaker = speakerList.find((s) => s.deviceId === deviceId);
    setCurrentSpeakerId(deviceId);
    setCurrentSpeakerLabel(speaker?.label || "");
  };

  const trimLabel = (label = "") =>
    label
      .replace(/\(Realtek.*?\)/gi, "")
      .replace(/-+$/, "")
      .trim();

  return (
    <>
      {showCallPopup && (
        <Slide direction="left" in={showCallPopup} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: isMinimized ? 64 : 380,
              // bgcolor: isMinimized ? "#1e293b" : "transparent",
              bgcolor: "white", // maintain clean white for both states

              zIndex: 1500,
              transition: "all 0.3s ease-in-out",
              boxShadow: 6,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              display: "flex",
              flexDirection: "column",

              overflow: "visible",
              border: "1px solid #e2e8f0", // soft border for separation
            }}
          >
            {/* <audio
              ref={localAudioRef}
              autoPlay
              muted 
              playsInline
              style={{ display: "none" }}
            /> */}
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
              onLoadedMetadata={() =>
                remoteAudioRef.current.play().catch(() => {})
              }
              style={{ display: "none" }}
            />

            {isMinimized ? (
              <Stack
                spacing={1.5}
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <IconButton onClick={toggleMute}>
                  {muted ? (
                    <MicrophoneSlash size={24} />
                  ) : (
                    <Microphone size={24} />
                  )}
                </IconButton>
                <IconButton onClick={handleCancel} sx={{ color: "red" }}>
                  <Phone />
                </IconButton>
                <IconButton
                  onClick={() => setIsMinimized(false)}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translate(-50%, -50%)",
                    zIndex: 1000,
                    bgcolor: "#f1f5f9",
                    borderRadius: "50%",
                    boxShadow: 3,
                  }}
                >
                  <CaretLeft size={24} weight="bold" />
                  {/* <Minus size={16} /> */}
                </IconButton>
              </Stack>
            ) : (
              <Stack
                justifyContent="space-evenly"
                height="100%"
                sx={{
                  backgroundColor: "white",
                  // background:
                  //   "linear-gradient(to bottom, #60a5fa, rgb(233, 226, 241))",
                  position: "relative",
                  px: 2,
                  py: 3,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  overflow: "visible",
                }}
              >
                {/* ✅ Mid-left Minimize Button */}
                <IconButton
                  onClick={() => setIsMinimized(true)}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    transform: "translate(-50%, -50%)", // push ~60% of button outside
                    zIndex: 1000,
                    bgcolor: "#f1f5f9",
                    borderRadius: "50%",
                    boxShadow: 3,
                    // width: 36,
                    // height: 36,
                    border: "1px solid #cbd5e1",
                    transition: "all 0.3s ease",
                    // "&:hover": {
                    //   bgcolor: "#e2e8f0",
                    // },
                  }}
                >
                  <CaretRight size={24} weight="bold" />
                  {/* <Minus size={18} /> */}
                </IconButton>
                {/* ✅ Main Section */}
                <Box sx={{ pt: 4, px: 2, pb: 10 }}>
                  {!isIncomingCall && !activeCall ? (
                    <UnifiedDialing
                      muted={muted}
                      activeCall={callAccepted}
                      toggleMute={toggleMute}
                      callerName={callerName}
                      handleCancel={handleCancel}
                    />
                  ) : isIncomingCall && !activeCall ? (
                    <UnifiedReceiving
                      callerName={callerName}
                      answerCall={handleAccept}
                      rejectCall={handleCancel}
                    />
                  ) : (
                    activeCall && (
                      <UnifiedActiveCall
                        localStream={localStream}
                        muted={muted}
                        toggleMute={toggleMute}
                        callerName={callerName}
                        handleCancel={handleCancel}
                      />
                    )
                  )}
                </Box>
                {!isIncomingCall && !activeCall ? (
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton
                      sx={{
                        bgcolor: "#f3f4f6", // light gray hoverable bg
                        p: 1.5,
                        color: "#10b981", // green for video on
                        "&:hover": {
                          bgcolor: "#d1fae5", // lighter green bg on hover
                        },
                      }}
                      // sx={{
                      //   // bgcolor: "#ffffff",
                      //   color: "#9333ea",
                      //   "&:hover": { bgcolor: "#f3e8ff" },
                      //   p: 1.5,
                      // }}
                    >
                      <VideoCameraSlash size={22} />
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
                      {muted ? (
                        <MicrophoneSlash size={24} />
                      ) : (
                        <Microphone size={24} />
                      )}
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
                      <Phone size={22} />
                    </IconButton>
                  </Stack>
                ) : isIncomingCall && !activeCall ? (
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
                ) : (
                  activeCall && (
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <IconButton
                        onClick={toggleMute}
                        sx={{
                          bgcolor: "#a855f7",
                          color: "white",
                          "&:hover": { bgcolor: "#9333ea" },
                          p: 1.5,
                        }}
                      >
                        {muted ? (
                          <MicrophoneSlash size={22} />
                        ) : (
                          <Microphone size={22} />
                        )}
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
                        <Phone size={22} />
                      </IconButton>
                    </Stack>
                  )
                )}
                {/* ✅ Bottom Audio Settings */}
                <Box
                  sx={{
                    // position: "absolute",
                    // bottom: 0,
                    // width: "100%",
                    p: 2,

                    // px: 2,
                    // py: 2,
                    bgcolor: "#f8fafc",
                    // backgroundColor: "#f1f5f9",
                    borderRadius: 2,
                    // borderTopLeftRadius: 20,
                    // borderTopRightRadius: 20,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    mb={1}
                    color="primary"
                  >
                    Audio Settings
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: "0.75rem" }}>Mic</InputLabel>
                      <Select
                        value={currentMicId || ""}
                        onChange={(e) => setMicById(e.target.value)}
                        label="Mic"
                        sx={{ fontSize: "0.75rem", height: 36 }}
                        MenuProps={{
                          disablePortal: true,
                          PaperProps: {
                            sx: {
                              zIndex: 3000,
                            },
                          },
                        }}
                      >
                        {micList.map((mic) => (
                          <MenuItem
                            key={mic.deviceId}
                            value={mic.deviceId}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {trimLabel(
                              mic.label || `Mic ${mic.deviceId.slice(-4)}`
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: "0.75rem" }}>
                        Speaker
                      </InputLabel>
                      <Select
                        value={currentSpeakerId || ""}
                        onChange={(e) => setSpeakerById(e.target.value)}
                        label="Speaker"
                        sx={{ fontSize: "0.75rem", height: 36 }}
                        MenuProps={{
                          disablePortal: true,
                          PaperProps: {
                            sx: {
                              zIndex: 3000,
                            },
                          },
                        }}
                      >
                        {speakerList.map((spk) => (
                          <MenuItem
                            key={spk.deviceId}
                            value={spk.deviceId}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {trimLabel(
                              spk.label || `Speaker ${spk.deviceId.slice(-4)}`
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>
        </Slide>
      )}
    </>
  );
}

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Slide,
} from "@mui/material";
import { CaretDown, CaretUp } from "phosphor-react";
import { useCall } from "../../contexts/CallContext";
import { useCallSocket } from "../../contexts/CallSocketProvider";
import Dialing from "../CallingUi/Dialing";
import Receiving from "../CallingUi/Receiving";
import ActiveCall from "../CallingUi/ActiveCall";

export default function IncomingCallPopup({ isGroup }) {
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
    setMicActive,
    micActive,
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
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Track minimized state

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
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

  const handleCancel = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
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
              width: isMinimized ? 80 : 360,
              bgcolor: "background.paper",
              boxShadow: 4,
              zIndex: 1500,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.3s ease-in-out",
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
            }}
          >
            <audio
              ref={remoteAudioRef}
              autoPlay
              playsInline
              style={{ display: "none" }}
            />
            {!isMinimized && (
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #60a5fa, rgb(233, 226, 241))",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 300,
                  borderBottomLeftRadius: showDeviceSelector ? 0 : 16,
                  borderBottomRightRadius: showDeviceSelector ? 0 : 16,
                }}
              >
                {!isIncomingCall && !activeCall ? (
                  <Dialing
                    muted={muted}
                    activeCall={callAccepted}
                    toggleMute={toggleMute}
                    callerName={callerName}
                    handleCancel={handleCancel}
                  />
                ) : isIncomingCall && !activeCall ? (
                  <Receiving
                    callerName={callerName}
                    answerCall={handleAccept}
                    rejectCall={handleCancel}
                  />
                ) : (
                  activeCall && (
                    <ActiveCall
                      muted={muted}
                      toggleMute={toggleMute}
                      callerName={callerName}
                      handleCancel={handleCancel}
                    />
                  )
                )}
              </Box>
            )}

            {/* Device selector */}
            {!isMinimized && (
              <Box
                sx={{
                  borderTop: "1px solid #ddd",
                  backgroundColor: "#e0f2fe",
                  p: 1,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onClick={() => setShowDeviceSelector(!showDeviceSelector)}
              >
                <Typography variant="caption" color="primary">
                  Audio Settings
                </Typography>
                <IconButton size="small">
                  {showDeviceSelector ? (
                    <CaretUp size={14} />
                  ) : (
                    <CaretDown size={14} />
                  )}
                </IconButton>
              </Box>
            )}

            {showDeviceSelector && !isMinimized && (
              <Box
                sx={{
                  backgroundColor: "#f1f5f9",
                  px: 2,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                >
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: "0.75rem" }}>Mic</InputLabel>
                    <Select
                      value={currentMicId || ""}
                      onChange={(e) => setMicById(e.target.value)}
                      label="Mic"
                      sx={{ fontSize: "0.75rem", height: 32 }}
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
                      sx={{ fontSize: "0.75rem", height: 32 }}
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
            )}

            {/* Minimize button */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
              }}
            >
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                size="small"
                variant="contained"
              >
                {isMinimized ? "Expand" : "Minimize"}
              </Button>
            </Box>
          </Box>
        </Slide>
      )}
    </>
  );
}

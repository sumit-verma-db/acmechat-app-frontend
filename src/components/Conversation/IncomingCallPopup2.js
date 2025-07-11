// src/components/IncomingCallPopup.jsx
import React, { useEffect, useRef, useState } from "react";
import { Modal, Box, Button, Stack, Typography } from "@mui/material";
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
    // Mic state
    micList,
    currentMicId,
    setCurrentMicId,
    setCurrentMicLabel,
    setMicActive,
    micActive,

    // Speaker state
    speakerList,
    currentSpeakerId,
    setCurrentSpeakerId,
    setCurrentSpeakerLabel,
  } = useCall();
  console.log("MIC LIST---", micList, "Speaker List----", speakerList);

  const { answerCall, rejectCall, cleanupCall, disconnectCall, IndicateMic } =
    useCallSocket();
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  console.log(remoteStream, "REMOTE STREAM");

  // when remoteStream arrives, hook up audio
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      console.log(remoteStream, remoteAudioRef, "remoteStream,remoteAudioRef");

      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  useEffect(() => {
    if (localStream && localAudioRef.current) {
      console.log(localStream, localAudioRef, "localStream, localAudioRef");

      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = muted));
    IndicateMic();
    setMuted(!muted);
  };
  useEffect(() => {
    console.log("CallACCEPTED=======>", callAccepted, activeCall);
  }, [callAccepted, activeCall]);

  // const handleCancel = () => {
  //   // for caller: cancel before connect
  //   cleanupCall();
  //   setShowCallPopup(false);
  // };
  const handleCancel = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      // console.log("Clicked outside or pressed ESC. Just closing popup.");
      // setShowCallPopup(false);
      return;
    }
    setMuted(false);
    disconnectCall();
    // console.log("User cancelled call actively");
    // cleanupCall();
    // rejectCall();
    setShowCallPopup(false);
  };
  const handleAccept = () => {
    // roomId, userId
    //  setCallIncoming({ fromUserId, callType, roomId });
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
  return (
    <Modal
      open={showCallPopup}
      onClose={handleCancel}
      disablebackdropClick
      disableEscapeKeyDown
    >
      <>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            // p: 4,
          }}
        >
          {/* hidden audio element stays mounted the whole time */}
          {/* <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        /> */}
          {/* Remote audio (hear the other person) */}
          <audio
            ref={remoteAudioRef}
            autoPlay
            playsInline
            style={{ display: "none" }}
          />

          {/* Local audio (monitor mic – optional for testing) */}
          {/* <audio
          ref={localAudioRef}
          autoPlay
          muted
          playsInline
          style={{ display: "none" }}
        /> */}
          <Box
            sx={{
              // height: "100vh",
              background: "linear-gradient(135deg, #60a5fa,rgb(233, 226, 241))",

              // background: "linear-gradient(135deg, #3b82f6, #9333ea)", // blue to violet
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
            {/* 1) Caller UI */}
            {!isIncomingCall && !activeCall && (
              <Dialing
                muted={muted}
                activeCall={callAccepted}
                toggleMute={toggleMute}
                callerName={callerName}
                handleCancel={handleCancel}
              />
            )}

            {/* 2) Receiver UI */}
            {isIncomingCall && !activeCall ? (
              <>
                <Receiving
                  callerName={callerName}
                  answerCall={handleAccept}
                  rejectCall={handleCancel}
                />
              </>
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
          <Box
            sx={{
              width: 300,
              bgcolor: "background.paper",
              borderTop: "1px solid #ddd",
              borderRadius: "0 0 16px 16px",
              px: 2,
              pb: 2,
              pt: 1.5,
              mx: "auto",
            }}
          >
            {/* Mic + Speaker in a Row */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Mic
                  </Typography>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: micActive ? "green" : "red",
                      boxShadow: micActive
                        ? "0 0 6px 2px rgba(0,255,0,0.6)"
                        : "0 0 2px 1px rgba(255,0,0,0.3)",
                      transition: "all 0.3s ease-in-out",
                    }}
                  />
                </Stack>
                <Box
                  component="select"
                  value={currentMicId}
                  onChange={(e) => setMicById(e.target.value)}
                  sx={{
                    width: "100%",
                    fontSize: "0.8rem",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  {micList.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Mic ${mic.deviceId.slice(-4)}`}
                    </option>
                  ))}
                </Box>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  mb={0.5}
                  display="block"
                >
                  Speaker
                </Typography>
                <Box
                  component="select"
                  value={currentSpeakerId}
                  onChange={(e) => setSpeakerById(e.target.value)}
                  sx={{
                    width: "100%",
                    fontSize: "0.8rem",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  {speakerList.map((spk) => (
                    <option key={spk.deviceId} value={spk.deviceId}>
                      {spk.label || `Speaker ${spk.deviceId.slice(-4)}`}
                    </option>
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </>
    </Modal>
  );
}

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
  } = useCall();

  const { answerCall, rejectCall, cleanupCall } = useCallSocket();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  // when remoteStream arrives, hook up audio
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch((e) => console.warn("Autoplay blocked", e));
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  };
  useEffect(() => {
    // console.log("CallACCEPTED=======>", callAccepted, activeCall);
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

    // console.log("User cancelled call actively");
    cleanupCall();
    // rejectCall();
    setShowCallPopup(false);
  };

  return (
    <Modal
      open={showCallPopup}
      onClose={handleCancel}
      disableBackdropClick
      disableEscapeKeyDown
    >
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
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />

        {/* 1) Caller UI */}
        {!isIncomingCall && !activeCall && (
          <Dialing
            muted={muted}
            activeCall={callAccepted}
            toggleMute={toggleMute}
            callerName={callerName}
            handleCancel={rejectCall}
          />
        )}

        {/* 2) Receiver UI */}
        {isIncomingCall && !activeCall ? (
          <>
            <Receiving
              callerName={callerName}
              answerCall={answerCall}
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
    </Modal>
  );
}

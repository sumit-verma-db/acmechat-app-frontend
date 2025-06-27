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
  } = useCall();

  const { answerCall, rejectCall, cleanupCall, disconnectCall } =
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
    </Modal>
  );
}

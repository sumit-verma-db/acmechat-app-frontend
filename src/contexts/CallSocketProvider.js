// src/contexts/CallSocketProvider.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCall } from "./CallContext";
import { connectVoiceSocket } from "../voiceSocket";
import { useChat } from "./ChatContext";

const CallSocketContext = createContext();
export const useCallSocket = () => useContext(CallSocketContext);

export function CallSocketProvider({ children }) {
  const {
    peerConnection,
    setCallIncoming,
    setRemoteStream,
    remoteStream,
    localStream,
    setLocalStream,
    setIsIncomingCall,
    setShowCallPopup,
    setCallerName,
    setCallAccepted,
    setCallEnded,
    callIncoming,
    setActiveCall,
    callerName,
    setIsRinging,
    isRinging,
  } = useCall();
  const { chatList = [] } = useChat() || {};

  const [socket, setSocket] = useState(null);
  const pendingCandidates = useRef([]);

  const ringtoneRef = useRef(null);
  const dialtoneRef = useRef(null);

  const dialRingtone = () => {
    console.log("[dialRingtone] Playing dialing tone");
    stopRingtone(); // Ensure ringtone is not playing
    if (!dialtoneRef.current) {
      dialtoneRef.current = new Audio("/audio/dialing.mp3");
      dialtoneRef.current.loop = true;
    }
    dialtoneRef.current.play().catch((err) => {
      console.warn("Autoplay blocked (dialtone):", err);
    });
  };

  // const playRingtone = () => {
  //   console.log("RINGTONE PLAYS ---====>");
  //   if (!ringtoneRef.current) {
  //     ringtoneRef.current = new Audio("/audio/ringtone.mp3");
  //     ringtoneRef.current.loop = true;
  //   }
  //   ringtoneRef.current.play().catch((err) => {
  //     console.warn("Autoplay blocked. User interaction needed:", err);
  //   });
  // };
  const playRingtone = () => {
    console.log("[playRingtone] Playing incoming ringtone");
    stopDialtone(); // Ensure dialtone is not playing
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/audio/ringtone.mp3");
      ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.play().catch((err) => {
      console.warn("Autoplay blocked (incoming ringtone):", err);
    });
  };
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const stopDialtone = () => {
    if (dialtoneRef.current) {
      dialtoneRef.current.pause();
      dialtoneRef.current.currentTime = 0;
      dialtoneRef.current = null;
    }
  };

  const TURN_CONFIG = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  };

  const cleanupCall = () => {
    console.log("[cleanupCall] Cleaning up the call");

    peerConnection.current?.close();
    peerConnection.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);

    if (socket && callIncoming?.from) {
      console.log("[cleanupCall] Emitting end_call");
      socket.emit("end_call", { peerId: callIncoming.from });
    }
    stopRingtone();
    stopDialtone();
    setCallIncoming(null);
    setShowCallPopup(false);
    setActiveCall(false);
    setCallAccepted(false);
    setCallEnded(true);
  };
  const callGroup = async (group_id) => {
    console.log("[callGroup] Starting group call to group:=====", group_id);
    if (!(await checkMic())) {
      alert("Microphone access is required.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setShowCallPopup(true);
      setIsIncomingCall(false);

      const pc = setupPeerConnection(stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_group", { group_id, signal: offer });
    } catch (err) {
      console.error("[callGroup] Error accessing mic:", err);
      alert("Cannot start group call.");
    }
  };

  const answerGroupCall = async () => {
    console.log("[answerGroupCall] Answering group call");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      const pc = setupPeerConnection(stream);
      await pc.setRemoteDescription(
        new RTCSessionDescription(callIncoming.signal)
      );

      pendingCandidates.current.forEach((c) =>
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)
      );
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer_group_call", {
        callerId: callIncoming.from,
        group_id: callIncoming.group_id,
        signal: answer,
      });

      setCallAccepted(true);
      setActiveCall(true);
    } catch (err) {
      console.error("[answerGroupCall] Error:", err);
      alert("Could not join group call.");
    }
  };

  const endGroupCall = () => {
    console.log("[endGroupCall] Ending group call");
    socket.emit("end_group_call", {
      group_id: callIncoming.group_id,
    });
    cleanupCall();
  };

  const checkMic = async () => {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      console.log("[checkMic] Microphone permission status:", status.state);
      return ["granted", "prompt"].includes(status.state);
    } catch (err) {
      console.warn("[checkMic] Permission check failed:", err);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const newSocket = connectVoiceSocket(token);
    console.log("[Socket] Connected");
    setSocket(newSocket);
  }, []);

  const setupPeerConnection = (stream, toUserId = null) => {
    console.log("[setupPeerConnection] Setting up peer connection");
    const pc = new RTCPeerConnection(TURN_CONFIG);
    peerConnection.current = pc;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const candidateData = {
          toUserId: toUserId || callIncoming?.from,
          candidate: e.candidate,
        };
        console.log("[onicecandidate] Sending candidate:", candidateData);
        socket.emit("ice_candidate", candidateData);
      }
    };

    pc.ontrack = (e) => {
      console.log("[ontrack] Received remote track");
      const remote = new MediaStream(e.streams[0].getTracks());
      setRemoteStream(remote);
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log("[ICE Connection] State changed:", state);

      if (state === "connected") {
        console.log("[ICE Connection] Connected");
        setActiveCall(true);
        setShowCallPopup(true);
      }

      if (["failed", "disconnected"].includes(state)) {
        console.warn("[ICE Connection] Failed or disconnected");
        cleanupCall();
      }
    };

    return pc;
  };

  const callUser = async (receiverId, receiverName) => {
    console.log("[callUser] Calling user:", receiverId);

    if (!(await checkMic())) {
      alert("Microphone access is required.");
      return;
    }

    setCallerName(receiverName);
    setShowCallPopup(true);
    setIsIncomingCall(false);
    dialRingtone();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[callUser] Got local stream");
      setLocalStream(stream);

      const pc = setupPeerConnection(stream, receiverId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("[callUser] Sending offer to user:", offer);
      socket.emit("call_user", { receiverId, signal: offer });
    } catch (err) {
      console.error("[callUser] Error accessing microphone:", err);
      setShowCallPopup(false);
      stopRingtone(); // 🔕 Stop on error
      alert("Cannot access mic.");
    }
  };

  const answerCall = async () => {
    console.log("[answerCall] Answering call from:", callIncoming?.from);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[answerCall] Got local stream");
      setLocalStream(stream);

      const pc = setupPeerConnection(stream);
      await pc.setRemoteDescription(
        new RTCSessionDescription(callIncoming.signal)
      );

      console.log("[answerCall] Applied remote description");

      pendingCandidates.current.forEach((c) => {
        console.log("[answerCall] Adding pending ICE candidate:", c);
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error);
      });
      pendingCandidates.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("[answerCall] Sending answer to caller");
      socket.emit("answer_call", {
        callerId: callIncoming.from,
        signal: answer,
      });
      stopRingtone();
      stopDialtone();
      setCallAccepted(true);
      setActiveCall(true);
    } catch (err) {
      console.error("[answerCall] Error answering call:", err);
      alert("Could not answer the call.");
    }
  };

  // useEffect(() => {
  //   console.log(chatList, "CHJAT LIST---------====> ");
  // }, [chatList]);

  const rejectCall = () => {
    console.log("[rejectCall] Call rejected by user", callIncoming, callerName);

    const findCallerId =
      chatList.length > 0 &&
      chatList?.find((ele) => ele.first_name == callerName).user_id;
    // cleanupCall();
    if (findCallerId) {
      socket?.emit("end_call", { peerId: findCallerId });
      cleanupCall();
      // setCallIncoming(null);
      // setShowCallPopup(false);
      // setActiveCall(false);
      // setCallAccepted(false);
      // setCallEnded(true);
    }
    // socket?.emit("end_call", { peerId: callIncoming?.from });
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, signal }) => {
      console.log("[socket] Incoming call from:", from);
      playRingtone();
      setCallIncoming({ from, signal });
      setIsIncomingCall(true);
      setIsRinging(true);
      setShowCallPopup(true);
      setCallerName(`${from}`);
    };

    const handleAnswerCall = async ({ answer }) => {
      console.log("[socket] Received answer from callee");
      const pc = peerConnection.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      setCallAccepted(true);
      stopRingtone();
      stopDialtone();
      pendingCandidates.current.forEach((c) =>
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)
      );
      pendingCandidates.current = [];
    };

    const handleIceCandidate = ({ candidate }) => {
      console.log("[socket] Received ICE candidate");
      const pc = peerConnection.current;
      if (!pc) return;

      if (pc.remoteDescription?.type) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      } else {
        console.log("[socket] Candidate pushed to pending list");
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on("incoming_call", handleIncomingCall);
    socket.on("answer_call", handleAnswerCall);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("call_ended", () => {
      console.log("[socket] Call ended event received");
      cleanupCall();
    });

    return () => {
      socket.off("incoming_call", handleIncomingCall);
      socket.off("answer_call", handleAnswerCall);
      socket.off("ice_candidate", handleIceCandidate);
      socket.off("call_ended", cleanupCall);
    };
  }, [socket]);
  // === Group Call: Incoming call ===
  useEffect(() => {
    if (!socket) return;
    const handleIncomingGroupCall = ({ from, group_id, signal }) => {
      console.log(
        "[socket] Incoming group call from:",
        from,
        "Group:",
        group_id
      );
      playRingtone();
      setCallIncoming({ from, signal, group_id });
      setIsIncomingCall(true);
      setShowCallPopup(true);
      setCallerName(`${from} (Group ${group_id})`);
    };

    // === Group Call: Answer received ===
    const handleGroupCallAnswered = async ({ from, group_id, signal }) => {
      console.log(
        "[socket] Group call answered by:",
        from,
        "for group:",
        group_id
      );
      const pc = peerConnection.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(signal));
      setCallAccepted(true);
    };

    // === Group Call: Ended ===
    const handleGroupCallEnded = ({ from, group_id }) => {
      console.log("[socket] Group call ended by:", from, "Group ID:", group_id);
      cleanupCall();
    };

    // Add these listeners
    socket.on("incoming_group_call", handleIncomingGroupCall);
    socket.on("group_call_answered", handleGroupCallAnswered);
    socket.on("group_call_ended", handleGroupCallEnded);

    // // Cleanup on unmount
    return () => {
      socket.off("incoming_group_call", handleIncomingGroupCall);
      socket.off("group_call_answered", handleGroupCallAnswered);
      socket.off("group_call_ended", handleGroupCallEnded);
    };
  }, [socket]);

  return (
    <CallSocketContext.Provider
      value={{
        callUser,
        answerCall,
        rejectCall,
        cleanupCall,
        callGroup,
        answerGroupCall,
        endGroupCall,
      }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

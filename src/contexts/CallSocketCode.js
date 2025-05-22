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
  } = useCall();

  const [socket, setSocket] = useState(null);
  const pendingCandidates = useRef([]);

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

  // Clean up everything
  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);

    if (socket && callIncoming?.from) {
      socket.emit("end_call", { peerId: callIncoming.from });
    }

    setCallIncoming(null);
    setShowCallPopup(false);
    setActiveCall(false);
    setCallAccepted(false);
    setCallEnded(true);
  };

  // Check mic permission
  const checkMic = async () => {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      return ["granted", "prompt"].includes(status.state);
    } catch {
      return true;
    }
  };

  // Connect socket once
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setSocket(connectVoiceSocket(token));
  }, []);

  // 1) Caller side: initiate call
  const callUser = async (receiverId, receiverName) => {
    if (!(await checkMic())) {
      return alert("Microphone access is required.");
    }
    setCallerName(receiverName);
    setShowCallPopup(true);
    setIsIncomingCall(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      const pc = new RTCPeerConnection(TURN_CONFIG);
      peerConnection.current = pc;

      // 1.a add our mic track
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log("Caller: added track", track.kind);
      });

      // 1.b ICE ? signaling
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice_candidate", {
            toUserId: receiverId,
            candidate: e.candidate,
          });
        }
      };

      // 1.c incoming remote streams
      pc.ontrack = (e) => {
        const remote = new MediaStream();
        e.streams[0].getTracks().forEach((t) => remote.addTrack(t));
        setRemoteStream(remote);
      };
      pc.oniceconnectionstatechange = () => {
        console.log("Caller ICE state:", pc.iceConnectionState);

        if (pc.iceConnectionState === "connected") {
          console.log("Call connected!");
          // setCallAccepted(true);
          setActiveCall(true); // Also start activeCall
          setShowCallPopup(true); // In case popup was hidden
        }

        if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected"
        ) {
          console.log("Call disconnected or failed");
          cleanupCall(); // Optional: End call if ICE fails
        }
      };
      pc.oniceconnectionstatechange = () =>
        console.log("Caller ICE state:", pc.iceConnectionState);
      // setCallAccepted(true);
      // 1.d create & send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Caller: setLocalDescription");

      socket.emit("call_user", { receiverId, signal: offer });
    } catch (err) {
      console.error("callUser error:", err);
      setShowCallPopup(false);
      alert("Cannot access mic.");
    }
  };

  // 2) Receiver side: answer incoming call
  const answerCall = async () => {
    // 0?? get the mic
    console.log("ANSWER CALL----");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setLocalStream(stream);

    // 1?? new peer
    const pc = new RTCPeerConnection(TURN_CONFIG);
    peerConnection.current = pc;

    // 2?? handlers first
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          toUserId: callIncoming.from,
          candidate: e.candidate,
        });
      }
    };
    pc.ontrack = (e) => {
      console.log("Receiver got a track:", e.track.kind);
      const remote = new MediaStream(e.streams[0].getTracks());
      setRemoteStream(remote);
    };

    // 3?? add your mic track
    stream.getTracks().forEach((t) => {
      console.log("Receiver: adding track", t.kind);
      pc.addTrack(t, stream);
    });

    // 4?? set the caller’s offer
    await pc.setRemoteDescription(
      new RTCSessionDescription(callIncoming.signal)
    );
    console.log("Receiver: remoteDescription set");

    // 5?? drain any early ICE candidates
    pendingCandidates.current.forEach((c) =>
      pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)
    );
    pendingCandidates.current = [];

    // 6?? create & send your answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log("Receiver: localDescription (answer) set");

    socket.emit("answer_call", {
      callerId: callIncoming.from,
      signal: answer,
    });

    setActiveCall(true);
    // setCallAccepted(true);
    setCallAccepted(true); // this must update state/context

    // DON’T hide the modal here—keep <audio> mounted
  };

  const rejectCall = () => {
    cleanupCall();
    socket?.emit("end_call", { peerId: callIncoming?.from });
  };

  // 3) Socket listeners (for BOTH sides)
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming_call", ({ from, signal }) => {
      setCallIncoming({ from, signal });
      setIsIncomingCall(true);
      setShowCallPopup(true);
      setCallerName(`${from}`);
    });

    socket.on("answer_call", async ({ answer }) => {
      const pc = peerConnection.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Caller: received remoteDescription (answer)=====>");
      setCallAccepted(true);
      pendingCandidates.current.forEach((c) =>
        pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)
      );
      pendingCandidates.current = [];
    });

    socket.on("ice_candidate", ({ candidate }) => {
      const pc = peerConnection.current;
      if (!pc) return;

      if (pc.remoteDescription?.type) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on("call_ended", cleanupCall);

    return () => {
      socket.off("incoming_call");
      socket.off("answer_call");
      socket.off("ice_candidate");
      socket.off("call_ended");
    };
  }, [socket]);

  return (
    <CallSocketContext.Provider
      value={{ callUser, answerCall, rejectCall, cleanupCall }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

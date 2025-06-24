import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Peer from "peerjs";
import { useCall } from "./CallContext";
import { useAuth } from "./useAuth";
import { connectVoiceSocket } from "../voiceSocket";
const CallSocketContext = createContext();
export const useCallSocket = () => useContext(CallSocketContext);
export function CallSocketProvider({ children }) {
  const {
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
    setActiveCall,
    setCallScreen,
    callIncoming,
  } = useCall();
  const { authToken, userId } = useAuth();
  const [peer, setPeer] = useState(null);
  const peerInstance = useRef(null);
  const voiceSocket = useRef(null);
  const ringtoneRef = useRef(null);
  const dialtoneRef = useRef(null);
  const playRingtone = () => {
    stopDialtone();
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/audio/ringtone.mp3");
      ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.play().catch(() => {});
  };
  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };
  const playDialtone = () => {
    stopRingtone();
    if (!dialtoneRef.current) {
      dialtoneRef.current = new Audio("/audio/dialing.mp3");
      dialtoneRef.current.loop = true;
    }
    dialtoneRef.current.play().catch(() => {});
  };
  const stopDialtone = () => {
    if (dialtoneRef.current) {
      dialtoneRef.current.pause();
      dialtoneRef.current.currentTime = 0;
    }
  };
  useEffect(() => {
    const id = userId;
    const peer = new Peer(id, {
      host: "apps.acme.in",
      port: 443,
      path: "/peerjs",
      secure: true,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });
    peerInstance.current = peer;
    setPeer(peer);
    peer.on("open", (id) => console.log("Peer open:", id));
    peer.on("call", async (call) => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setCallIncoming({ from: call.peer, roomId: call.metadata?.roomId });
      setIsIncomingCall(true);
      setShowCallPopup(true);
      playRingtone();
      call.answer(stream);
      call.on("stream", (remote) => {
        setRemoteStream(remote);
        setCallAccepted(true);
        setActiveCall(true);
        stopRingtone();
        setCallScreen("active");
      });
    });
    return () => peer.destroy();
  }, []);
  useEffect(() => {
    if (!authToken) return;
    const socket = connectVoiceSocket(authToken);
    voiceSocket.current = socket;
    socket.emit("register-user", userId);
    socket.on("incoming-call", ({ fromUserId, roomId }) => {
      setCallIncoming({ from: fromUserId, roomId });
      setIsIncomingCall(true);
      setShowCallPopup(true);
      playRingtone();
    });
    socket.on("call-accepted", ({ roomId }) => {
      const receiverId = localStorage.getItem("receiverId");
      const call = peerInstance.current.call(receiverId, localStream, {
        metadata: { roomId },
      });
      call.on("stream", (remote) => {
        setRemoteStream(remote);
        setCallAccepted(true);
        setActiveCall(true);
        setCallScreen("active");
      });
      stopDialtone();
    });
    socket.on("user-disconnected", (peerId) => {
      console.log("Call ended by other user:", peerId);
      cleanupCall();
      alert("Call was ended by the other user.");
    });
    return () => {
      socket.disconnect();
    };
  }, [authToken, localStream]);
  const callUser = async (userId, receiverId, receiverName, roomId) => {
    const socket = voiceSocket.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setLocalStream(stream);
    setCallerName(receiverName);
    setCallIncoming({ from: userId, roomId });
    setShowCallPopup(true);
    setCallScreen("dialing");
    playDialtone();
    localStorage.setItem("receiverId", receiverId);
    socket.emit("call-user", {
      fromUserId: userId,
      toUserId: receiverId,
      callType: "audio",
      roomId,
      name: receiverName,
    });
    setTimeout(() => {
      if (!remoteStream) {
        cleanupCall();
        alert("No response from user.");
      }
    }, 30000);
  };
  const answerCall = async (roomId) => {
    const socket = voiceSocket.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setLocalStream(stream);
    setCallAccepted(true);
    setActiveCall(true);
    setShowCallPopup(false);
    stopRingtone();
    socket.emit("join-room", { roomId, userId });
    socket.emit("call-accepted", { roomId });
  };
  const disconnectCall = () => {
    const socket = voiceSocket.current;
    if (callIncoming?.roomId) {
      socket.emit("disconnectuser", {
        userId,
        roomId: callIncoming.roomId,
      });
    }
    cleanupCall();
  };
  const rejectCall = () => {
    stopRingtone();
    setCallIncoming(null);
    setShowCallPopup(false);
    setCallAccepted(false);
    setActiveCall(false);
  };
  const cleanupCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    stopRingtone();
    stopDialtone();
    setLocalStream(null);
    setRemoteStream(null);
    setCallIncoming(null);
    setShowCallPopup(false);
    setActiveCall(false);
    setCallAccepted(false);
    setCallEnded(true);
    setCallScreen("idle");
  };
  return (
    <CallSocketContext.Provider
      value={{
        callUser,
        answerCall,
        rejectCall,
        disconnectCall,
        cleanupCall,
      }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

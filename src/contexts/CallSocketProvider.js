import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCall } from "./CallContext";
import { useChat } from "./ChatContext";
import Peer from "peerjs"; // Import PeerJS
import { connectVoiceSocket, getVoiceSocket } from "../voiceSocket";
import { useAuth } from "./useAuth";

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
  const { authToken, userId } = useAuth();

  const [peer, setPeer] = useState(null); // PeerJS peer instance
  const pendingCandidates = useRef([]);

  var socket = getVoiceSocket();

  useEffect(() => {
    socket = connectVoiceSocket(authToken);
  }, []);

  const ringtoneRef = useRef(null);
  const dialtoneRef = useRef(null);

  const dialRingtone = () => {
    stopRingtone(); // Ensure ringtone is not playing
    if (!dialtoneRef.current) {
      dialtoneRef.current = new Audio("/audio/dialing.mp3");
      dialtoneRef.current.loop = true;
    }
    dialtoneRef.current.play().catch((err) => {
      console.warn("Autoplay blocked (dialtone):", err);
    });
  };

  const playRingtone = () => {
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
  useEffect(() => {
    // const token = localStorage.getItem("authToken");

    // Initialize PeerJS
    const newPeer = new Peer(userId, {
      host: "apps.acme.in", // PeerJS server address
      port: 443,
      path: "/peerjs",
      secure: true,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // STUN server
      },
    });

    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("PeerJS connection established with ID:", id);
    });

    newPeer.on("call", (call) => {
      console.log("Received incoming call:", call);
      call.answer(localStream);
      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });
    });
  }, []);
  const setupPeerConnection = (stream, toUserId = null) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

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
        socket.emit("ice-candidate", candidateData);
      }
    };

    pc.ontrack = (e) => {
      const remote = new MediaStream(e.streams[0].getTracks());
      setRemoteStream(remote);
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "connected") {
        setActiveCall(true);
        setShowCallPopup(true);
      }
      if (["failed", "disconnected"].includes(state)) {
        cleanupCall();
      }
    };

    return pc;
  };

  const checkMic = async () => {
    try {
      navigator.permissions.query({ name: "microphone" }).then((status) => {
        console.log("Mic permission state:", status.state);
      });
      const status = await navigator.permissions.query({ name: "microphone" });
      return ["granted", "prompt"].includes(status.state);
    } catch (err) {
      return true;
    }
  };
  useEffect(() => {
    if (!socket) return;

    // const sock = getSocket();
    if (socket) {
      socket.on("incoming-call", ({ fromUserId, callType, roomId }) => {
        console.log(
          fromUserId,
          callType,
          roomId,
          " fromUserId, callType, roomId incoming-call"
        );

        playRingtone();
        setCallIncoming({ fromUserId, callType, roomId });
        setIsIncomingCall(true);
        setIsRinging(true);
        setShowCallPopup(true);
        setCallerName(`${fromUserId}`);
      });

      const handleCallRejected = ({ roomId, rejectedBy, message }) => {
        console.log(`🚫 Call was rejected by ${rejectedBy} in room ${roomId}`);
        setIsRinging(false);
        setCallIncoming(null);
        setShowCallPopup(false);
        setActiveCall(false);
        setCallAccepted(false);
        setCallEnded(true);
        cleanupCall();
      };
      const handleCallAccept = ({ roomId, acceptedBy, message }) => {
        console.log(roomId, acceptedBy, message, "handleCallAccept");
        socket.emit("join-room", { roomId, userId: acceptedBy });
      };
      const handleUserConnected = ({ userId }) => {
        console.log(userId, "handleUserConnected");
      };
      // socket.on('call-rejected', ({ roomId, fromUserId, toUserId })
      socket.on("call-rejected", handleCallRejected);
      socket.on("call-accepted", handleCallAccept);
      socket.on("user-connected", handleUserConnected);
      return () => {
        socket.off("incoming-call");
        socket.off("call-rejected", handleCallRejected);
        socket.off("call-accepted", handleCallAccept);
        socket.off("user-connected", handleUserConnected);
      };
    }
  }, [socket]);

  const cleanupCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);

    remoteStream?.getTracks().forEach((t) => t.stop());
    setRemoteStream(null);

    if (socket && callIncoming?.from) {
      socket.emit("call-ended", { peerId: callIncoming.from });
    }
    stopRingtone();
    stopDialtone();
    // setCallIncoming(null);
    // setShowCallPopup(false);
    // setActiveCall(false);
    // setCallAccepted(false);
    // setCallEnded(true);
  };

  const answerCall = async () => {
    try {
      // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // setLocalStream(stream);

      // const pc = setupPeerConnection(stream);
      // await pc.setRemoteDescription(
      //   new RTCSessionDescription(callIncoming.signal)
      // );

      // pendingCandidates.current.forEach((c) =>
      //   pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.error)
      // );
      // pendingCandidates.current = [];

      // const answer = await pc.createAnswer();
      // await pc.setLocalDescription(answer);

      socket.emit("call-accepted", {
        fromUserId: userId,
        toUserId: callIncoming.fromUserId,
        roomId: callIncoming.roomId,
      });
      socket.emit("join-room", {
        roomId: callIncoming.roomId,
        userId: userId,
      });
      stopRingtone();
      stopDialtone();
      setCallAccepted(true);
      setActiveCall(true);
    } catch (err) {
      console.error("Error answering call:", err);
      // alert("Could not answer the call.");
    }
  };
  const disconnectCall = () => {
    rejectCall();
  };
  const rejectCall = () => {
    console.log(callIncoming, "CALLINCOMING");
    //  setCallIncoming({ fromUserId, callType, roomId });
    const findCallerId =
      chatList.length > 0 &&
      chatList?.find((ele) => ele.first_name === callerName)?.user_id;
    // whose cut from user id
    if (socket) {
      socket?.emit("call-rejected", {
        roomId: callIncoming.roomId,
        fromUserId: userId,
        toUserId: findCallerId || callIncoming.fromUserId,
      });
    }
    setCallIncoming(null);
    setShowCallPopup(false);
    setActiveCall(false);
    setCallAccepted(false);
    setCallEnded(true);
    // const findCallerId =
    //   chatList.length > 0 &&
    //   chatList?.find((ele) => ele.first_name === callerName)?.user_id;
    // if (findCallerId) {
    //   socket?.emit("call-rejected", {
    //     roomId: findCallerId,
    //     fromUserId: findCallerId,
    //     toUserId: callIncoming?.from,
    //   });
    cleanupCall();
    // }
  };

  const callUser = async (userId, receiverId, roomId, callerName) => {
    console.log(
      userId,
      receiverId,
      roomId,
      callerName,
      "userId, receiverId, roomId, callerName"
    );

    // userId, chat.user_id, roomId, chat.first_name
    const hasMicPermission = await checkMic();
    if (!hasMicPermission) {
      alert(
        "Microphone access is blocked. Please allow mic access in browser settings."
      );
      return;
    }
    setCallIncoming({ userId, receiverId, roomId, callerName });
    setCallerName(callerName);
    setShowCallPopup(true);
    setIsIncomingCall(false);
    dialRingtone();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);

      const pc = setupPeerConnection(stream, receiverId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // {
      //   "fromUserId": "16",
      //   "toUserId": "15",
      //   "callType": "video",
      //   "roomId": "room123"
      // }
      console.log("socket.emit(call-user)", socket);

      socket.emit("call-user", {
        fromUserId: userId,
        toUserId: receiverId,
        callType: "audio",
        roomId: roomId,
      });
    } catch (err) {
      console.log(err, "call user");

      // alert("Cannot access mic.");
    }
  };

  const rejectGroupCall = () => {
    const findCallerId =
      chatList.length > 0 &&
      chatList?.find((ele) => ele.group_name === callerName)?.group_id;
    if (findCallerId) {
      socket?.emit("call-rejected", {
        roomId: findCallerId,
        fromUserId: findCallerId,
        toUserId: callIncoming?.from,
      });
      cleanupCall();
    }
  };

  return (
    <CallSocketContext.Provider
      value={{
        callUser,
        answerCall,
        rejectCall,
        rejectGroupCall,
        cleanupCall,
        disconnectCall,
      }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

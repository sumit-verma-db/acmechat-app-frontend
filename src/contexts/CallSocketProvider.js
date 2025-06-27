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
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const [peer, setPeer] = useState(null); // PeerJS peer instance
  const [peerReady, setPeerReady] = useState(false);

  const pendingCandidates = useRef([]);

  var socket = getVoiceSocket();
  // console.log(socket, "SOCKET");

  // useEffect(() => {
  //   socket = connectVoiceSocket(authToken);
  // }, []);
  useEffect(() => {
    if (!socket) {
      socket = connectVoiceSocket(authToken, userId);
    }
    // socket.on("connect", () => {
    //   console.log("✅ Socket connected:", socket.id);
    //   if (userId) {
    //     socket.emit("register-user", userId); // ✅ Fix: register yourself after reconnect
    //     console.log("📌 Registered user after reconnect:", userId);
    //   }
    // });
  }, [authToken, userId]); // make sure this fires on refresh

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

  // Initialize PeerJS
  useEffect(() => {
    if (!userId) return;

    const newPeer = new Peer(String(userId), {
      host: "apps.acme.in",
      port: 5001,
      path: "/peerjs",
      secure: true,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });
    peerRef.current = newPeer;
    console.log(newPeer, "NEW PEER");

    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("✅ PeerJS connected:", id, typeof id);
      setPeerReady(true); // <-- MARK AS READY
    });
    newPeer.on("error", (err) => {
      console.error("❌ PeerJS error:", err);
    });
    // MODIFIED: Improved on('call') logic with consistent mic access and autoplay audio
    newPeer.on("call", async (call) => {
      console.log(":telephone_receiver: Incoming call...", call);
      currentCallRef.current = call;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Fix: assign directly to ref so it's instantly usable
        setLocalStream(stream);
        localStreamRef.current = stream;
        // setLocalStream(stream);
        call.answer(stream);

        call.on("stream", (remoteStream) => {
          console.log(
            ":satellite_antenna: Received remote stream",
            remoteStream
          );
          setRemoteStream(remoteStream);
          remoteStreamRef.current = remoteStream; // ✅ Save for fallback cleanup
        });

        call.on("close", () => {
          console.log(":x: PeerJS call closed");
          stopRingtone();
          stopDialtone();
          setCallIncoming(null);
          setShowCallPopup(false);
          setActiveCall(false);
          setCallAccepted(false);
          setCallEnded(true);
          cleanupCall();
        });
        call.on("error", console.error);
      } catch (err) {
        console.error("Error answering call:", err);
      }
    });

    return () => {
      newPeer.destroy();
    };
  }, [userId]);

  useEffect(() => {
    console.log("localStream---", localStream);
    console.log("remoteStream---", remoteStream);
  }, [localStream, remoteStream]);

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
        if (currentCallRef.current) {
          console.log("📞 Closing current outgoing call from caller side");
          currentCallRef.current.close(); // ✅ Explicitly stop call
          currentCallRef.current = null;
        } else {
          console.warn("No active PeerJS call found, forcing cleanup");
        }

        cleanupCall();
        setIsRinging(false);
        setCallIncoming(null);
        setShowCallPopup(false);
        setActiveCall(false);
        setCallAccepted(false);
        setCallEnded(true);
      };
      const handleCallAccept = async ({ roomId, acceptedBy }) => {
        console.log("✅ Receiver accepted the call");

        stopRingtone();
        stopDialtone();
        setCallAccepted(true);
        setActiveCall(true);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setLocalStream(stream);
          localStreamRef.current = stream;

          const call = peerRef.current.call(String(acceptedBy), stream);
          currentCallRef.current = call;

          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            remoteStreamRef.current = remoteStream;
          });

          call.on("close", () => {
            console.log("📴 Call closed");
            cleanupCall();
          });

          call.on("error", (err) => {
            console.error("🚨 Error in call:", err);
          });

          socket.emit("join-room", { roomId, userId });
        } catch (err) {
          console.error("❌ Failed to call after accept", err);
        }
      };

      // const handleCallAccept = ({ roomId, acceptedBy, message }) => {
      //   // console.log(
      //   //   roomId,
      //   //   "====" + acceptedBy + "====",
      //   //   message,
      //   //   "handleCallAccept"
      //   // );
      //   stopRingtone();
      //   stopDialtone();
      //   setCallAccepted(true);
      //   setActiveCall(true);
      //   socket.emit("join-room", { roomId, userId: userId });
      //   // const call = peer.call(String(callIncoming.toUserId), localStream);
      //   // call.on("stream", (remoteStream) => {
      //   //   console.log("📡 Received remote audio stream");
      //   //   setRemoteStream(remoteStream);
      //   // });
      // };
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
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clean everything before refresh
      if (currentCallRef.current) {
        currentCallRef.current.close();
      }
      cleanupCall(); // 🧹 Stop mic, peer, etc.

      // Optional: notify the other user
      if (socket && callIncoming?.roomId && userId) {
        socket.emit("call-rejected", {
          roomId: callIncoming.roomId,
          fromUserId: userId,
          toUserId: callIncoming?.fromUserId,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, callIncoming, userId]);

  const cleanupCall = async () => {
    console.log("🧹 Starting cleanup call...");

    // Close RTCPeerConnection if exists
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream || localStreamRef.current) {
      const stream = localStream || localStreamRef.current;
      console.log("🎤 Stopping local stream tracks");
      stream.getTracks().forEach((track) => {
        console.log(`Stopping track: ${track.kind} - ${track.label}`);
        track.stop();
      });
      setLocalStream(null);
      localStreamRef.current = null;
    } else {
      console.warn("⚠️ No local stream found, trying fallback mic stop");
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        tempStream.getTracks().forEach((track) => {
          console.log("[cleanupCall] Fallback: forcibly stopping mic track");
          track.stop();
        });
      } catch (err) {
        console.warn("⚠️ Could not access fallback mic stream:", err);
      }
    }

    if (remoteStream || remoteStreamRef.current) {
      const stream = remoteStream || remoteStreamRef.current;

      console.log("🔊 Stopping remote stream tracks");
      stream.getTracks().forEach((track) => {
        console.log(`Stopping remote track: ${track.kind} - ${track.label}`);
        track.stop();
      });

      setRemoteStream(null);
      remoteStreamRef.current = null;
    } else {
      console.warn(
        "⚠️ No remote stream found, trying fallback remote mic stop"
      );
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        tempStream.getTracks().forEach((track) => {
          console.log(
            "[cleanupCall] Fallback: forcibly stopped remote mic track"
          );
          track.stop();
        });
      } catch (err) {
        console.warn("⚠️ Could not access fallback remote mic stream:", err);
      }
    }

    // Remove any audio elements that might be playing
    document.querySelectorAll("audio").forEach((audio) => {
      if (audio.srcObject) {
        const stream = audio.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach((track) => track.stop());
        }
        audio.srcObject = null;
      }
      audio.pause();
    });

    // Close PeerJS call if active
    if (peerRef.current && !peerRef.current.destroyed) {
      // Get all active calls and close them
      Object.values(peerRef.current.connections).forEach((connections) => {
        connections.forEach((connection) => {
          if (connection.type === "media") {
            connection.close();
          }
        });
      });
    }

    // Stop audio playback
    stopRingtone();
    stopDialtone();

    console.log("✅ Cleanup completed");
  };

  const answerCall = async () => {
    try {
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
  const disconnectCall = async () => {
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

    cleanupCall();
    // }
  };

  const callUser = async (userId, receiverId, roomId, callerName) => {
    if (!peerRef.current || peerRef.current.disconnected) {
      console.warn("PeerJS not ready or disconnected");
      return;
    }
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
      localStreamRef.current = stream; // ✅ THIS IS MISSING

      // // ✅ Only call after setting peer and getting stream
      // if (peerReady) {
      //   const call = peerRef.current.call(String(receiverId), stream);
      //   currentCallRef.current = call; // ✅ Save this reference

      //   if (!call) {
      //     console.error(
      //       "❌ peer.call() failed: peer is null or connection not ready"
      //     );
      //     return;
      //   }

      //   call.on("stream", (remoteStream) => {
      //     console.log("📡 Got remote stream in callUser");
      //     setRemoteStream(remoteStream); // <-- NOW works
      //   });

      //   call.on("error", (err) => {
      //     console.error("🚨 Error in call:", err);
      //   });
      // } else {
      //   console.warn("Peer not ready yet — delaying call...");
      // }

      socket.emit("call-user", {
        fromUserId: Number(userId),
        toUserId: Number(receiverId),
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

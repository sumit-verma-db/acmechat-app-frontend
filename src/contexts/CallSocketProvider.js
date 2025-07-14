import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCall } from "./CallContext";
import { useChat } from "./ChatContext";
import SimplePeer from "simple-peer";
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
    setMicList,
    setMicActive,
    setCurrentMicId,
    setCurrentMicLabel,
    setSpeakerList,
    setCurrentSpeakerId,
    setCurrentSpeakerLabel,
    currentMicId,
    currentSpeakerId,
    remoteMuted,
    setRemoteMuted,
    participants,
    setParticipants,
  } = useCall();
  const { chatList = [] } = useChat() || {};
  const { authToken, userId } = useAuth();
  const currentPeer = useRef(null);
  const [pendingOffer, setPendingOffer] = useState(null); // for callee
  const [offerFromUserId, setOfferFromUserId] = useState(null); // for callee
  const peerRef = useRef(null);
  const currentCallRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const addParticipant = ({ userId, name, isMuted, isLocal }) => {
    setParticipants((prev) => {
      if (prev.some((p) => p.userId === Number(userId))) return prev;
      return [...prev, { userId, name, isMuted, isLocal }];
    });
  };
  const [peer, setPeer] = useState(null); // PeerJS peer instance
  const [peerReady, setPeerReady] = useState(false);

  const pendingCandidates = useRef([]);

  var socket = getVoiceSocket();

  useEffect(() => {
    if (!socket) {
      socket = connectVoiceSocket(authToken, userId);
    }
  }, [authToken, userId]);

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
  // useEffect(() => {
  //   if (!userId) return;

  //   const newPeer = new Peer(String(userId), {
  //     host: "apps.acme.in",
  //     port: 5001,
  //     path: "/peerjs",
  //     secure: true,
  //     debug: 3,
  //     config: {
  //       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  //     },
  //   });
  //   peerRef.current = newPeer;

  //   setPeer(newPeer);

  //   newPeer.on("open", (id) => {
  //     console.log("✅ PeerJS connected:", id, typeof id);
  //     setPeerReady(true); // <-- MARK AS READY
  //   });
  //   newPeer.on("error", (err) => {
  //     console.error("❌ PeerJS error:", err);
  //   });

  //   newPeer.on("call", async (call) => {
  //     currentCallRef.current = call;
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         audio: {
  //           deviceId: currentMicId ? { exact: currentMicId } : undefined,
  //         },
  //       });
  //       setLocalStream(stream);
  //       localStreamRef.current = stream;
  //       monitorMicActivity(stream);

  //       call.answer(stream);

  //       call.on("stream", (remoteStream) => {
  //         setRemoteStream(remoteStream);
  //         remoteStreamRef.current = remoteStream; // ✅ Save for fallback cleanup
  //       });

  //       call.on("close", () => {
  //         stopRingtone();
  //         stopDialtone();
  //         setCallIncoming(null);
  //         setShowCallPopup(false);
  //         setActiveCall(false);
  //         setCallAccepted(false);
  //         setCallEnded(true);
  //         cleanupCall();
  //       });
  //       call.on("error", console.error);
  //     } catch (err) {
  //       console.error("Error answering call:", err);
  //     }
  //   });

  //   return () => {
  //     newPeer.destroy();
  //   };
  // }, [userId]);

  const checkMic = async () => {
    try {
      navigator.permissions.query({ name: "microphone" }).then((status) => {});
      const status = await navigator.permissions.query({ name: "microphone" });
      return ["granted", "prompt"].includes(status.state);
    } catch (err) {
      return true;
    }
  };
  useEffect(() => {
    if (!socket) return;

    if (socket) {
      // ----- 1. RECEIVE OFFER (as callee) -----
      const handleReceiveOffer = ({ fromUserId, signal }) => {
        setPendingOffer(signal);
        setOfferFromUserId(fromUserId);
        setIsIncomingCall(true);
        setShowCallPopup(true);
        playRingtone();
        // UI will show "Incoming call", on accept you use signal in answerCall()
      };

      // ----- 2. RECEIVE ANSWER (as caller) -----
      const handleReceiveAnswer = ({ signal }) => {
        // This is used only on caller side, after you send offer and callee accepted
        if (currentPeer.current) {
          currentPeer.current.signal(signal);
        }
      };
      socket.on("incoming-call", ({ fromUserId, callType, roomId, name }) => {
        addParticipant({
          userId: fromUserId,
          name,
          isMuted: false,
          isLocal: false,
        });
        addParticipant({ userId, name: "You", isMuted: false, isLocal: true });

        playRingtone();
        setCallIncoming({ fromUserId, callType, roomId, name });
        setIsIncomingCall(true);
        setIsRinging(true);
        setShowCallPopup(true);
        setCallerName(`${fromUserId}`);
      });

      const handleCallRejected = ({ roomId, rejectedBy, message }) => {
        if (currentCallRef.current) {
          currentCallRef.current.close();
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

          // const call = peerRef.current.call(String(acceptedBy), stream);

          // currentCallRef.current = call;

          // call.on("stream", (remoteStream) => {
          //   setRemoteStream(remoteStream);
          //   remoteStreamRef.current = remoteStream;
          // });

          // call.on("close", () => {
          //   cleanupCall();
          // });

          // call.on("error", (err) => {
          //   console.error("🚨 PeerJS call error:", err);
          // });

          socket.emit("join-room", { roomId, userId });
        } catch (err) {
          console.error("❌ Failed to call after accept:", err);
        }
      };

      const handleUserConnected = ({ userId }) => {
        // console.log(userId, "handleUserConnected");
      };
      // Only set up listeners once, or on socket change
      socket.on("receive-offer-signal", handleReceiveOffer);
      socket.on("receive-answer-signal", handleReceiveAnswer);

      socket.on("call-rejected", handleCallRejected);
      socket.on("call-accepted", handleCallAccept);
      socket.on("user-connected", handleUserConnected);
      socket.on("peer-mic-status", ({ userId: peerId, isMuted }) => {
        setRemoteMuted(isMuted);
        setParticipants((prev) =>
          prev.map((p) => (p.userId === peerId ? { ...p, isMuted } : p))
        );
      });
      return () => {
        socket.off("incoming-call");
        socket.off("receive-offer-signal", handleReceiveOffer);
        socket.off("receive-answer-signal", handleReceiveAnswer);
        socket.off("call-rejected", handleCallRejected);
        socket.off("call-accepted", handleCallAccept);
        socket.off("user-connected", handleUserConnected);
      };
    }
  }, [socket]);
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentCallRef.current) {
        currentCallRef.current.close();
      }
      cleanupCall();

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
    setParticipants([]);

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (micMonitorInterval) {
      clearInterval(micMonitorInterval);
      micMonitorInterval = null;
    }
    setMicActive(false);
    // console.log(localStream.getTracks(), remoteStream, "MIC CHECK------------");

    if (localStream || localStreamRef.current) {
      const stream = localStream || localStreamRef.current;

      stream.getTracks().forEach((track) => {
        console.log(track, "TRACK 1");
        track.stop();
        console.log(track, "TRACK 2");
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
          // console.log("[cleanupCall] Fallback: forcibly stopping mic track");
          track.stop();
        });
      } catch (err) {
        console.warn("⚠️ Could not access fallback mic stream:", err);
      }
    }

    if (remoteStream || remoteStreamRef.current) {
      const stream = remoteStream || remoteStreamRef.current;

      stream.getTracks().forEach((track) => {
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
    setTimeout(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const mics = devices.filter((d) => d.kind === "audioinput");
        console.log("All mics after cleanup:", mics);
      });
    }, 1500);
    if (peerRef.current && !peerRef.current.destroyed) {
      Object.values(peerRef.current.connections).forEach((connections) => {
        connections.forEach((connection) => {
          if (connection.type === "media") {
            connection.close();
          }
        });
      });
    }

    stopRingtone();
    stopDialtone();
  };
  const answerCall = async () => {
    stopRingtone();
    setCallAccepted(true);
    setActiveCall(true);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: currentMicId ? { exact: currentMicId } : undefined },
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      monitorMicActivity(stream);
    } catch (err) {
      console.error("Mic error:", err);
      return;
    }

    // --- Create SimplePeer as callee
    currentPeer.current = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });
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
    // On 'signal', send answer to the original offerer
    currentPeer.current.on("signal", (data) => {
      if (offerFromUserId) {
        socket.emit("send-answer-signal", {
          toUserId: offerFromUserId,
          signal: data,
        });
      }
    });

    currentPeer.current.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
      remoteStreamRef.current = remoteStream;
    });

    currentPeer.current.on("close", cleanupCall);
    currentPeer.current.on("error", (err) => {
      console.error("simple-peer error:", err);
      cleanupCall();
    });

    // Accept the offer signal!
    if (pendingOffer) {
      currentPeer.current.signal(pendingOffer);
    }
  };

  // const answerCall = async () => {
  //   try {
  //     socket.emit("call-accepted", {
  //       fromUserId: userId,
  //       toUserId: callIncoming.fromUserId,
  //       roomId: callIncoming.roomId,
  //     });
  //     socket.emit("join-room", {
  //       roomId: callIncoming.roomId,
  //       userId: userId,
  //     });
  //     stopRingtone();
  //     stopDialtone();
  //     setCallAccepted(true);
  //     setActiveCall(true);
  //   } catch (err) {
  //     console.error("Error answering call:", err);
  //   }
  // };
  const disconnectCall = async () => {
    rejectCall();
  };
  const rejectCall = () => {
    const findCallerId =
      chatList.length > 0 &&
      chatList?.find((ele) => ele.email === callerName.receiverEmail)?.user_id;

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
  };

  const callUser = async (
    userId,
    receiverId,
    roomId,
    callerName,
    receiverEmail
  ) => {
    // UI/participant state as before...
    setCallIncoming({ userId, receiverId, roomId, callerName });
    setCallerName({ callerName, receiverId, receiverEmail });
    addParticipant({ userId, name: "You", isMuted: false, isLocal: true });
    addParticipant({
      userId: receiverId,
      name: callerName,
      isMuted: false,
      isLocal: false,
    });

    setShowCallPopup(true);
    setIsIncomingCall(false);
    dialRingtone();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: currentMicId ? { exact: currentMicId } : undefined },
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      monitorMicActivity(stream);
    } catch (err) {
      console.error("Mic error:", err);
      return;
    }

    // --- Create SimplePeer initiator
    currentPeer.current = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    // --- Send offer to callee via socket
    currentPeer.current.on("signal", (data) => {
      socket.emit("send-offer-signal", {
        toUserId: receiverId,
        signal: data,
      });
    });

    // --- On receiving remote stream
    currentPeer.current.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
      remoteStreamRef.current = remoteStream;
    });

    currentPeer.current.on("close", cleanupCall);
    currentPeer.current.on("error", (err) => {
      console.error("simple-peer error:", err);
      cleanupCall();
    });

    // --- Receive answer from callee
    // socket.off("receive-answer-signal"); // Avoid double listeners
    // socket.on("receive-answer-signal", ({ signal }) => {
    //   currentPeer.current && currentPeer.current.signal(signal);
    // });

    // --- (Optional: trigger your previous socket state events)
    socket.emit("call-user", {
      fromUserId: Number(userId),
      toUserId: Number(receiverId),
      callType: "audio",
      roomId: roomId,
    });
  };

  const callGroup = (group_id, groupName) => {
    console.log(group_id, groupName, "callGroup");
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
  let micMonitorInterval = null;

  const monitorMicActivity = (stream) => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      if (micMonitorInterval) clearInterval(micMonitorInterval);

      micMonitorInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        // console.log("Mic volume:", avg);
        setMicActive(avg > 5); // Adjust threshold as needed
      }, 300);
    } catch (err) {
      console.warn("Mic monitor error:", err);
      setMicActive(false);
    }
  };
  useEffect(() => {
    const updateAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const mics = devices.filter((d) => d.kind === "audioinput");
        const speakers = devices.filter((d) => d.kind === "audiooutput");

        setMicList(mics);
        setSpeakerList(speakers);

        if (mics.length > 0 && !currentMicId) {
          setCurrentMicId(mics[0].deviceId);
          setCurrentMicLabel(mics[0].label || "Mic");
        }

        if (speakers.length > 0 && !currentSpeakerId) {
          setCurrentSpeakerId(speakers[0].deviceId);
          setCurrentSpeakerLabel(speakers[0].label || "Speaker");
        }
      } catch (err) {
        console.warn("🎤 Failed to get audio devices:", err);
      }
    };

    // Permission must be granted to access mic/speaker labels
    // navigator.mediaDevices
    //   .getUserMedia({ audio: true })
    //   .then(() => updateAudioDevices())
    //   .catch((err) => {
    //     console.warn("Microphone permission denied:", err);
    //   });

    // navigator.mediaDevices.addEventListener("devicechange", updateAudioDevices);

    // return () =>
    //   navigator.mediaDevices.removeEventListener(
    //     "devicechange",
    //     updateAudioDevices
    //   );
  }, []);
  const IndicateMic = () => {
    const newMuteState = !remoteMuted;
    setRemoteMuted(newMuteState);

    if (socket && callIncoming?.roomId && userId) {
      socket.emit("mic-status-change", {
        roomId: callIncoming.roomId,
        userId,
        isMuted: newMuteState,
      });
    }
  };
  return (
    <CallSocketContext.Provider
      value={{
        callUser,
        callGroup,
        answerCall,
        rejectCall,
        rejectGroupCall,
        cleanupCall,
        disconnectCall,
        IndicateMic,
      }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

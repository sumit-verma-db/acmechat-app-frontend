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
import { Alert, Snackbar } from "@mui/material";

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
    showCallPopup,
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
      // 1. Check permission
      const status = await navigator.permissions.query({ name: "microphone" });
      if (!["granted", "prompt"].includes(status.state)) {
        return false;
      }
      // 2. Check for at least one audioinput device
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some((d) => d.kind === "audioinput");
      return hasMic;
    } catch (err) {
      // fallback: optimistic, but not 100% safe
      return false;
    }
  };
  useEffect(() => {
    if (!socket) return;
    const handleCallRejected = ({ roomId, rejectedBy, message }) => {
      console.log(roomId, rejectedBy, message, "handleCallRejected");

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

    // --- 1. Caller receives "call-accepted" from callee, then starts SimplePeer and offer ---
    const handleCallAccepted = async ({ roomId, acceptedBy }) => {
      console.log(roomId, acceptedBy, "handleCallAccepted");

      stopRingtone();
      stopDialtone();
      setCallAccepted(true);
      setActiveCall(true);
    };

    // --- 2. Callee receives offer from caller after answering, then starts SimplePeer as non-initiator ---
    const handleReceiveOffer = async ({ fromUserId, signal }) => {
      let stream;
      try {
        console.log("handleReceiveOffer");

        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: currentMicId ? { exact: currentMicId } : undefined,
          },
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        monitorMicActivity(stream);
      } catch (err) {
        console.error("Mic error:", err);
        return;
      }
      console.log(currentPeer, "CURRENT PEER RECEIVE 2");

      // 🔥 Create SimplePeer as non-initiator (callee)
      // if (currentPeer.current) currentPeer.current.destroy();
      currentPeer.current = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:apps.acme.in:5002" },
            {
              urls: "turns:apps.acme.in:5002?transport=udp",
              username: "acmechat",
              credential: "Veer@1234",
            },
            // Add TURN for prod
          ],
        },
      });
      console.log(currentPeer, "CURENT PEER RECEIVE 2.1");
      setPendingOffer(signal);
    };

    // --- 3. Caller receives answer and completes connection ---
    const handleReceiveAnswer = ({ signal }) => {
      if (currentPeer.current) {
        currentPeer.current.signal(signal);
      }
    };

    // --- 4. Incoming call event (callee side only shows UI!) ---
    const handleIncomingCall = ({ fromUserId, callType, roomId, name }) => {
      console.log(
        fromUserId,
        callType,
        roomId,
        name,
        "INCOMMING CALLL RECEIVED-------"
      );

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
    };

    // --- 5. Register all listeners ---
    socket.on("call-rejected", handleCallRejected);

    socket.on("receive-offer-signal", handleReceiveOffer); // callee only, after answer receiver
    socket.on("receive-answer-signal", handleReceiveAnswer); // caller only
    socket.on("incoming-call", handleIncomingCall); // callee only
    socket.on("call-accepted", handleCallAccepted); // caller only
    socket.on("peer-mic-status", ({ userId: peerId, isMuted }) => {
      console.log(peerId, isMuted, "peer-mic-status");

      setRemoteMuted(isMuted);
      setParticipants((prev) =>
        prev.map((p) => (p.userId == peerId ? { ...p, isMuted } : p))
      );
    });

    // ... your other listeners for call-rejected, etc.

    return () => {
      socket.off("call-rejected", handleCallRejected);
      socket.off("peer-mic-status");

      socket.off("receive-offer-signal", handleReceiveOffer);
      socket.off("receive-answer-signal", handleReceiveAnswer);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      // ...off others...
    };
  }, [socket, currentMicId]); // 🔥 add currentMicId so correct mic is used
  useEffect(() => {
    console.log("handleBeforeUnload");

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
  useEffect(() => {
    console.log(participants, "PARTICIPANTS");
  }, [participants]);

  const cleanupCall = async () => {
    setParticipants([]);

    // STOP interval before anything else
    if (micMonitorInterval.current) {
      clearInterval(micMonitorInterval.current);
      micMonitorInterval.current = null;
      console.log(
        "[cleanupCall] micMonitorInterval cleared at",
        new Date().toLocaleTimeString()
      );
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
    }

    if (remoteStream || remoteStreamRef.current) {
      const stream = remoteStream || remoteStreamRef.current;

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      setRemoteStream(null);
      remoteStreamRef.current = null;
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
    // setTimeout(() => {
    //   navigator.mediaDevices.enumerateDevices().then((devices) => {
    //     const mics = devices.filter((d) => d.kind === "audioinput");
    //     console.log("All mics after cleanup:", mics);
    //   });
    // }, 1500);
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
    // Just emit! Wait for receive-offer-signal.
    socket.emit("call-accepted", {
      fromUserId: userId,
      toUserId: callIncoming.fromUserId,
      roomId: callIncoming.roomId,
    });
    currentPeer.current.on("signal", (data) => {
      // Send answer back to caller
      console.log(data, "RECEIVE SIGNAL 2");

      socket.emit("send-answer-signal", {
        toUserId: callIncoming.fromUserId,
        signal: data,
      });
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
    stopRingtone();
    stopDialtone();
    setCallAccepted(true);
    setActiveCall(true);
    socket.emit("join-room", {
      roomId: callIncoming.roomId,
      userId: userId,
    });
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
    if (userId == receiverId) {
      return;
    }
    console.log(userId, receiverId, "CHECK USERID RECEIVER ID");
    console.log(checkMic, "CHECK MIC");

    const micAllowed = await checkMic();
    if (!micAllowed) {
      alert(
        "Microphone access is required to make a call. Please enable it in your browser settings."
      );
      return;
      // Instead of alert, set an error state to show a toast/snackbar
      // <Snackbar
      //   open
      //   autoHideDuration={6000}
      //   // onClose={() => setMicPermissionError(null)}
      // >
      //   <Alert severity="error">
      //     Microphone access is blocked or denied. Please enable your mic in
      //     browser settings and try again.
      //   </Alert>
      // </Snackbar>;
      // return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: currentMicId ? { exact: currentMicId } : undefined,
        },
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      monitorMicActivity(stream);
      console.log(currentPeer, "CURENT PEER 1");

      // 🔥 Create SimplePeer as initiator (caller)
      // if (currentPeer.current) currentPeer.current.destroy();
      currentPeer.current = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:apps.acme.in:5002" },
            {
              urls: "turns:apps.acme.in:5002?transport=udp",
              username: "acmechat",
              credential: "Veer@1234",
            },
            // Add TURN for prod
          ],
        },
      });

      // When ready, send offer to callee
      console.log(currentPeer, "CURRENT PEER---------1.2");

      currentPeer.current.on("signal", (data) => {
        console.log(data, "signal send 1");

        socket.emit("send-offer-signal", {
          toUserId: receiverId,
          signal: data,
        });
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

      socket.emit("join-room", { roomId, userId });
    } catch (err) {
      console.error("❌ Failed to call after accept:", err);
    }

    socket.emit("call-user", {
      fromUserId: Number(userId),
      toUserId: Number(receiverId),
      callType: "audio",
      roomId: roomId,
    });
    // UI/participant state as before...
    setCallIncoming({ userId, fromUserId: receiverId, roomId, callerName });
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

    // DO NOT CREATE PEER OR STREAM YET! Wait for call-accepted event.
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
  const micMonitorInterval = useRef(null);
  const micAudioContextRef = useRef(null);

  const monitorMicActivity = (stream) => {
    try {
      if (
        micAudioContextRef.current &&
        micAudioContextRef.current.state !== "closed"
      ) {
        micAudioContextRef.current.close();
        micAudioContextRef.current = null;
      }
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      micAudioContextRef.current = audioContext; // <-- Track it for cleanup
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      if (micMonitorInterval.current) clearInterval(micMonitorInterval.current);

      micMonitorInterval.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const avg =
          dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        setMicActive(avg > 5);
      }, 300);
    } catch (err) {
      setMicActive(false);
    }
  };
  const ListAllAudioMic = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const mics = devices.filter((d) => d.kind === "audioinput");
      const speakers = devices.filter((d) => d.kind === "audiooutput");
      console.log(mics, speakers, "MICS----Speakers");
      setMicList(mics);
      setSpeakerList(speakers);

      // Set default mic if not set
      if (mics.length > 0 && !currentMicId) {
        setCurrentMicId(mics[0].deviceId);
        setCurrentMicLabel(mics[0].label || "Mic");
      }
      // Set default speaker if not set
      if (speakers.length > 0 && !currentSpeakerId) {
        setCurrentSpeakerId(speakers[0].deviceId);
        setCurrentSpeakerLabel(speakers[0].label || "Speaker");
      }
    } catch (err) {
      console.warn("🎤 Failed to get audio devices:", err);
    }
  };
  useEffect(() => {
    if (showCallPopup) {
      ListAllAudioMic();
      // Listen for device hot-plug
      navigator.mediaDevices.addEventListener("devicechange", ListAllAudioMic);
    }
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        ListAllAudioMic
      );
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [showCallPopup]);
  const switchMicDevice = async (deviceId) => {
    // Stop old tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    // Get new stream with selected mic
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    });
    setLocalStream(newStream);
    localStreamRef.current = newStream;

    // If using SimplePeer, replace the audio track (hot-swap)
    if (currentPeer.current) {
      const [newAudioTrack] = newStream.getAudioTracks();
      const sender = currentPeer.current._pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "audio");
      if (sender && newAudioTrack) {
        sender.replaceTrack(newAudioTrack);
      }
    }
  };

  const switchSpeakerDevice = (deviceId, audioElementRef) => {
    if (
      audioElementRef.current &&
      typeof audioElementRef.current.setSinkId === "function"
    ) {
      audioElementRef.current.setSinkId(deviceId).catch((err) => {
        console.warn("Failed to set audio output device:", err);
      });
    }
  };

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
        checkMic,
        callUser,
        callGroup,
        answerCall,
        rejectCall,
        rejectGroupCall,
        cleanupCall,
        disconnectCall,
        IndicateMic,
        switchMicDevice,
        switchSpeakerDevice,
      }}
    >
      {children}
    </CallSocketContext.Provider>
  );
}

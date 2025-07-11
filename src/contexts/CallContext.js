// contexts/CallContext.js
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [isRinging, setIsRinging] = useState(false);

  const [callIncoming, setCallIncoming] = useState(null); // { from, offer }
  const [localStream, setLocalStream] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [callScreen, setCallScreen] = useState("idle"); // 'idle', 'dialing', 'receiving', 'active'
  // MIC STATUS and MIC SELECTION
  const [micActive, setMicActive] = useState(false);
  const [micList, setMicList] = useState([]);
  const [currentMicId, setCurrentMicId] = useState("");
  const [currentMicLabel, setCurrentMicLabel] = useState("");
  const [remoteMuted, setRemoteMuted] = useState(false);
  // participant logic

  const [participants, setParticipants] = useState([]);
  // 🎧 Speaker Selection
  const [speakerList, setSpeakerList] = useState([]);
  const [currentSpeakerId, setCurrentSpeakerId] = useState("");
  const [currentSpeakerLabel, setCurrentSpeakerLabel] = useState("");
  // useEffect(() => {
  //   console.log("callIncoming:", callIncoming);
  //   console.log("localStream:", localStream);
  //   console.log("activeCall:", activeCall);
  //   console.log("remoteStream:", remoteStream);
  //   console.log("callAccepted:", callAccepted);
  //   console.log("callEnded:", callEnded);
  //   console.log("showCallPopup:", showCallPopup);
  //   console.log("isIncomingCall:", isIncomingCall);
  //   console.log("callerName:", callerName);
  // }, [
  //   callIncoming,
  //   localStream,
  //   activeCall,
  //   remoteStream,
  //   callAccepted,
  //   callEnded,
  //   showCallPopup,
  //   isIncomingCall,
  //   callerName,
  // ]);

  const peerConnection = useRef(null);

  return (
    <CallContext.Provider
      value={{
        showCallPopup,
        setIsRinging,
        isRinging,
        setShowCallPopup,
        isIncomingCall,
        setCallerName,
        callerName,
        callIncoming,
        setCallIncoming,
        setIsIncomingCall,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        callAccepted,
        activeCall,
        setActiveCall,
        setCallAccepted,
        callEnded,
        setCallEnded,
        peerConnection,
        setSocket,
        socket,
        // ✅ New:
        callScreen,
        setCallScreen,
        // Mic status & Mic Selector
        micActive,
        setMicActive,
        micList,
        setMicList,
        currentMicId,
        setCurrentMicId,
        currentMicLabel,
        setCurrentMicLabel,
        remoteMuted,
        setRemoteMuted,
        // 🔊 Speaker selector
        speakerList,
        setSpeakerList,
        currentSpeakerId,
        setCurrentSpeakerId,
        currentSpeakerLabel,
        setCurrentSpeakerLabel,
        participants,
        setParticipants,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);

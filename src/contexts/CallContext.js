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
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);

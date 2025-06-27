import React, { useState, useEffect } from "react";
import { useCallSocket } from "./CallSocketProvider";
import { useCall } from "./CallContext";
import { useAuth } from "./useAuth";

const CallDebugger = () => {
  const { socketConnected } = useCallSocket();
  const {
    callIncoming,
    localStream,
    remoteStream,
    isIncomingCall,
    callAccepted,
    activeCall,
    isRinging,
    callerName,
  } = useCall();
  const { authToken, userId } = useAuth();

  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        socketConnected,
        authToken: !!authToken,
        userId,
        callIncoming: !!callIncoming,
        callIncomingData: callIncoming,
        localStream: !!localStream,
        remoteStream: !!remoteStream,
        isIncomingCall,
        callAccepted,
        activeCall,
        isRinging,
        callerName,
        microphonePermission: "checking...",
      });

      // Check microphone permission
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: "microphone" })
          .then((status) => {
            setDebugInfo((prev) => ({
              ...prev,
              microphonePermission: status.state,
            }));
          })
          .catch(() => {
            setDebugInfo((prev) => ({
              ...prev,
              microphonePermission: "unknown",
            }));
          });
      }
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);

    return () => clearInterval(interval);
  }, [
    socketConnected,
    authToken,
    userId,
    callIncoming,
    localStream,
    remoteStream,
    isIncomingCall,
    callAccepted,
    activeCall,
    isRinging,
    callerName,
  ]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 9999,
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Show Call Debug
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        width: "300px",
        maxHeight: "400px",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9999,
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px" }}>Call Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: "3px",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ lineHeight: "1.4" }}>
        <div>
          <strong>Last Update:</strong> {debugInfo.timestamp}
        </div>
        <div>
          <strong>Socket Connected:</strong>
          <span style={{ color: debugInfo.socketConnected ? "green" : "red" }}>
            {debugInfo.socketConnected ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Auth Token:</strong>
          <span style={{ color: debugInfo.authToken ? "green" : "red" }}>
            {debugInfo.authToken ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>User ID:</strong> {debugInfo.userId || "Not set"}
        </div>
        <div>
          <strong>Mic Permission:</strong>
          <span
            style={{
              color:
                debugInfo.microphonePermission === "granted"
                  ? "green"
                  : debugInfo.microphonePermission === "denied"
                  ? "red"
                  : "orange",
            }}
          >
            {debugInfo.microphonePermission}
          </span>
        </div>

        <hr style={{ margin: "10px 0", borderColor: "#666" }} />

        <div>
          <strong>Call Incoming:</strong>
          <span style={{ color: debugInfo.callIncoming ? "orange" : "gray" }}>
            {debugInfo.callIncoming ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Is Incoming Call:</strong>
          <span style={{ color: debugInfo.isIncomingCall ? "orange" : "gray" }}>
            {debugInfo.isIncomingCall ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Is Ringing:</strong>
          <span style={{ color: debugInfo.isRinging ? "orange" : "gray" }}>
            {debugInfo.isRinging ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Call Accepted:</strong>
          <span style={{ color: debugInfo.callAccepted ? "green" : "gray" }}>
            {debugInfo.callAccepted ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Active Call:</strong>
          <span style={{ color: debugInfo.activeCall ? "green" : "gray" }}>
            {debugInfo.activeCall ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Caller Name:</strong> {debugInfo.callerName || "None"}
        </div>

        <hr style={{ margin: "10px 0", borderColor: "#666" }} />

        <div>
          <strong>Local Stream:</strong>
          <span style={{ color: debugInfo.localStream ? "green" : "gray" }}>
            {debugInfo.localStream ? " ✓" : " ✗"}
          </span>
        </div>
        <div>
          <strong>Remote Stream:</strong>
          <span style={{ color: debugInfo.remoteStream ? "green" : "gray" }}>
            {debugInfo.remoteStream ? " ✓" : " ✗"}
          </span>
        </div>

        {debugInfo.callIncomingData && (
          <>
            <hr style={{ margin: "10px 0", borderColor: "#666" }} />
            <div>
              <strong>Call Data:</strong>
            </div>
            <pre
              style={{ fontSize: "10px", overflow: "auto", maxHeight: "100px" }}
            >
              {JSON.stringify(debugInfo.callIncomingData, null, 2)}
            </pre>
          </>
        )}
      </div>

      <div style={{ marginTop: "10px", fontSize: "10px", color: "#ccc" }}>
        💡 Check console for detailed logs
      </div>
    </div>
  );
};

export default CallDebugger;

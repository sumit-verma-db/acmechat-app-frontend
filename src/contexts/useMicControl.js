import { useEffect } from "react";
import { useCall } from "../contexts/CallContext";

export const useMicControl = () => {
  const {
    micActive,
    setMicActive,
    micList,
    setMicList,
    currentMicId,
    currentMicLabel,
    setCurrentMicId,
    setCurrentMicLabel,
  } = useCall();

  // useEffect(() => {
  //   navigator.mediaDevices.enumerateDevices().then((devices) => {
  //     const mics = devices.filter((d) => d.kind === "audioinput");
  //     setMicList(mics);
  //     if (!currentMicId && mics.length > 0) {
  //       setCurrentMicId(mics[0].deviceId);
  //       setCurrentMicLabel(mics[0].label);
  //     }
  //   });
  // }, []);

  const toggleMic = async () => {
    if (!micActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const track = stream.getAudioTracks()[0];
        setCurrentMicLabel(track.label);
        setMicActive(true);
      } catch (err) {
        console.error("Mic access error:", err);
      }
    } else {
      setMicActive(false);
      setCurrentMicLabel("");
    }
  };

  const changeMic = async (deviceId) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const track = newStream.getAudioTracks()[0];
      setCurrentMicId(deviceId);
      setCurrentMicLabel(track.label);
      setMicActive(true);
    } catch (err) {
      console.error("Mic switch failed:", err);
    }
  };

  return {
    micActive,
    micList,
    currentMicId,
    currentMicLabel,
    toggleMic,
    changeMic,
  };
};

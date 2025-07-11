import { useEffect, useRef, useState } from "react";
import { Avatar, Box } from "@mui/material";

const CircularPulseAvatar = ({ stream, active, label = "U" }) => {
  const [pulseSize, setPulseSize] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!stream || !active) return;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 32;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setPulseSize(Math.min(10 + (avg / 255) * 30, 40));
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      context.close();
    };
  }, [stream, active]);

  return (
    <Box
      sx={{
        position: "relative",
        width: 100,
        height: 100,
        mb: 1,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%)`,
          width: 100 + pulseSize,
          height: 100 + pulseSize,
          borderRadius: "50%",
          backgroundColor: "rgba(16,185,129,0.3)",
          zIndex: 0,
          transition: "all 0.1s ease",
        }}
      />
      <Avatar
        sx={{
          width: 100,
          height: 100,
          zIndex: 1,
          fontSize: 28,
          fontWeight: "bold",
          bgcolor: "#0ea5e9",
          color: "white",
          border: "2px solid white",
        }}
      >
        {label}
      </Avatar>
    </Box>
  );
};

export default CircularPulseAvatar;

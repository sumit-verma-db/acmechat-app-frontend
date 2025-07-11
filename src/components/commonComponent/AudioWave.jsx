import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

const AudioWave = ({ stream, active }) => {
  const [levels, setLevels] = useState([0, 0, 0, 0, 0]);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!stream || !active) return;

    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    analyser.fftSize = 32;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      const avg = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
      const level = Math.floor((avg / 255) * 5); // level between 0-5

      // set level height pattern
      const newLevels = Array(5)
        .fill(0)
        .map((_, i) => (i < level ? 1 : 0));

      setLevels(newLevels);
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
      sx={{ display: "flex", alignItems: "end", gap: "2px", height: 20, mb: 1 }}
    >
      {levels.map((isOn, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            height: isOn ? 14 + i * 2 : 4,
            borderRadius: 1,
            bgcolor: isOn ? "#22c55e" : "#e5e7eb", // green-500 and gray-200
            // bgcolor: isOn ? "#10b981" : "#cbd5e1",
            transition: "height 0.2s ease , background-color 0.2s ease",
          }}
        />
      ))}
    </Box>
  );
};

export default AudioWave;

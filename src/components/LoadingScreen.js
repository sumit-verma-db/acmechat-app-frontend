import React from "react";
import { Box, Typography } from "@mui/material";
import Logo from "../assets/Images/ACME-Logo-SVG.svg"; // Adjust path as needed

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        textAlign: "center",
        gap: 2, // spacing between logo, text, and animation
      }}
    >
      {/* ACME Logo */}
      <img src={Logo} alt="ACME Logo" width={120} />

      {/* Loading text */}
      <Typography variant="h6" color="textSecondary">
        Loading your chats...
      </Typography>

      {/* Lottie Animation */}
      <Box width={180} height={180}>
        <iframe
          src="https://lottie.host/embed/17964c39-5557-4015-abbc-246db90d2725/c2MD69nDtj.lottie"
          title="Loading Animation"
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
        />
      </Box>
    </Box>
  );
};

export default LoadingScreen;

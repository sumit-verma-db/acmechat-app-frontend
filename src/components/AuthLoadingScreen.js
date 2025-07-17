import React from "react";
import { Box } from "@mui/material";
import Logo from "../assets/Images/ACME-Logo-SVG.svg"; // Adjust path as needed

const AuthLoadingScreen = () => {
  return (
    <Box
      sx={{
        // height: "100vh",
        // width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column", // column for vertical stack
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        textAlign: "center",
        gap: 4, // more spacing between elements
      }}
    >
      {/* ACME Logo */}
      <img src={Logo} alt="ACME Logo" width={120} />

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

export default AuthLoadingScreen;

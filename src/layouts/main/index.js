import { Box, Container, Stack } from "@mui/material";
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Logo from "../../assets/Images/ACME-Logo-SVG.svg";
import { useAuth } from "../../contexts/useAuth";

// const isAuthenticated = false;

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6", // optional: soft light background
          px: 2, // mobile-safe padding
        }}
      >
        <Container sx={{}} maxWidth="sm">
          {/* <Stack spacing={5} alignItems="center">
            <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{
                height: { xs: 100, sm: 130, md: 150 },
                width: { xs: 180, sm: 220, md: 260 },
                objectFit: "contain",
              }}
            />
          </Stack> */}
          <Outlet />
        </Container>
      </Box>
    </>
  );
};

export default MainLayout;

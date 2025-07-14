import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SideBar from "./SideBar";
import { useAuth } from "../../contexts/useAuth";
import BottomNavBar from "./BottomNavBar";
import CallSidebar from "../../components/commonComponent/CallSidebar";

const DashboardLayout = () => {
  const { isAuthenticated, authToken } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (authToken === undefined) {
    return (
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          overflowX: "hidden", // 👈 prevent horizontal scroll
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f7fa", // optional, to match your theme
        }}
      >
        <Stack direction="row" sx={{ flexGrow: 1, overflow: "hidden" }}>
          {!isMobile && <SideBar />}
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Outlet />
          </Box>
        </Stack>

        {isMobile && <BottomNavBar />}
        {/* GLOBAL CALL UI */}
        <CallSidebar />
      </Box>
    </>
  );
};

export default DashboardLayout;

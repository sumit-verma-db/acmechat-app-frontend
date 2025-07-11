import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Stack, useMediaQuery } from "@mui/material";
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
      <Stack direction="row" sx={{ width: "100%", height: "100vh" }}>
        {!isMobile && <SideBar />}
        <Outlet />
      </Stack>

      {isMobile && <BottomNavBar />}
      {/* GLOBAL CALL UI */}
      <CallSidebar />
    </>
  );
};

export default DashboardLayout;

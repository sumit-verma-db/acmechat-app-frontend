import { Navigate, Outlet } from "react-router-dom";
import { CircularProgress, Stack } from "@mui/material";
import SideBar from "./SideBar";
import { useAuth } from "../../contexts/useAuth";

// const isAuthenticated = true;

const DashboardLayout = () => {
  const { isAuthenticated, authToken } = useAuth();
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
    <Stack direction="row">
      {/* SideBar */}
      <SideBar />
      <Outlet />
    </Stack>
  );
};

export default DashboardLayout;

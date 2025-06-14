import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  Paper,
  Stack,
  Typography,
  Divider,
  MenuItem,
  Box,
  Menu,
} from "@mui/material";
import { ArrowLeft, ArrowRight, Gear } from "phosphor-react";

import { useNavigate } from "react-router-dom";
import { useChat } from "../../contexts/ChatContext";
import { Nav_Buttons, Profile_Menu } from "../../data";
import { useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import useSettings from "../../hooks/useSettings";

const getPath = (index) => {
  switch (index) {
    case 0:
      return "/allContact";
    case 1:
      return "/app";
    case 2:
      return "/group";
    case 3:
      return "/call";
    case 4:
      return "/admin";
    default:
      return "/";
  }
};
const getMenuPath = (index) => {
  switch (index) {
    case 0:
      return "/profile";

    case 1:
      return "/settings";

    case 2:
      // logout();
      // todo - update token and set isAuth = false
      return "/auth/login";

    default:
      break;
  }
};
const BottomNavBar = () => {
  const { logout, userData } = useAuth();
  const getMenuPath = (index) => {
    switch (index) {
      case 0:
        return "/profile";

      case 1:
        return "/settings";

      case 2:
        logout();
        // todo - update token and set isAuth = false
        return "/auth/login";

      default:
        break;
    }
  };
  const { selectedMenu, setSelectedMenu } = useChat();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { chatDrawer, onToggleChatDrawer } = useSettings();

  const handleClick = (event) => {
    console.log("HANDLE CLIK-------->");

    setAnchorEl(event.currentTarget);
    navigate();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          display: { xs: "flex", sm: "none" },
          width: "100vw",
          p: 0,
          m: 0,
        }}
        // sx={{
        //   position: "fixed",
        //   bottom: 0,
        //   left: 0,
        //   right: 0,
        //   zIndex: 999,
        //   display: { xs: "flex", sm: "none" },
        // }}
      >
        <>
          <BottomNavigation
            value={selectedMenu}
            onChange={(event, newValue) => {
              setSelectedMenu(newValue);
              navigate(getPath(newValue));
              onToggleChatDrawer();
            }}
            showLabels={false}
            sx={{
              width: "100vw",
              minHeight: 60,
              p: 2,
              m: 0,
              bgcolor: "background.paper",
            }}
          >
            {Nav_Buttons.map((btn) => (
              <BottomNavigationAction
                key={btn.index}
                icon={btn.icon}
                label={btn.label}
                value={btn.index}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: "none",
                  p: 0,
                  ".MuiBottomNavigationAction-label": { display: "none" },
                }}
              />
            ))}
            <BottomNavigationAction
              icon={
                <Avatar sx={{ width: 28, height: 28, fontSize: 16 }}>
                  {userData?.username?.[0] || "U"}
                </Avatar>
              }
              onClick={() => setDrawerOpen(true)}
              sx={{
                flex: 1,
                minWidth: 0,
                maxWidth: "none",
                p: 0,
                ".MuiBottomNavigationAction-label": { display: "none" },
              }}
            />
          </BottomNavigation>
          {/* <Avatar
            id="basic-button"
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            aria-controls={open ? "basic-menu" : undefined}
            sx={{ cursor: "pointer" }}
            onClick={handleClick}
          >
            {userData?.username?.[0] || "U"}
          </Avatar>
          <Box>
            <Box sx={{ fontSize: 12, fontWeight: 600, textAlign: "center" }}>
              {userData?.username || "Username"}
            </Box>
            <Box sx={{ fontSize: 10, color: "gray", textAlign: "center" }}>
              {userData?.email || "email@example.com"}
            </Box>
          </Box>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Stack spacing={1} px={1}>
              {Profile_Menu.map((el, idx) => (
                <MenuItem
                  onClick={() => {
                    handleClick();
                  }}
                >
                  <Stack
                    onClick={() => {
                      navigate(getMenuPath(idx));
                    }}
                    sx={{ width: 100 }}
                    direction="row"
                    alignItems={"center"}
                    justifyContent="space-between"
                  >
                    <span>{el.title}</span>
                    {el.icon}
                  </Stack>
                </MenuItem>
              ))}
            </Stack>
          </Menu> */}
        </>
      </Paper>
      {/* Drawer for Profile / Logout */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            py: 3,
          },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64 }}>
            {userData?.username?.[0] || "U"}
          </Avatar>
          <Typography variant="subtitle1">{userData?.username}</Typography>
          <Typography variant="body2" color="text.secondary">
            {userData?.email}
          </Typography>
          <Divider sx={{ width: "100%" }} />
          {Profile_Menu.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                if (item.title === "Logout") {
                  logout();
                } else {
                  navigate(`/${item.title.toLowerCase()}`);
                }
                setDrawerOpen(false);
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {item.icon}
                <Typography>{item.title}</Typography>
              </Stack>
            </MenuItem>
          ))}
        </Stack>
      </Drawer>
    </>
  );
};

export default BottomNavBar;

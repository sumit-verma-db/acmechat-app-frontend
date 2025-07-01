import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, Gear } from "phosphor-react";
import { Nav_Buttons, Profile_Menu } from "../../data";
import useSettings from "../../hooks/useSettings";
import AntSwitch from "../../components/AntSwitch";
import Logo from "../../assets/Images/ACME-Logo-SVG.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { useChat } from "../../contexts/ChatContext";
import StyledBadge from "../../components/StyledBadge";

const getPath = (index) => {
  switch (index) {
    case 0:
      return "/allContact";
    case 1:
      return "/app";
    case 2:
      return "/group";
    case 3:
      return "/admin";
    // case 3:
    //   return "/call";
    case 4:
      return "/admin";
    case 5:
      return "/settings";
    default:
      return "/";
  }
};

const getMenuPath = (index, logout) => {
  switch (index) {
    case 0:
      logout();
      return "/auth/login";
    // return "/profile";
    case 1:
      return "/settings";
    case 2:
      logout();
      return "/auth/login";
    default:
      return "/";
  }
};

const AnimatedSidebarIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  width: "max-content",
  transition: "background 0.3s, color 0.25s, transform 0.18s, box-shadow 0.25s",
  background: active ? theme.palette.primary.main : "transparent",
  color: active
    ? "#fff"
    : theme.palette.mode === "light"
    ? "#000"
    : theme.palette.text.primary,
  transform: active ? "scale(1.18)" : "scale(1)",
  boxShadow: active ? "0 4px 16px rgba(30,64,175,0.10)" : "none",
  "&:hover": {
    // background: active
    //   ? theme.palette.primary.dark
    //   : theme.palette.primary.light,
    background: active ? "#e0e0e0" : "#e0e0e0",
    color: theme.palette.primary.main,
    transform: "scale(1.10)",
  },
}));

const SideBar = ({ onToggleChat }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout, userData } = useAuth();
  const { setSelectedMenu, selectedMenu } = useChat();
  const { onToggleMode, chatCollapsed, onToggleChatCollapse } = useSettings();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/group")) setSelectedMenu(2);
    else if (path.includes("/app")) setSelectedMenu(1);
  }, [location.pathname]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);
  const pastelColors = [
    "#e59791",
    "#ea9a91",
    "#caa1d0",
    "#b496d2",
    "#87b4d9",
    "#90c6e4",
    "#88d0cd",
    "#7ec9b6",
    "#89d19c",
    "#b9df7e",
    "#f6e180",
    "#f7c173",
    "#eca48b",
    "#e39a72",
  ];

  const getPastelColor = (name = "U") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: 100,
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          theme.palette.mode === "light"
            ? theme.palette.background.paper
            : theme.palette.background.default,
        // backgroundColor: "#fff",
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        position: "relative",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#ffffff"
              : theme.palette.background.paper,
          // backgroundColor: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          borderBottom:
            theme.palette.mode === "light"
              ? "1px solid #e0e0e0"
              : "1px solid #333",
          // borderBottom: "1px solid #e0e0e0",
        }}
      >
        <img
          src={Logo}
          alt="ACME Logo"
          style={{
            width: "80%",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>
      {/* <Divider sx={{ width: "48px" }} textAlign="center" style={{ mt: "2" }} /> */}

      {/* Main Sidebar Body */}
      <Box
        sx={{
          flex: 1,
          // backgroundColor:
          //   theme.palette.mode === "light"
          //     ? "#fcf3cf"
          //     : theme.palette.background.paper,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#c5c5c5"
              : theme.palette.background.paper,
          // backgroundImage: "linear-gradient(to bottom, #eaf1fb, #ffffff)",
          backgroundSize: "cover",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        {/* Nav Buttons */}
        <Stack spacing={3} alignItems="center">
          {Nav_Buttons.map((el) => (
            <Tooltip title={el.title} placement="right" key={el.index}>
              <AnimatedSidebarIconButton
                active={el.index === selectedMenu}
                onClick={() => {
                  setSelectedMenu(el.index);
                  navigate(getPath(el.index));
                }}
              >
                {el.icon}
              </AnimatedSidebarIconButton>
            </Tooltip>
          ))}

          <Divider sx={{ width: "48px" }} />

          {/* <Tooltip title="Settings" placement="right">
            <AnimatedSidebarIconButton
              active={selectedMenu === 5}
              onClick={() => {
                setSelectedMenu(5);
                navigate(getPath(5));
              }}
            >
              <Gear />
            </AnimatedSidebarIconButton>
          </Tooltip> */}
        </Stack>

        {/* Bottom User & Toggle */}
        <Stack spacing={1} alignItems="center">
          <Tooltip title="Toggle Dark/Light" placement="right">
            <AntSwitch onChange={onToggleMode} defaultChecked />
          </Tooltip>

          <Box position="relative">
            <Tooltip title={userData?.username || "Username"} placement="right">
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                isOnline={true}
                onClick={handleClick}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#fff", // white background
                    color: getPastelColor(userData.username), // initials color
                    border: `2px solid ${getPastelColor(userData.username)}`, // colored border
                    fontWeight: 500,
                    fontSize: "0.9rem", // adjust as needed
                  }}
                  // sx={{
                  //   bgcolor:
                  //     !userData.img && userData?.username
                  //       ? getPastelColor(userData.username)
                  //       : undefined,
                  // }}
                  alt={userData?.username?.[0] || "U"}
                  src={userData.img}
                />
              </StyledBadge>
              {/* <Avatar
                id="basic-button"
                sx={{ cursor: "pointer" }}
                onClick={handleClick}
              >
                {userData?.username?.[0] || "U"}
                
              </Avatar> */}
            </Tooltip>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ fontSize: 12, fontWeight: 600 }}>
              {userData?.username || "Username"}
            </Box>
            <Tooltip
              title={userData?.email || "email@example.com"}
              placement="right"
            >
              <Box
                sx={{
                  fontSize: 10,
                  color: "gray",
                  maxWidth: 90,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {userData?.email || "email@example.com"}
              </Box>
            </Tooltip>
          </Box>

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Stack spacing={1} px={1}>
              {Profile_Menu.map((el, idx) => (
                <MenuItem
                  key={el.title}
                  onClick={() => {
                    setAnchorEl(null);
                    navigate(getMenuPath(idx, logout));
                  }}
                >
                  <Stack
                    sx={{ width: 100 }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <span>{el.title}</span>
                    {el.icon}
                  </Stack>
                </MenuItem>
              ))}
            </Stack>
          </Menu>
        </Stack>
      </Box>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <IconButton
          onClick={onToggleChatCollapse}
          sx={{
            position: "absolute",
            top: "5%",
            left: "100%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#1E40AF",
            color: "#fff",
            width: 36,
            height: 36,
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1500,
            "&:hover": {
              backgroundColor: "#1D4ED8",
            },
          }}
        >
          {chatCollapsed ? (
            <ArrowLeft size={20} weight="bold" />
          ) : (
            <ArrowRight size={20} weight="bold" />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default SideBar;

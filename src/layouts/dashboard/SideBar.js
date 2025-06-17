import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tooltip,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { ArrowLeft, ArrowRight, Gear } from "phosphor-react";
import { Nav_Buttons, Profile_Menu } from "../../data";
import useSettings from "../../hooks/useSettings";
import { faker } from "@faker-js/faker";
import AntSwitch from "../../components/AntSwitch";
import Logo from "../../assets/Images/ACME-Logo-SVG.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { useChat } from "../../contexts/ChatContext";
import { useMediaQuery } from "@mui/material";

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
    case 5:
      return "/settings";

    default:
      break;
  }
};

const getMenuPath = (index) => {
  switch (index) {
    case 0:
      return "/profile";

    case 1:
      return "/settings";

    case 2:
      // todo - update token and set isAuth = false
      return "/auth/login";

    default:
      break;
  }
};

const AnimatedSidebarIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ theme, active }) => ({
  width: "max-content",
  transition:
    "background 0.3s, color 0.25s, transform 0.18s cubic-bezier(.5,1.5,.6,1), box-shadow 0.25s",
  background: active ? theme.palette.primary.main : "transparent",
  color: active
    ? "#fff"
    : theme.palette.mode === "light"
    ? "#000"
    : theme.palette.text.primary,
  transform: active ? "scale(1.18)" : "scale(1)",
  boxShadow: active ? "0 4px 16px rgba(30,64,175,0.10)" : "none",
  "&:hover": {
    background: active
      ? theme.palette.primary.dark
      : theme.palette.primary.light,
    color: theme.palette.primary.main,
    transform: "scale(1.10)",
  },
}));

const SideBar = ({ onToggleChat }) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { logout, userData } = useAuth();
  const {
    setChatList,
    setSelectedUser,
    setChatData,
    setSelectedMenu,
    selectedMenu,
  } = useChat();

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

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    // console.log("HANDLE CLIK-------->");

    setAnchorEl(event.currentTarget);
    navigate();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  const location = useLocation(); // gets current location (url path)
  useEffect(() => {
    const path = location.pathname;

    if (path.includes("/group")) {
      setSelectedMenu(2);
    } else if (path.includes("/app")) {
      setSelectedMenu(1);
    }
  }, [location.pathname]);
  // state for selected button
  // const [selected, setSelected] = useState(1); // by default 0 index button is selected
  //switch themes
  const { onToggleMode, chatCollapsed, onToggleChatCollapse } = useSettings();
  // const { chatCollapsed, onToggleChatCollapse } = useSettings();

  return (
    <>
      <Box
        p={2}
        sx={{
          position: "relative", // ✅ required for absolute arrow
          // backgroundColor: theme.palette.background.paper,
          // backgroundColor: "#48c9b0",
          backgroundImage: "linear-gradient(to bottom, #eaf1fb, #ffffff)",

          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          transition: "background-image 0.4s ease-in-out",

          boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
          height: "100vh",
          width: 100,
          display: "flex",
        }}
        // sx={{
        //   backgroundColor: theme.palette.background.paper,
        //   boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        //   height: "100vh",
        //   width: 100,
        //   display: "flex",
        // }}
      >
        <Stack
          direction="column"
          alignItems={"center"}
          justifyContent="space-between"
          sx={{ width: "100%", height: "100%" }}
          spacing={3}
        >
          <Stack alignItems={"center"} spacing={4}>
            <Box
              sx={{
                // backgroundColor: theme.palette.primary.main,
                // height: 30,
                width: 90,
                borderRadius: 1.5,
              }}
            >
              <img src={Logo} alt={"Logo icon"} />
            </Box>
            <Stack
              sx={{ width: "max-content" }}
              direction="column"
              alignItems="center"
              spacing={3}
            >
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

                  {/* {el.index === selectedMenu ? (
                    <Box
                      key={""}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 1.5,
                      }}
                    >
                      <IconButton
                        sx={{ width: "max-content", color: "#fff" }}
                        key={el.index}
                      >
                        {el.icon}
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton
                      onClick={() => {
                        setSelectedMenu(el.index);
                        navigate(getPath(el.index));
                      }}
                      sx={{
                        width: "max-content",
                        color:
                          theme.palette.mode === "light"
                            ? "#000"
                            : theme.palette.text.primary,
                      }}
                      key={el.index}
                    >
                      {el.icon}
                    </IconButton>
                  )} */}
                </Tooltip>
              ))}
              <Divider sx={{ width: "48px" }} />
              <Tooltip title="Setting" placement="right" enterDelay={500}>
                <AnimatedSidebarIconButton
                  active={selectedMenu === 5}
                  onClick={() => {
                    setSelectedMenu(5);
                    navigate(getPath(5));
                  }}
                >
                  <Gear />
                </AnimatedSidebarIconButton>
              </Tooltip>

              {/* {selectedMenu === 5 ? (
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                  }}
                >
                  <Tooltip title="Setting" placement="right">
                    <IconButton sx={{ width: "max-content", color: "#fff" }}>
                      <Gear />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Tooltip title="Setting" placement="right">
                  <IconButton
                    onClick={() => {
                      setSelectedMenu(5);
                      navigate(getPath(5));
                    }}
                    sx={{
                      width: "max-content",
                      color:
                        theme.palette.mode === "light"
                          ? "#000"
                          : theme.palette.text.primary,
                    }}
                  >
                    <Gear />
                  </IconButton>
                </Tooltip>
              )} */}
            </Stack>
          </Stack>

          <Stack
            spacing={4}
            direction="column"
            alignItems="center"
            spacing={0.5}
          >
            <Tooltip title="Togle Dark/Light" placement="right">
              <AntSwitch
                onChange={() => {
                  onToggleMode();
                }}
                defaultChecked
              />
            </Tooltip>

            {/* <Avatar
            id="basic-button"
            sx={{ cursor: "pointer" }}
            src={faker.image.avatar()}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          /> */}
            <Box position="relative">
              <Tooltip
                title={userData?.username || "Username"}
                placement="right"
              >
                <Avatar
                  id="basic-button"
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  aria-controls={open ? "basic-menu" : undefined}
                  sx={{ cursor: "pointer" }}
                  onClick={handleClick}
                >
                  {userData?.username?.[0] || "U"}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 12,
                      height: 12,
                      backgroundColor: "#34D399", // green
                      borderRadius: "50%",
                      border: "2px solid #F4F7FE",
                    }}
                  />
                </Avatar>
              </Tooltip>
            </Box>
            <Box>
              <Box sx={{ fontSize: 12, fontWeight: 600, textAlign: "center" }}>
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
                    textAlign: "center",
                    maxWidth: 90,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    cursor: "default",
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
            </Menu>
          </Stack>
        </Stack>
        {/* 👇 Floating arrow button */}
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
    </>
  );
};

export default SideBar;

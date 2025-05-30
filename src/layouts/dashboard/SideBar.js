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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Gear } from "phosphor-react";
import { Nav_Buttons, Profile_Menu } from "../../data";
import useSettings from "../../hooks/useSettings";
import { faker } from "@faker-js/faker";
import AntSwitch from "../../components/AntSwitch";
import Logo from "../../assets/Images/logo.ico";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { useChat } from "../../contexts/ChatContext";

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

const SideBar = () => {
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
    console.log("HANDLE CLIK-------->");

    setAnchorEl(event.currentTarget);
    navigate();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useTheme();
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
  const { onToggleMode } = useSettings();

  return (
    <Box
      p={2}
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        height: "100vh",
        width: 100,
        display: "flex",
      }}
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
              backgroundColor: theme.palette.primary.main,
              height: 64,
              width: 64,
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
            {Nav_Buttons.map((el) =>
              el.index === selectedMenu ? (
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
              )
            )}
            <Divider sx={{ width: "48px" }} />
            {selectedMenu === 4 ? (
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.5,
                }}
              >
                <IconButton sx={{ width: "max-content", color: "#fff" }}>
                  <Gear />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                onClick={() => {
                  setSelectedMenu(4);
                  navigate(getPath(4));
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
            )}
          </Stack>
        </Stack>

        <Stack spacing={4} direction="column" alignItems="center" spacing={0.5}>
          <AntSwitch
            onChange={() => {
              onToggleMode();
            }}
            defaultChecked
          />

          {/* <Avatar
            id="basic-button"
            sx={{ cursor: "pointer" }}
            src={faker.image.avatar()}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          /> */}
          <Avatar
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
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideBar;

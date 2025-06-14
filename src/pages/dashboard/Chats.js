import React, { useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Button,
  Divider,
  CircularProgress,
  useMediaQuery,
  Drawer,
  InputAdornment,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass, X } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { useChat } from "../../contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketProvider";
import useSettings from "../../hooks/useSettings";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";

const Chats = ({ onSelect }) => {
  const { setSelectedUser, selectedUser, chatList, setSelectedMenu } =
    useChat();
  console.log(chatList, "CHATLIST");
  const { chatCollapsed, onToggleChatCollapse, onToggleChatDrawer } =
    useSettings();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedMenu(1);
    navigate("/app");
    // if (isMobile) onToggleChatCollapse(); // auto-close on mobile
    if (isMobile) onToggleChatDrawer();
  };

  const filteredChats = chatList.filter((chat) => {
    const fullName = `${chat.first_name} ${chat.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // const chatContent = (
  //   <Box
  //     sx={{
  //       width: 320,
  //       height: "100vh",
  //       backgroundColor:
  //         theme.palette.mode === "light"
  //           ? "#F8FAFF"
  //           : theme.palette.background.paper,
  //       boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
  //     }}
  //   >
  //     <Stack p={3} spacing={2} sx={{ height: "100%" }}>
  //       <Stack
  //         direction="row"
  //         alignItems="center"
  //         justifyContent="space-between"
  //       >
  //         <Typography variant="h5">Chats</Typography>
  //         <IconButton>
  //           <CircleDashed />
  //         </IconButton>
  //       </Stack>

  //       <Stack sx={{ width: "100%" }}>
  //         <Search>
  //           <SearchIconWrapper>
  //             <MagnifyingGlass color="#709CE6" />
  //           </SearchIconWrapper>
  //           <StyledInputBase
  //             value={searchTerm}
  //             onChange={(e) => setSearchTerm(e.target.value)}
  //             placeholder="Search..."
  //             inputProps={{ "aria-label": "search" }}
  //           />
  //         </Search>
  //       </Stack>

  //       <Stack spacing={1}>
  //         <Stack direction="row" alignItems="center" spacing={1.5}>
  //           <ArchiveBox size={24} />
  //           <Button>Archive</Button>
  //         </Stack>
  //         <Divider />
  //       </Stack>

  //       <Stack
  //         className="scrollbar"
  //         spacing={2}
  //         direction="column"
  //         sx={{ flexGrow: 1, overflow: "auto", height: "100%" }}
  //       >
  //         <Stack spacing={2.4}>
  //           <Typography variant="subtitle2" sx={{ color: "#676767" }}>
  //             All Chats
  //           </Typography>
  //           {loading ? (
  //             <CircularProgress size={24} sx={{ alignSelf: "center" }} />
  //           ) : filteredChats.length > 0 ? (
  //             filteredChats.map((chat) => (
  //               <ChatElement
  //                 key={chat.user_id}
  //                 {...chat}
  //                 onSelect={handleUserClick}
  //               />
  //             ))
  //           ) : (
  //             <Typography align="center">No User found</Typography>
  //           )}
  //         </Stack>
  //       </Stack>
  //     </Stack>
  //   </Box>
  // );

  // Mobile: render in Drawer
  // if (isMobile) {
  //   return (
  //     <Drawer
  //       anchor="left"
  //       open={chatCollapsed}
  //       onClose={onToggleChatCollapse}
  //       ModalProps={{ keepMounted: true }}
  //       sx={{
  //         "& .MuiDrawer-paper": {
  //           width: 320,
  //           left: 100, // offset after sidebar
  //         },
  //       }}
  //     >
  //       {chatContent}
  //     </Drawer>
  //   );
  // }

  // Desktop: render as regular box
  if (chatCollapsed) return null;

  return (
    <>
      <Box
        sx={{
          width: isMobile ? "100%" : 320,
          height: "100vh",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
          // borderRadius: "8px",
          borderRight: `1px solid ${theme.palette.divider}`,
          // transition: "all 0.3s ease",
          overflow: "hidden",
          // borderRight: "2px solid red",
        }}
      >
        {/* <Box
        sx={{
          width: isMobile ? "100%" : 320,
          // minWidth: 320,
          // maxWidth: "100%",
          // width: "100vw",
          height: "100vh",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        }}
      > */}
        <Stack p={3} spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight={600}>
              Chats
            </Typography>

            {/* <IconButton>
              <CircleDashed />
            </IconButton> */}
          </Stack>

          <Stack sx={{ width: "100%" }}>
            <Search
              sx={{ boxShadow: "0px 1px 4px rgba(0,0,0,0.1)", borderRadius: 2 }}
            >
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                inputProps={{ "aria-label": "search" }}
                endAdornment={
                  searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        aria-label="clear search"
                        edge="end"
                      >
                        <X size={18} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              />
            </Search>
          </Stack>

          <Stack spacing={1}>
            {/* <Stack direction="row" alignItems="center" spacing={1.5}>
              <ArchiveBox size={24} />
              <Button>Archive</Button>
            </Stack> */}
            <Divider />
          </Stack>

          <Stack
            className="scrollbar"
            spacing={2}
            direction="column"
            sx={{
              flexGrow: 1,
              overflow: "auto",
              height: "100%",
              px: 1,
            }}
          >
            <Stack spacing={2}>
              {/* <Typography variant="subtitle2" sx={{ color: "#676767" }}>
                All Chats
              </Typography> */}
              <Typography variant="subtitle2" color="textSecondary">
                All Chats
              </Typography>

              {loading ? (
                <CircularProgress size={24} sx={{ alignSelf: "center" }} />
              ) : filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <ChatElement
                    key={chat.user_id}
                    {...chat}
                    isActive={selectedUser?.user_id === chat.user_id}
                    onSelect={handleUserClick}
                    sx={{
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: "0px 1px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                ))
              ) : (
                <Typography
                  align="center"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  No User found
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default Chats;

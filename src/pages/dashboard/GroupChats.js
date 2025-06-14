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
  Link,
} from "@mui/material";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Plus,
} from "phosphor-react";
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
import GroupChatElement from "../../components/GroupChatElement";
import CreateGroup from "../../sections/main/CreateGroup";

const GroupChats = () => {
  const { groupList, setSelectedUser, selectedUser } = useChat();
  const { chatCollapsed, onToggleChatCollapse, onToggleChatDrawer } =
    useSettings();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const filteredGroups = groupList.filter((group) =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleGroupClick = (user) => {
    console.log(user, "USERRRRRRR------>");
    // const roomId = joinRoom(user.user_id);
    // console.log(roomId, "ROOOOMID---->");
    if (isMobile) onToggleChatDrawer();
    setSelectedUser(user);
    // setSelectedMenu(1);
    // navigate("/app");
  };

  if (chatCollapsed) return null;

  return (
    <>
      <Box
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
      >
        <Stack p={3} spacing={2} sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5">Chats</Typography>
            <IconButton>
              <CircleDashed />
            </IconButton>
          </Stack>

          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ArchiveBox size={24} />
              <Button>Archive</Button>
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Typography variant="subtitle2" component={Link}>
                Create New Group
              </Typography>
              <IconButton
                onClick={() => {
                  setOpenDialog(true);
                }}
              >
                <Plus style={{ color: theme.palette.primary.main }} />
              </IconButton>
            </Stack>
            <Divider />
          </Stack>

          <Stack
            className="scrollbar"
            spacing={2}
            direction="column"
            sx={{ flexGrow: 1, overflow: "auto", height: "100%" }}
          >
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                All Groups
              </Typography>
              {loading ? (
                <CircularProgress size={24} sx={{ alignSelf: "center" }} />
              ) : filteredGroups.length > 0 ? (
                filteredGroups
                  .filter((el) => !el.pinned)
                  .map((group) => {
                    return (
                      <GroupChatElement
                        id={group.group_id}
                        group_id={group.group_id}
                        first_name={group.group_name}
                        email={
                          group.sender_first_name
                            ? `From: ${group.sender_first_name} ${group.sender_last_name}`
                            : "No messages yet"
                        }
                        time={
                          group.sent_at
                            ? new Date(group.sent_at).toLocaleTimeString()
                            : ""
                        }
                        unread={0} // or pull from unread tracking if available
                        isGroup
                        onSelect={handleGroupClick}
                      />
                    );
                  })
              ) : (
                <Typography align="center">No User found</Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default GroupChats;

import {
  Box,
  Stack,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import React, { useState } from "react";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "../../components/Scrollbar";
import "../../css/global.css";
// import { ChatList } from '../../data';
import ChatElement from "../../components/ChatElement";
import CreateGroup from "../../sections/main/CreateGroup";
import { useChat } from "../../contexts/ChatContext";
import GroupChatElement from "../../components/GroupChatElement";
import Conversation from "../../components/Conversation";
import { useSelector } from "react-redux";
import GroupConversation from "../../components/ConversationGroup";

const Group = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const { groupList, setSelectedUser, selectedUser } = useChat();
  const { sidebar } = useSelector((store) => store.app); // access our store inside component

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleGroupClick = (user) => {
    console.log(user, "USERRRRRRR------>");
    // const roomId = joinRoom(user.user_id);
    // console.log(roomId, "ROOOOMID---->");

    setSelectedUser(user);
    // setSelectedMenu(1);
    // navigate("/app");
  };
  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        {/* Left */}
        <Box
          sx={{
            height: "100vh",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background,
            width: 320,
            boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
          }}
        >
          <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
            <Stack>
              <Typography variant="h5">Group</Typography>
            </Stack>
            <Stack sx={{ width: "100%" }}>
              <Search>
                <SearchIconWrapper>
                  <MagnifyingGlass color="#709CE6" />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search..."
                  inputProps={{ "aria-label": "search" }}
                />
              </Search>
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
            <Stack
              spacing={3}
              className="scrollbar"
              sx={{ flexGrow: 1, overflowY: "scroll", height: "100%" }}
            >
              <SimpleBarStyle timeout={500} clickOnTrack={false}>
                <Stack spacing={2.5}>
                  {/*  */}
                  {/* <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                    Pinned
                  </Typography>
                  
                  {groupList
                    .filter((el) => el.pinned)
                    .map((el) => {
                      return <ChatElement {...el} />;
                    })} */}

                  {/*  */}
                  <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                    All Groups
                  </Typography>
                  {/* Chat List */}
                  {groupList
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
                    })}
                </Stack>
              </SimpleBarStyle>
            </Stack>
          </Stack>
        </Box>

        {/* Right */}
        <Box
          sx={{
            height: "100%",
            width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F0F4FA"
                : theme.palette.background.default,
          }}
        >
          {/* Conversation */}
          <GroupConversation selectedUser={selectedUser} />
        </Box>
        {/* Contact */}
        {/* {sidebar.open &&
          (() => {
            switch (sidebar.type) {
              case "CONTACT":
                return <Contact />;

              case "STARRED":
                return <StarredMessages />;

              case "SHARED":
                return <SharedMessages />;

              default:
                break;
            }
          })()} */}
      </Stack>
      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Group;

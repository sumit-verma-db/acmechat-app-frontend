import {
  Box,
  Stack,
  Typography,
  Link,
  IconButton,
  Divider,
  useMediaQuery,
  CircularProgress,
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
import useSettings from "../../hooks/useSettings";
import Chats from "./Chats";
import GroupChats from "./GroupChats";
import ChatListPane from "../../components/commonComponent/ChatListPane";
import ConversationChat from "../../components/commonComponent/ConversationChat";

const Group = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { chatDrawer, onToggleChatDrawer } = useSettings();
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const {
    groupList,
    setSelectedUser,
    selectedUser,
    selectedGroup,
    setSelectedGroup,
  } = useChat();
  const { sidebar } = useSelector((store) => store.app); // access our store inside component
  const [searchTerm, setSearchTerm] = useState("");
  console.log(groupList, "GROUP list");

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
  return (
    <>
      {isMobile ? (
        chatDrawer ? (
          <ChatListPane
            mode="group"
            title="Chats"
            data={groupList}
            selectedId={setSelectedUser?.group_id}
            onSelect={handleGroupClick}
          />
        ) : (
          // <GroupConversation selectedUser={selectedUser} />
          <ConversationChat selectedUser={selectedUser} isGroup={true} />
        )
      ) : (
        <Stack direction="row" sx={{ width: "100%" }}>
          <ChatListPane
            mode="group"
            title="Chats"
            data={groupList}
            selectedId={setSelectedUser?.group_id}
            onSelect={handleGroupClick}
          />
          <Box
            sx={{
              height: "100%",
              width: sidebar.open
                ? "calc(100vw - 740px)"
                : "calc(100vw - 420px)",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#F0F4FA"
                  : theme.palette.background.default,
            }}
          >
            <ConversationChat selectedUser={selectedUser} isGroup={true} />
            {/* <GroupConversation selectedUser={selectedUser} /> */}
          </Box>
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
                    return null;
                }
              })()} */}
        </Stack>
      )}
      {/* Right */}
      {/* <Box
          sx={{
            height: "100%",
            width: sidebar.open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F0F4FA"
                : theme.palette.background.default,
          }}
        >
          <GroupConversation selectedUser={selectedUser} />
        </Box> */}
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

      {openDialog && (
        <CreateGroup open={openDialog} handleClose={handleCloseDialog} />
      )}
    </>
  );
};

export default Group;

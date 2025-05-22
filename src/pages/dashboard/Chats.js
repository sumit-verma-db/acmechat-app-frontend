import {
  Box,
  IconButton,
  Stack,
  Typography,
  InputBase,
  Button,
  Divider,
  Avatar,
  Badge,
  CircularProgress,
} from "@mui/material";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { faker } from "@faker-js/faker";
import { ChatList } from "../../data";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import ChatElement from "../../components/ChatElement";
import { useChat } from "../../contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketProvider";

const dummyChatData = [
  {
    user_id: 1,
    first_name: "John",
    last_name: "Doe",
    img: "https://i.pravatar.cc/150?img=1",
    email: "john.doe@example.com",
    city: "New York",
    msg: "Hey, are we still on for the meeting?",
    time: "10:30 AM",
    online: true,
    unread: 2,
  },
  {
    user_id: 2,
    first_name: "Jane",
    last_name: "Smith",
    img: "https://i.pravatar.cc/150?img=2",
    email: "jane.smith@example.com",
    city: "San Francisco",
    msg: "Let me know once you check the file.",
    time: "9:45 AM",
    online: false,
    unread: 0,
  },
  {
    user_id: 3,
    first_name: "Alex",
    last_name: "Johnson",
    img: "https://i.pravatar.cc/150?img=3",
    email: "alex.johnson@example.com",
    city: "Chicago",
    msg: "Great job on the presentation!",
    time: "Yesterday",
    online: true,
    unread: 4,
  },
  {
    user_id: 4,
    first_name: "Emily",
    last_name: "Williams",
    img: "https://i.pravatar.cc/150?img=4",
    email: "emily.williams@example.com",
    city: "Boston",
    msg: "I'll call you in 5 mins.",
    time: "Monday",
    online: false,
    unread: 0,
  },
];

const Chats = () => {
  const { setSelectedUser, chatList, setChatList, setSelectedMenu } = useChat();
  const [loading, setLoading] = useState(false);
  const { joinRoom } = useSocket();
  const navigate = useNavigate();
  const handleUserClick = (user) => {
    // console.log(user, "USERRRRRRR------>");
    // const roomId = joinRoom(user.user_id);
    // console.log(roomId, "ROOOOMID---->");

    setSelectedUser(user);
    setSelectedMenu(1);
    navigate("/app");
  };

  const theme = useTheme();
  return (
    <Box
      sx={{
        position: "relative",
        width: 320,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
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
          <Divider />
        </Stack>

        <Stack
          className="scrollbar"
          spacing={2}
          direction="column"
          sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
        >
          {/* <Stack spacing={2.4}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              Pinned
            </Typography>
            {ChatList.filter((el) => el.pinned).map((el) => {
              return <ChatElement {...el} />;
            })}
          </Stack> */}

          <Stack spacing={2.4}>
            <Typography variant="subtitle2" sx={{ color: "#676767" }}>
              All Chats
            </Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ alignSelf: "center" }} />
            ) : chatList.length > 0 ? (
              chatList.map((chat) => (
                <ChatElement
                  key={chat.user_id}
                  {...chat}
                  onSelect={handleUserClick}
                />
              ))
            ) : (
              <Typography align="center">No User found</Typography>
            )}
            {/* {ChatList.filter((el) => !el.pinned).map((el) => {
              return <ChatElement {...el} onSelect={handleUserClick} />;
            })} */}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Chats;

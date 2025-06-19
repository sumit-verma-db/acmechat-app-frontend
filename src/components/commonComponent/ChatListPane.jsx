import { useState } from "react";
import ChatElement from "../../components/ChatElement";
import GroupChatElement from "../../components/GroupChatElement";
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Search, SearchIconWrapper, StyledInputBase } from "../Search";
import { MagnifyingGlass } from "phosphor-react";
import ChatListItem from "./ChatListItem";

const ChatListPane = ({
  mode = "user", // 'user' or 'group'
  data = [],
  selectedId,
  onSelect,
  title = "Chats",
  loading = false,
}) => {
  // console.log(data, "DDDDDAADAFDAFAF");
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filteredList = data.filter((item) =>
    (mode === "user" ? `${item.first_name} ${item.last_name}` : item.group_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : 320,
        height: "100vh",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack p={3} spacing={2} sx={{ height: "100%" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5" fontWeight={600}>
            {title}
          </Typography>
        </Stack>

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
          />
        </Search>

        <Divider />

        <Stack
          className="scrollbar"
          spacing={2}
          direction="column"
          sx={{ flexGrow: 1, overflow: "auto", height: "100%" }}
        >
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" color="textSecondary">
              {mode === "group" ? "All Groups" : "All Chats"}
            </Typography>
            {loading ? (
              <CircularProgress size={24} sx={{ alignSelf: "center" }} />
            ) : filteredList.length > 0 ? (
              filteredList.map((item) => (
                <ChatListItem
                  key={mode === "group" ? item.group_id : item.user_id}
                  mode={mode}
                  {...item}
                  id={mode === "group" ? item.group_id : item.user_id}
                  // first_name={
                  //   mode === "group" ? item.group_name : item.first_name
                  // }
                  // last_name={mode === "group" ? "" : item.last_name}
                  // img={item.img}
                  // email={
                  //   mode === "group"
                  //     ? item.sender_first_name
                  //       ? `From: ${item.sender_first_name} ${item.sender_last_name}`
                  //       : "No messages yet"
                  //     : item.email
                  // }
                  // online={item.online}
                  // unread={item.unread}
                  // message={item.message}
                  // time={item.sent_at}
                  isActive={
                    selectedId ===
                    (mode === "group" ? item.group_id : item.user_id)
                  }
                  // delivered={item.delivered}
                  // seen={item.seen}
                  // sender_id={item.sender_id}
                  // onSelect={onSelect}
                  onSelect={() => onSelect(item)}
                />
              ))
            ) : (
              <Typography align="center" variant="body2" color="text.secondary">
                No {mode === "group" ? "groups" : "chats"} found
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatListPane;

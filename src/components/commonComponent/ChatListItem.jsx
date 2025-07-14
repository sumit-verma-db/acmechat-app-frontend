import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Check, Checks } from "phosphor-react";
import StyledBadge from "../StyledBadge";

const formatChatTime = (time) => {
  if (!time) return "";
  const d = new Date(time);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString();
};

const ChatListItem = ({
  mode = "user", // 'user' or 'group'
  id,
  first_name,
  last_name,
  img,
  email,
  online,
  unread = 0,
  message,
  sent_at,
  isActive,
  delivered,
  seen,
  sender_id,
  onSelect,
  group_name,
}) => {
  const theme = useTheme();

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  const getMessageStatusIcon = (delivered, seen) => {
    if (seen) return <Checks size={17} color="#1976d2" weight="bold" />;
    if (delivered) return <Checks size={17} color="#999" />;
    return <Check size={17} color="#999" />;
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        backgroundColor: isActive
          ? theme.palette.mode === "light"
            ? "#D0E9FF"
            : "#1E3A8A"
          : theme.palette.mode === "light"
          ? "#fff"
          : theme.palette.background.default,
        borderLeft: isActive
          ? `4px solid ${theme.palette.primary.main}`
          : "4px solid transparent",
        boxShadow: isActive
          ? "0 4px 18px 0 rgba(25, 118, 210, 0.09)"
          : "0 1px 4px 0 rgba(16,30,54,0.03)",
        cursor: "pointer",
        transition:
          "background 0.22s, transform 0.16s, box-shadow 0.16s, border-color 0.22s",
        "&:hover": {
          backgroundColor: isActive
            ? theme.palette.mode === "light"
              ? "#C3D8FF"
              : "#254F9B"
            : theme.palette.mode === "light"
            ? "#F0F4FF"
            : "#2C3E70",
          transform: "scale(1.025)",
          boxShadow: "0 4px 18px 0 rgba(25,118,210,0.14)",
        },
      }}
      p={1}
      onClick={onSelect}

      // onClick={() =>
      //   onSelect({
      //     [`${mode}_id`]: id,
      //     first_name,
      //     last_name,
      //     img,
      //     email,
      //     online,
      //     unread,
      //   })
      // }
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2}>
          {/* {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              isOnline={online}
            >
              <Avatar src={img}>
                {mode === "group"
                  ? getInitials(group_name)
                  : getInitials(first_name, last_name)}
              </Avatar>
            </StyledBadge>
          ) : (
            <Avatar src={img}>
              {mode === "group"
                ? getInitials(group_name)
                : getInitials(first_name, last_name)}
            </Avatar>
          )} */}
          {mode === "group" ? (
            <Avatar src={img}>
              {mode === "group"
                ? getInitials(group_name)
                : getInitials(first_name, last_name)}
            </Avatar>
          ) : (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              isonline={online}
            >
              <Avatar src={img}>
                {mode === "group"
                  ? getInitials(group_name)
                  : getInitials(first_name, last_name)}
              </Avatar>
            </StyledBadge>
          )}
          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {mode === "group" ? group_name : `${first_name} ${last_name}`}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {mode === "user" &&
                sender_id !== parseInt(localStorage.getItem("userId")) &&
                getMessageStatusIcon(delivered, seen)}
              {message || email}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={2} alignItems="center">
          <Typography
            sx={{ fontWeight: 500, color: "#858585" }}
            variant="caption"
          >
            {sent_at && formatChatTime(sent_at)}
          </Typography>
          {!!unread && unread > 0 && (
            <Badge
              color="primary"
              badgeContent={unread > 9 ? "9+" : unread}
              sx={{
                "& .MuiBadge-badge": {
                  right: -3,
                  top: 4,
                  fontSize: 11,
                  padding: "0 5px",
                  minWidth: 18,
                  height: 18,
                  borderRadius: "8px",
                  boxShadow: "0 0 2px 1px #fff",
                  fontWeight: 700,
                },
              }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ChatListItem;

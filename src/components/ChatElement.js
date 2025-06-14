// import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
// import { useTheme, styled } from "@mui/material/styles";
// import StyledBadge from "./StyledBadge";

// //single chat element
// const ChatElement = ({
//   user_id,
//   first_name,
//   last_name,
//   message,
//   img,
//   email,
//   city,
//   msg,
//   time,
//   online,
//   unread,
//   onSelect,
//   sent_at,
//   isActive, // new prop to know if this chat is active
//   sx, // support additional styles from parent
// }) => {
//   // console.log(first_name, "MANNE");

//   const theme = useTheme();
//   function formatChatTime(sentAt) {
//     const d = new Date(sentAt);

//     // Show only the time if today, else show date in local format
//     const now = new Date();
//     const isToday =
//       d.getDate() === now.getDate() &&
//       d.getMonth() === now.getMonth() &&
//       d.getFullYear() === now.getFullYear();

//     if (isToday) {
//       // Example output: "2:54 PM"
//       return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     } else {
//       // Example output: "13/06/2025"
//       return d.toLocaleDateString();
//     }
//   }

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         borderRadius: 1,
//         backgroundColor: isActive
//           ? theme.palette.mode === "light"
//             ? "#D0E9FF" // light active background color
//             : "#1E3A8A" // dark active background color (blue shade)
//           : theme.palette.mode === "light"
//           ? "#fff"
//           : theme.palette.background.default,
//         borderLeft: isActive
//           ? `4px solid ${theme.palette.primary.main}`
//           : "4px solid transparent",
//         cursor: "pointer",
//         transition: "background-color 0.3s, transform 0.2s, box-shadow 0.2s",
//         "&:hover": {
//           backgroundColor: isActive
//             ? theme.palette.mode === "light"
//               ? "#C3D8FF"
//               : "#254F9B"
//             : theme.palette.mode === "light"
//             ? "#F0F4FF"
//             : "#2C3E70",
//           transform: "scale(1.02)",
//           boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
//         },
//         ...sx,
//       }}
//       p={2}
//       onClick={() =>
//         onSelect({
//           user_id,
//           first_name,
//           last_name,
//           img,
//           email,
//           city,
//           online,
//           unread,
//         })
//       }
//     >
//       {/* // <Box
//     //   sx={{
//     //     width: "100%",
//     //     borderRadius: 1,
//     //     backgroundColor:
//     //       theme.palette.mode === "light"
//     //         ? "#fff"
//     //         : theme.palette.background.default,
//     //     ...sx,
//     //   }}
//     //   p={2}
//     //   onClick={() =>
//     //     onSelect({ user_id, first_name, img, email, city, online, unread })
//     //   } // Pas
//     // > */}
//       <Stack direction="row" alignItems="center" justifyContent="space-between">
//         <Stack direction="row" spacing={2}>
//           {online ? (
//             <StyledBadge
//               overlap="circular"
//               anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//               variant="dot"
//             >
//               <Avatar src={img} />
//             </StyledBadge>
//           ) : (
//             <Avatar src={img} />
//           )}

//           <Stack spacing={0.3}>
//             <Typography variant="subtitle2">{`${first_name} ${last_name}`}</Typography>
//             <Typography variant="caption">{message || email}</Typography>
//           </Stack>
//         </Stack>
//         <Stack spacing={2} alignItems="center">
//           <Typography sx={{ fontWeight: 600 }} variant="caption">
//             {sent_at && formatChatTime(sent_at)}
//           </Typography>
//           <Badge color="primary" badgeContent={unread}></Badge>
//         </Stack>
//       </Stack>
//     </Box>
//   );
// };

// export default ChatElement;
import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import StyledBadge from "./StyledBadge";
import { Check, Checks } from "phosphor-react";

const formatChatTime = (sentAt) => {
  if (!sentAt) return "";
  const d = new Date(sentAt);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString();
};

const ChatElement = ({
  user_id,
  first_name,
  last_name,
  message,
  img,
  email,
  city,
  msg,
  time,
  online,
  unread,
  onSelect,
  sent_at,
  delivered,
  sender_id,
  seen,
  isActive, // new prop to know if this chat is active
  sx, // support additional styles from parent
}) => {
  const theme = useTheme();

  // Helper for avatar initials
  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  const getMessageStatusIcon = (delivered, seen) => {
    if (seen) {
      return <Checks size={17} color="#1976d2" weight="bold" />;
    }
    if (delivered) {
      return <Checks size={17} color="#999" />;
    }
    // Sent (but not delivered)
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
        ...sx,
      }}
      p={2}
      onClick={() =>
        onSelect({
          user_id,
          first_name,
          last_name,
          img,
          email,
          city,
          online,
          unread,
        })
      }
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2}>
          {online ? (
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar src={img}>
                {!img && getInitials(first_name, last_name)}
              </Avatar>
            </StyledBadge>
          ) : (
            <Avatar src={img}>
              {!img && getInitials(first_name, last_name)}
            </Avatar>
          )}

          <Stack spacing={0.3} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {`${first_name} ${last_name}`}
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
              {sender_id !== parseInt(localStorage.getItem("userId")) &&
                getMessageStatusIcon(delivered, seen)}
              {message || email}
            </Typography>

            {/* <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {message || email}
            </Typography> */}
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

export default ChatElement;

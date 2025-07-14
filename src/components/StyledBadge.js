// src/components/StyledBadge.js
import styled from "@emotion/styled";
import { Badge } from "@mui/material";

const StyledBadge = styled(Badge, {
  shouldForwardProp: (prop) => prop !== "isonline",
})(({ theme, ...props }) => {
  const isonline = props.isonline; // boolean
  return {
    "& .MuiBadge-badge": {
      backgroundColor: isonline ? "#44b700" : "#ccc",
      color: isonline ? "#44b700" : "#ccc",
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      "&::after": {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        animation: "ripple 1.2s infinite ease-in-out",
        border: "1px solid currentColor",
        content: '""',
      },
    },
    "@keyframes ripple": {
      "0%": { transform: "scale(.8)", opacity: 1 },
      "100%": { transform: "scale(2.4)", opacity: 0 },
    },
  };
});

export default StyledBadge;

// import styled from "@emotion/styled";
// import { Badge } from "@mui/material";

// const StyledBadge = styled(Badge)(({ theme, isonline = false }) => ({
//   "& .MuiBadge-badge": {
//     // backgroundColor: "#44b700",
//     // color: "#44b700",
//     backgroundColor: isonline ? "#44b700" : "#ccc", // Green for online, gray for offline
//     color: isonline ? "#44b700" : "#ccc",
//     boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
//     "&::after": {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       borderRadius: "50%",
//       animation: "ripple 1.2s infinite ease-in-out",
//       border: "1px solid currentColor",
//       content: '""',
//     },
//   },
//   "@keyframes ripple": {
//     "0%": {
//       transform: "scale(.8)",
//       opacity: 1,
//     },
//     "100%": {
//       transform: "scale(2.4)",
//       opacity: 0,
//     },
//   },
// }));

// export default StyledBadge;

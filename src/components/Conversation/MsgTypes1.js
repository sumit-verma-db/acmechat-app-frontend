import React from "react";
import {
  Box,
  Divider,
  Stack,
  Typography,
  Menu,
  MenuItem,
  Button,
  useTheme,
} from "@mui/material";
import {
  DotsThreeVertical,
  File as FileIcon,
  Checks,
  Check,
  VideoCamera,
  Phone,
} from "phosphor-react";
import { Message_options } from "../../data";
import { axiosGet } from "../../services/apiServices";

const MessageOptions = () => {
  const [anchorEl, setAnchorEl] =
    (React.useState < null) | (HTMLElement > null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <DotsThreeVertical
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size={20}
        style={{ cursor: "pointer" }}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "basic-button" }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el, i) => (
            <MenuItem key={i} onClick={handleClose}>
              {el.title}
            </MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
};

const DocMsg = ({ el, menu, fromMe = false, isGroup = false }) => {
  const theme = useTheme();
  const bubbleBg = fromMe
    ? "#DCF8C6" // WhatsApp green bubble
    : theme.palette.background.paper;

  const handleFileOpen = async (id) => {
    try {
      const response = await axiosGet(`/api/auth/download/${id.file_id}`, {
        responseType: "blob",
      });
      const fileBlob = new Blob([response], { type: id.file_type });
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL);
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      alert("Failed to open file.");
      console.error(error);
    }
  };

  const downloadPdfFile = async (id) => {
    try {
      const response = await axiosGet(`/api/auth/download/${id.file_id}`, {
        responseType: "blob",
      });
      const fileBlob = new Blob([response], { type: id.file_type });
      const fileURL = URL.createObjectURL(fileBlob);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = id.file_name || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      alert("Failed to download file.");
      console.error(error);
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      spacing={1}
      alignItems="flex-end"
      sx={{ width: "100%" }}
    >
      <Box
        sx={{
          backgroundColor: bubbleBg,
          borderRadius: 2,
          maxWidth: 320,
          minWidth: 200,
          p: 1,
          boxShadow: fromMe
            ? "0 1px 5px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {isGroup && !fromMe && (
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            {el.sender_name || `User ${el.sender_id || el.sender}`}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            p: 2,
          }}
        >
          <FileIcon size={32} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {el.file_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {el.file_size}, {el.file_type}
            </Typography>
          </Box>
        </Box>
        {/* --- Show Caption if Present --- */}
        {!!el.message && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mx: 1,
              color: theme.palette.text.secondary,
              fontStyle: "italic",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {el.message}
          </Typography>
        )}
        <Stack direction="row" spacing={1} mt={1} px={1}>
          <Button
            size="small"
            variant="outlined"
            sx={{ textTransform: "none", flexShrink: 0 }}
            onClick={() => handleFileOpen(el)}
          >
            Open
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{ textTransform: "none", flexShrink: 0 }}
            onClick={() => downloadPdfFile(el)}
          >
            Save as…
          </Button>
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 1, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(el.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
          {fromMe && (
            <>
              {el.seen ? (
                <Checks size={14} weight="bold" color="blue" />
              ) : el.delivered ? (
                <Checks size={14} weight="bold" />
              ) : (
                <Check size={14} weight="regular" />
              )}
            </>
          )}
        </Box>
      </Box>

      {menu && <MessageOptions />}
    </Stack>
  );
};

const LinkMsg = ({ el, menu, fromMe = false, isGroup = false }) => {
  const theme = useTheme();
  const bgColor = fromMe ? "#DCF8C6" : theme.palette.background.paper;

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      <Box
        p={1.5}
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          maxWidth: 320,
          width: "max-content",
        }}
      >
        {isGroup && !fromMe && (
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            {el.sender_name || `User ${el.sender_id || el.sender}`}
          </Typography>
        )}
        <Stack
          spacing={2}
          sx={{
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            p: 2,
          }}
        >
          <img
            src={el.preview}
            alt={el.message}
            style={{
              maxHeight: 210,
              borderRadius: 10,
              width: "100%",
              objectFit: "cover",
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.primary.main }}
            component="a"
            href={el.message}
            target="_blank"
            rel="noopener noreferrer"
          >
            {el.message}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};

const ReplyMsg = ({ el, menu, fromMe = false, isGroup = false }) => {
  const theme = useTheme();
  const bgColor = fromMe ? "#DCF8C6" : theme.palette.background.paper;

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      <Box
        p={1.5}
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          maxWidth: 320,
          width: "max-content",
        }}
      >
        {isGroup && !fromMe && (
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            {el.sender_name || `User ${el.sender_id || el.sender}`}
          </Typography>
        )}
        <Stack
          spacing={1}
          sx={{
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="body2" color={theme.palette.text.primary}>
            {el.message}
          </Typography>
          <Typography variant="body2" color={fromMe ? "#000" : "#555"}>
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};

const MediaMsg = ({ el, menu, fromMe = false, isGroup = false }) => {
  const theme = useTheme();
  const bgColor = fromMe ? "#DCF8C6" : theme.palette.background.paper;

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
      spacing={1}
      alignItems="flex-end"
    >
      <Box
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          padding: 1,
          maxWidth: 280,
          boxShadow: fromMe
            ? "0 1px 5px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={`${process.env.REACT_APP_API_URL}${el.file_url}`}
          alt={el.message || "image"}
          style={{
            width: "100%",
            maxHeight: 210,
            borderRadius: 12,
            objectFit: "cover",
            display: "block",
          }}
        />
        {el.message && (
          <Typography
            variant="body2"
            sx={{
              marginTop: 0.5,
              color: fromMe ? "#000" : theme.palette.text.primary,
            }}
          >
            {el.message}
          </Typography>
        )}
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};

const TextMsg = ({ el, menu, fromMe = false, isGroup = false }) => {
  const theme = useTheme();
  const bgColor = fromMe ? "#DCF8C6" : theme.palette.background.paper;

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      <Box
        p={1.5}
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          // width: "50%",
          minWidth: "7rem",
          maxWidth: "50%",
          boxShadow: fromMe
            ? "0 1px 5px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          width: "fit-content",
          whiteSpace: "normal",
          overflowWrap: "break-word", // ✅ additional browser support
          wordBreak: "break-word",
        }}
      >
        {isGroup && !fromMe && (
          <Typography
            variant="caption"
            sx={{ fontWeight: "bold", color: "#1976d2", mb: 1 }}
          >
            {el.sender_name || `User ${el.sender_id || el.sender}`}
          </Typography>
        )}
        <Typography
          variant="body2"
          color={fromMe ? "#000" : theme.palette.text.primary}
        >
          {el.message}
        </Typography>
        {/* <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 1, mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(el.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box> */}
        <Box
          sx={{
            display: "flex",
            justifyContent: fromMe ? "flex-end" : "flex-start",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ color: "#555" }}>
            {new Date(el.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {/* {new Date(el.sent_at).toLocaleTimeString()} */}
          </Typography>
          {fromMe && (
            <>
              {el.seen ? (
                <Checks size={14} weight="bold" color="blue" />
              ) : el.delivered ? (
                <Checks size={14} weight="bold" />
              ) : (
                <Check size={14} weight="regular" />
              )}
            </>
          )}
        </Box>
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};
const CallMsg = ({ el, fromMe }) => {
  const theme = useTheme();
  const bgColor = fromMe ? "#DCF8C6" : theme.palette.background.paper;
  // console.log(el, fromMe, "callType=====");

  const Icon = el.type === "video" ? VideoCamera : Phone;
  const label =
    (el.type === "video" ? "Video" : "Audio") +
    " Call - " +
    el.status.charAt(0).toUpperCase() +
    el.status.slice(1);

  return (
    <Stack
      direction="row"
      justifyContent={fromMe ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      <Box
        p={1.5}
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          minWidth: "7rem",
          maxWidth: "50%",
          boxShadow: fromMe
            ? "0 1px 5px rgba(0,0,0,0.2)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          width: "fit-content",
          whiteSpace: "normal",
          overflowWrap: "break-word", // ✅ additional browser support
          wordBreak: "break-word",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon size={18} color="#1976d2" />
          <Typography variant="body2">{label}</Typography>
        </Box>
        {/* Only show duration if call was accepted */}
        {el.status === "accepted" && el.durationSeconds != null && (
          <Typography variant="caption" color="text.secondary" mt={0.5}>
            {el.durationSeconds} secs
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: fromMe ? "flex-end" : "flex-start",
            mt: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {new Date(el.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};
const TimeLine = ({ el }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Divider width="46%" />
      <Typography variant="caption" sx={{ color: theme.palette.text }}>
        {el.text}
      </Typography>
      <Divider width="46%" />
    </Stack>
  );
};

export {
  CallMsg,
  TimeLine,
  TextMsg,
  MediaMsg,
  ReplyMsg,
  LinkMsg,
  DocMsg,
  MessageOptions,
};

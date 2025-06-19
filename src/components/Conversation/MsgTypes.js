import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DotsThreeVertical, DownloadSimple, Image } from "phosphor-react";
import { Message_options } from "../../data";
import { element } from "prop-types";

import { Button } from "@mui/material";
import React from "react";
import { File as FileIcon } from "phosphor-react";
import { axiosGet } from "../../services/apiServices";

interface DocMsgProps {
  menu?: boolean;
}

const DocMsg: React.FC<DocMsgProps> = ({ el, menu }) => {
  const theme = useTheme();
  const align = el.incoming ? "flex-start" : "flex-end";
  const bubbleBg = el.incoming
    ? theme.palette.background.default
    : theme.palette.background.paper;
  // Open file in new tab

  // URL of the file to open or download
  const fileUrl = el.file_url; // ensure your backend sends this
  const fileName = el.file_name;

  // const handleFileOpen = async (id) => {
  //   console.log(id, "IDDD");
  //   let data = await axiosGet(`api/auth/download/${id.file_id}`);
  //   console.log(data, "DATA");
  //   if (data) {
  //     window.open(data, "_blank", "noopener,noreferrer");
  //   } else {
  //     alert("File URL not available");
  //   }
  // };
  const handleFileOpen = async (id) => {
    try {
      const response = await axiosGet(`/api/auth/download/${id.file_id}`, {
        responseType: "blob",
      });
      // console.log(response, "RESPONSE");

      // Create a Blob URL from the PDF binary data
      const fileBlob = new Blob([response], { type: id.file_type });
      const fileURL = URL.createObjectURL(fileBlob);

      // Open the blob URL in a new tab
      window.open(fileURL);

      // Optional: revoke the URL after some time to free memory
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error("File open error:", error);
      alert("Failed to open file.");
    }
  };

  // Trigger download with Save As
  const downloadPdfFile = async (el) => {
    try {
      const response = await axiosGet(`/api/auth/download/${el.file_id}`, {
        responseType: "blob",
      });

      const fileBlob = new Blob([response], { type: el.file_type });
      const fileURL = URL.createObjectURL(fileBlob);

      const a = document.createElement("a");
      a.href = fileURL;
      a.download = el.file_name || "file.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error("Error downloading PDF file:", error);
      alert("Failed to download file.");
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent={align}
      spacing={1}
      alignItems="flex-end"
      // sx={{ width: "100%" }}
    >
      {/* 1) Attachment Bubble */}
      <Box
        sx={{
          backgroundColor: bubbleBg,
          borderRadius: 2,
          maxWidth: 320, // max width instead of fixed
          minWidth: 200, // minimum width for consistency
          p: 1,
          boxShadow: el.incoming
            ? "0 1px 3px rgba(0,0,0,0.1)"
            : "0 1px 5px rgba(0,0,0,0.2)", // subtle shadow
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <Box key={el.id} mb={2}>
          {/* 1.1 File Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: theme.palette.background.paper,
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

          {/* 1.2 Action Buttons */}
          <Stack direction="row" spacing={1} mt={1} px={1}>
            <Button
              size="small"
              fullWidth
              variant="outlined"
              sx={{ textTransform: "none", flexShrink: 2 }}
              onClick={() => handleFileOpen(el)}
            >
              Open
            </Button>
            <Button
              size="small"
              fullWidth
              variant="outlined"
              // sx={{ textTransform: "none", minWidth: 80, flexShrink: 0 }}
              sx={{ textTransform: "none", flexShrink: 2 }}
              onClick={() => downloadPdfFile(el)}
            >
              Save as…
            </Button>
          </Stack>
        </Box>

        {/* 1.3 Timestamp */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(el.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      </Box>

      {/* 2) Optional three-dot menu */}
      {menu && <MessageOptions />}
    </Stack>
  );
};
const LinkMsg = ({ el, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: el.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            spacing={3}
            alignItems="start"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <img
              src={el.preview}
              alt={el.message}
              style={{ maxHeight: 210, borderRadius: "10px" }}
            />
            <Stack spacing={2}>
              <Typography variant="subtitle2">Creating Chat App</Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: theme.palette.primary.main }}
                component={Link}
                to="//https://www.youtube.com"
              >
                www.youtube.com
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color={el.incoming ? theme.palette.text : "#fff"}
            >
              {el.message}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};

const ReplyMsg = ({ el, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: el.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack spacing={2}>
          <Stack
            p={2}
            direction="column"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color={theme.palette.text}>
              {el.message}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color={el.incoming ? theme.palette.text : "#fff"}
          >
            {el.reply}
          </Typography>
        </Stack>
      </Box>
      {menu && <MessageOptions />}
    </Stack>
  );
};

const MediaMsg = ({ el, menu }) => {
  const theme = useTheme();
  const align = el.incoming ? "flex-start" : "flex-end";
  const bgColor = el.incoming
    ? theme.palette.background.default
    : theme.palette.primary.main;

  return (
    <Stack
      direction="row"
      justifyContent={align}
      spacing={1}
      alignItems="flex-end"
    >
      <Box
        sx={{
          backgroundColor: bgColor,
          borderRadius: 2,
          padding: 1,
          maxWidth: 280, // max width like WhatsApp image bubble
          boxShadow: el.incoming
            ? "0 1px 3px rgba(0,0,0,0.1)"
            : "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <img
          src={`${process.env.REACT_APP_API_URL}${el.file_url}`}
          //   src={el.file_url}
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
              color: el.incoming ? theme.palette.text.primary : "#fff",
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

const TextMsg = ({ el, menu }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" justifyContent={el.incoming ? "start" : "end"}>
      <Box
        p={1.5}
        sx={{
          backgroundColor: el.incoming
            ? theme.palette.background.default
            : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Typography
          variant="body2"
          color={el.incoming ? theme.palette.text : "#fff"}
        >
          {el.message}
        </Typography>
      </Box>
      {menu && <MessageOptions />}
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

const MessageOptions = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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
      />

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
          {Message_options.map((el) => (
            <MenuItem onClick={handleClick}>{el.title}</MenuItem>
          ))}
        </Stack>
      </Menu>
    </>
  );
};

// should not be default export, because we need to export multiple things
export { TimeLine, TextMsg, MediaMsg, ReplyMsg, LinkMsg, DocMsg };

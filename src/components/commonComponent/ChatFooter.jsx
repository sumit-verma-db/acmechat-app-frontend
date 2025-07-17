import {
  Box,
  Button,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Camera,
  File,
  Image,
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Sticker,
  User,
} from "phosphor-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useSocket } from "../../contexts/SocketProvider";
const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 102,
    title: "Photo/Video",
  },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 172,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 242,
    title: "Image",
  },
  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 312,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 382,
    title: "Contact",
  },
];
const ChatFooter = ({ selectedUser, setChatData, isGroup }) => {
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [openPicker, setOpenPicker] = useState(false);
  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef(null);
  const [openAction, setOpenAction] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const { sendMessage, sendGroupMessage } = useSocket();
  const [filePreview, setFilePreview] = useState(null); // { file, url }
  const [caption, setCaption] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  //   const isGroup = !!selectedGroup;
  //   const target = selectedUser || selectedGroup;

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender_id: currentUserId,
      message: message.trim(),
      type: "text",
      sent_at: new Date().toISOString(),
      ...(isGroup
        ? { group_id: selectedUser.group_id }
        : { receiver_id: selectedUser.user_id }),
    };
    // console.log(newMessage, "NEW MESSAGE");

    // ✅ Send via socket
    if (isGroup) {
      sendGroupMessage(selectedUser.group_id, newMessage);
    } else {
      // console.log("Test user");
      // console.log(newMessage, "newMessage");
      sendMessage(newMessage);
    }

    // ✅ Optimistic UI update (optional)
    // setChatData((prev) => [...prev, { ...newMessage, fromMe: true, ...otherFlags }]);

    setMessage("");
    setOpenPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setOpenPicker(false);
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;

    const url = URL.createObjectURL(file);
    setFilePreview({ file, url });

    setShowFileModal(true); // Show preview dialog
    setCaption(""); // Reset caption
    setOpenAction(false);
  };
  const handleDocumentSend = () => {
    // console.log(filePreview, "FILEPREVIEW");
    const metadata = {
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      sent_at: new Date().toISOString(),
      type: "document",
      file_name: filePreview.file.name,
      file_type: filePreview.file.type,
      file_size: filePreview.file.size,
      message: caption,
    };

    const payload = {
      ...metadata,
      file: filePreview.file,
    };
    console.log(payload, "Payload");
    const sentMessage = sendMessage(payload); // Automatically joins and returns roomId
    console.log(sentMessage, payload, "SENTMESSAGE------->");

    setFilePreview(null);
    setCaption("");
    setShowFileModal(false);
  };
  return (
    <>
      <Box
        p={2}
        sx={{
          width: "100%",
          position: "sticky",
          bottom: { xs: 56, sm: 0 },
          zIndex: 10,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0,0,0,0.25)",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept={
            fileType === "image"
              ? "image/*"
              : fileType === "video"
              ? "video/*"
              : fileType === "document"
              ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              : "*"
          }
          onChange={handleFileUpload}
        />
        {openPicker && (
          <Box
            sx={{ position: "absolute", bottom: 70, right: 20, zIndex: 1000 }}
          >
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </Box>
        )}

        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            fullWidth
            placeholder="Write a message..."
            variant="filled"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            InputProps={{
              disableUnderline: true,
              sx: {
                padding: "10px 14px",
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "#F0F4FA"
                    : theme.palette.background.default,
                borderRadius: 2,
                "& .MuiInputBase-input": {
                  padding: 0,
                  fontSize: 16,
                },
              },
              startAdornment: (
                <Stack sx={{ width: "max-content" }}>
                  <Stack
                    sx={{
                      position: "relative",
                      display: openAction ? "inline-block" : "none",
                    }}
                  >
                    {Actions.map((el) => (
                      <Tooltip
                        key={el.title}
                        placement="right"
                        title={el.title}
                      >
                        <Fab
                          sx={{
                            position: "absolute",
                            top: -el.y,
                            backgroundColor: el.color,
                          }}
                          onClick={() => {
                            const typeMap = {
                              "Photo/Video": "video",
                              Image: "image",
                              Document: "document",
                            };
                            setFileType(typeMap[el.title] || "");
                            setTimeout(
                              () => fileInputRef.current?.click(),
                              100
                            );
                          }}
                        >
                          {el.icon}
                        </Fab>
                      </Tooltip>
                    ))}
                  </Stack>
                  <InputAdornment position="start">
                    <IconButton
                      onClick={() => {
                        setOpenAction((prev) => !prev);
                      }}
                    >
                      <LinkSimple />
                    </IconButton>
                  </InputAdornment>
                </Stack>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setOpenPicker(!openPicker)}>
                    <Smiley />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1.5,
            }}
          >
            <Stack
              sx={{
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton onClick={handleSendMessage}>
                <PaperPlaneTilt color="#fff" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {showFileModal && filePreview && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: 400,
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 24,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box>
              {filePreview.file.type.startsWith("image/") ? (
                <img
                  src={filePreview.url}
                  alt="preview"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                  }}
                >
                  <File size={48} />
                  <span>{filePreview.file.name}</span>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              variant="outlined"
              label="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button onClick={() => setShowFileModal(false)}>Cancel</Button>
              <Button
                variant="contained"
                // onClick={() => {
                //   const metadata = {
                //     sender_id: currentUserId,
                //     receiver_id: selectedUser.user_id,
                //     sent_at: new Date().toISOString(),
                //     type: "file",
                //     file_name: filePreview.file.name,
                //     file_type: filePreview.file.type,
                //     file_size: filePreview.file.size,
                //     message: caption,
                //   };

                //   const payload = {
                //     ...metadata,
                //     file: filePreview.file,
                //   };

                //   sendMessage(payload);
                //   console.log("File sent with caption:", payload);

                //   setFilePreview(null);
                //   setCaption("");
                //   setShowFileModal(false);
                // }}
                onClick={handleDocumentSend}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatFooter;

// ...other imports
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Stack,
  IconButton,
  Divider,
  Switch,
  Checkbox,
  FormControlLabel,
  TextField,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import { axiosGet, postFetch } from "../../../services/apiServices";

// ====================
// Policy Creation Modal
// ====================
function PolicyCreateModal({ open, onClose, onCreated }) {
  const [policyName, setPolicyName] = useState("");
  const [userAccess, setUserAccess] = useState({});
  const [fileAccess, setFileAccess] = useState({});
  const [fileSize, setFileSize] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [userAccessFields, setUserAccessFields] = useState([
    { key: "userAppAccess", label: "App" },
    { key: "userWebAccess", label: "Web" },
  ]);

  const [fileAccessFields, setFileAccessFields] = useState([
    { key: "docx", label: "DOCX" },
    { key: "xlsx", label: "XLSX" },
    { key: "csv", label: "CSV" },
    { key: "png", label: "PNG" },
    { key: "jpeg", label: "JPEG" },
  ]);

  const [newAccessKey, setNewAccessKey] = useState("");
  const [newAccessLabel, setNewAccessLabel] = useState("");
  const [newFileKey, setNewFileKey] = useState("");
  const [newFileLabel, setNewFileLabel] = useState("");

  useEffect(() => {
    if (open) {
      setPolicyName("");
      setUserAccess({});
      setFileAccess({});
      setFileSize({});
      setErrorMsg("");
    }
  }, [open]);

  const handleUserAccessChange = (field) => (e) => {
    setUserAccess((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleFileAccessChange = (type) => (e) => {
    setFileAccess((prev) => ({ ...prev, [type]: e.target.checked }));
    if (!e.target.checked) setFileSize((prev) => ({ ...prev, [type]: "" }));
  };

  const handleFileSizeChange = (type) => (e) => {
    const value = e.target.value.replace(/\D/, "");
    setFileSize((prev) => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const allowedFileAccess = {};
      const allowedFileSize = {};
      fileAccessFields.forEach(({ key }) => {
        if (fileAccess[key]) {
          allowedFileAccess[key] = true;
          allowedFileSize[key] = fileSize[key]
            ? parseInt(fileSize[key], 10)
            : 0;
        }
      });

      const payload = {
        policy_name: policyName,
        user_access: userAccess,
        file_access: allowedFileAccess,
        file_size: allowedFileSize,
      };

      await postFetch("/api/auth/create-policy", payload);
      setLoading(false);
      onCreated();
      onClose();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to create policy. Try again."
      );
      setLoading(false);
    }
  };

  const addNewUserAccessField = () => {
    if (!newAccessKey || !newAccessLabel) return;
    setUserAccessFields((prev) => [
      ...prev,
      { key: newAccessKey, label: newAccessLabel },
    ]);
    setNewAccessKey("");
    setNewAccessLabel("");
  };

  const addNewFileAccessField = () => {
    if (!newFileKey || !newFileLabel) return;
    setFileAccessFields((prev) => [
      ...prev,
      { key: newFileKey, label: newFileLabel },
    ]);
    setNewFileKey("");
    setNewFileLabel("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Policy</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit} id="policy-create-form">
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Policy Name"
              fullWidth
              required
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                User Access
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {userAccessFields.map(({ key, label }) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={userAccess[key] || false}
                        onChange={handleUserAccessChange(key)}
                      />
                    }
                    label={label}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} mt={1}>
                <TextField
                  label="New Key"
                  size="small"
                  value={newAccessKey}
                  onChange={(e) => setNewAccessKey(e.target.value)}
                />
                <TextField
                  label="New Label"
                  size="small"
                  value={newAccessLabel}
                  onChange={(e) => setNewAccessLabel(e.target.value)}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={addNewUserAccessField}
                >
                  + Add
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                File Access & Max File Size (KB)
              </Typography>
              <Stack spacing={1}>
                {fileAccessFields.map(({ key, label }) => (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    key={key}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={fileAccess[key] || false}
                          onChange={handleFileAccessChange(key)}
                        />
                      }
                      label={label}
                    />
                    <TextField
                      label="Max Size (KB)"
                      size="small"
                      sx={{ width: 120 }}
                      type="number"
                      value={fileSize[key] || ""}
                      onChange={handleFileSizeChange(key)}
                      disabled={!fileAccess[key]}
                      required={fileAccess[key]}
                      inputProps={{ min: 1 }}
                    />
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} mt={1}>
                <TextField
                  label="New Key"
                  size="small"
                  value={newFileKey}
                  onChange={(e) => setNewFileKey(e.target.value)}
                />
                <TextField
                  label="New Label"
                  size="small"
                  value={newFileLabel}
                  onChange={(e) => setNewFileLabel(e.target.value)}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={addNewFileAccessField}
                >
                  + Add
                </Button>
              </Stack>
            </Box>

            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          form="policy-create-form"
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PolicyCreateModal;

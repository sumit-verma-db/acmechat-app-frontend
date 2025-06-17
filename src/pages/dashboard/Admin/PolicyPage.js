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
} from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { axiosGet, postFetch } from "../../../services/apiServices";
import PolicyCreateModal from "./PolicyCreateModal";

// File types used in policy
const fileTypes = ["docx", "xlsx", "csv", "png", "jpeg"];
const defaultFileAccess = fileTypes.reduce((acc, type) => {
  acc[type] = false;
  return acc;
}, {});
const defaultFileSize = fileTypes.reduce((acc, type) => {
  acc[type] = "";
  return acc;
}, {});

// ====================
// Policy Creation Modal
// ====================
// function PolicyCreateModal({ open, onClose, onCreated }) {
//   const [policyName, setPolicyName] = useState("");
//   const [userAccess, setUserAccess] = useState({
//     userAppAccess: false,
//     userWebAccess: false,
//     // userCanCreateGroup: false,
//   });
//   const [fileAccess, setFileAccess] = useState({ ...defaultFileAccess });
//   const [fileSize, setFileSize] = useState({ ...defaultFileSize });
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   // Reset fields on modal open/close
//   useEffect(() => {
//     if (open) {
//       setPolicyName("");
//       setUserAccess({
//         userAppAccess: false,
//         userWebAccess: false,
//         // userCanCreateGroup: false,
//       });
//       setFileAccess({ ...defaultFileAccess });
//       setFileSize({ ...defaultFileSize });
//       setErrorMsg("");
//     }
//   }, [open]);

//   const handleUserAccessChange = (field) => (event) => {
//     setUserAccess((prev) => ({ ...prev, [field]: event.target.checked }));
//   };

//   const handleFileAccessChange = (type) => (event) => {
//     setFileAccess((prev) => ({ ...prev, [type]: event.target.checked }));
//     if (!event.target.checked) setFileSize((prev) => ({ ...prev, [type]: "" }));
//   };

//   const handleFileSizeChange = (type) => (event) => {
//     const value = event.target.value.replace(/\D/, "");
//     setFileSize((prev) => ({ ...prev, [type]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMsg("");
//     setLoading(true);

//     try {
//       // Filter only allowed file types and sizes
//       const allowedFileAccess = {};
//       const allowedFileSize = {};
//       fileTypes.forEach((type) => {
//         if (fileAccess[type]) {
//           allowedFileAccess[type] = true;
//           allowedFileSize[type] = fileSize[type]
//             ? parseInt(fileSize[type], 10)
//             : 0;
//         }
//       });

//       const payload = {
//         policy_name: policyName,
//         user_access: userAccess,
//         file_access: allowedFileAccess,
//         file_size: allowedFileSize,
//       };

//       await postFetch("/api/auth/create-policy", payload);
//       setLoading(false);
//       onCreated(); // Notify parent
//       onClose();
//     } catch (err) {
//       setErrorMsg(
//         err.response?.data?.message || "Failed to create policy. Try again."
//       );
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>Create New Policy</DialogTitle>
//       <DialogContent dividers>
//         <form onSubmit={handleSubmit} id="policy-create-form">
//           <Stack spacing={2} sx={{ mt: 1 }}>
//             <TextField
//               label="Policy Name"
//               fullWidth
//               required
//               value={policyName}
//               onChange={(e) => setPolicyName(e.target.value)}
//             />
//             <Box>
//               <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                 User Access
//               </Typography>
//               <Stack direction="row" spacing={2}>
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={userAccess.userAppAccess}
//                       onChange={handleUserAccessChange("userAppAccess")}
//                     />
//                   }
//                   label="App"
//                 />
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={userAccess.userWebAccess}
//                       onChange={handleUserAccessChange("userWebAccess")}
//                     />
//                   }
//                   label="Web"
//                 />
//                 {/* <FormControlLabel
//                   control={
//                     <Switch
//                       checked={userAccess.userCanCreateGroup}
//                       onChange={handleUserAccessChange("userCanCreateGroup")}
//                     />
//                   }
//                   label="Create Group"
//                 /> */}
//               </Stack>
//             </Box>
//             <Box>
//               <Typography variant="subtitle1" sx={{ mb: 1 }}>
//                 File Access & Max File Size (KB)
//               </Typography>
//               <Stack spacing={1}>
//                 {fileTypes.map((type) => (
//                   <Stack
//                     direction="row"
//                     alignItems="center"
//                     spacing={1}
//                     key={type}
//                   >
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           checked={fileAccess[type]}
//                           onChange={handleFileAccessChange(type)}
//                         />
//                       }
//                       label={type.toUpperCase()}
//                     />
//                     <TextField
//                       label="Max Size (KB)"
//                       size="small"
//                       sx={{ width: 120 }}
//                       type="number"
//                       value={fileSize[type]}
//                       onChange={handleFileSizeChange(type)}
//                       disabled={!fileAccess[type]}
//                       required={fileAccess[type]}
//                       inputProps={{ min: 1 }}
//                     />
//                   </Stack>
//                 ))}
//               </Stack>
//             </Box>
//             {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
//           </Stack>
//         </form>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="secondary">
//           Cancel
//         </Button>
//         <Button
//           form="policy-create-form"
//           type="submit"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? <CircularProgress size={22} /> : "Create"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// ====================
// Main Policy Page
// ====================
export default function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Fetch policies
  const fetchPolicies = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const data = await axiosGet("/api/auth/policy-dd");
      console.log(data, "fetchPolicies");
      setPolicies(data?.policies || data); // use .policies if API wraps, else direct
    } catch (err) {
      setFetchError(err.response?.data?.message || "Failed to fetch policies.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <Box sx={{ mx: "auto", mt: 4 }}>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" gutterBottom>
              Policies
            </Typography>
            <Button
              variant="contained"
              //   startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
            >
              New Policy
            </Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {fetchError && <Alert severity="error">{fetchError}</Alert>}
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Policy Name</TableCell>
                    <TableCell>User App</TableCell>
                    <TableCell>User Web</TableCell>
                    <TableCell>Create Group</TableCell>
                    <TableCell>File Types Allowed</TableCell>
                    <TableCell>Max File Size (KB)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No policies found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    policies.map((p) => (
                      <TableRow key={p.policy_id || p.id || p.policy_name}>
                        <TableCell>{p.policy_name}</TableCell>
                        <TableCell>
                          {p.user_access?.userAppAccess ? "✅" : "❌"}
                        </TableCell>
                        <TableCell>
                          {p.user_access?.userWebAccess ? "✅" : "❌"}
                        </TableCell>
                        <TableCell>
                          {p.user_access?.userCanCreateGroup ? "✅" : "❌"}
                        </TableCell>
                        <TableCell>
                          {Object.keys(p.file_access || {})
                            .filter((type) => p.file_access[type])
                            .map((type) => type.toUpperCase())
                            .join(", ")}
                        </TableCell>
                        <TableCell>
                          {Object.keys(p.file_size || {})
                            .map((type) =>
                              p.file_access?.[type]
                                ? `${type.toUpperCase()}: ${p.file_size[type]}`
                                : null
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      <PolicyCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchPolicies}
      />
    </Box>
  );
}

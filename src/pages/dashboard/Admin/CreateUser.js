import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Divider,
  IconButton,
} from "@mui/material";
import {
  axiosGet,
  AxiosGetWithParams,
  postFetch,
} from "../../../services/apiServices";
import { DotsThreeOutlineVertical, Pencil, Trash } from "phosphor-react";

const roles = ["ADMIN", "EMPLOYEE", "USER"]; // Match backend roles
const policies = ["User App Access", "User Web Access", "fileAccessOptions"];
const permissionOptions = [
  { key: "userAppAccess", label: "User App Access" },
  { key: "userWebAccess", label: "User Web Access" },
  { key: "userCanCreateGroup", label: "Can Create Group" },
];

const fileAccessOptions = [
  { key: "docx", label: "DOCX" },
  { key: "xlsx", label: "XLSX" },
  { key: "csv", label: "CSV" },
  { key: "png", label: "PNG" },
  { key: "jpeg", label: "JPEG" },
];

function CreateUser() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [policyOptions, setPolicyOptions] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    originalPassword: "",
    mobile_no: "",
    role: "",
    user_login_id: "",
    policy_id: "",
    policy_name: "",
    // user_access: {
    //   userAppAccess: false,
    //   userWebAccess: false,
    //   userCanCreateGroup: false,
    // },
    // file_access: {
    //   docx: false,
    //   xlsx: false,
    //   csv: false,
    //   png: false,
    //   jpeg: false,
    // },
  });

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpen = () => {
    resetForm();
    setIsEdit(false);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    resetForm();
    setError(null);
  };
  useEffect(() => {
    if (open) {
      // Fetch policies when modal opens
      axiosGet("/api/auth/policy-dd").then((data) => {
        setPolicyOptions(data); // Assuming data is the array as in your response
      });
    }
  }, [open]);
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      originalPassword: "",
      mobile_no: "",
      role: "",
      user_login_id: "",
      policy_id: "",
      policy_name: "",
      // user_access: {
      //   userAppAccess: false,
      //   userWebAccess: false,
      //   userCanCreateGroup: false,
      // },
      // file_access: {
      //   docx: false,
      //   xlsx: false,
      //   csv: false,
      //   png: false,
      //   jpeg: false,
      // },
    });
  };

  const handleInputChange = (e) => {
    // console.log(e, "handleInputChange");

    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // if (name in formData.user_access) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     user_access: {
    //       ...prev.user_access,
    //       [name]: checked,
    //     },
    //   }));
    // } else if (name in formData.file_access) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     file_access: {
    //       ...prev.file_access,
    //       [name]: checked,
    //     },
    //   }));
    // } else if (type === "checkbox" || type === "switch") {
    //   setFormData((prev) => ({
    //     ...prev,
    //     [name]: checked,
    //   }));
    // } else {
    //   setFormData((prev) => ({
    //     ...prev,
    //     [name]: value,
    //   }));
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      (!isEdit && !formData.password) ||
      !formData.role ||
      !formData.policy_id ||
      !formData.policy_name
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = isEdit ? "/api/auth/update/user" : "/api/auth/signup";
      const payload = isEdit
        ? { ...formData, user_id: formData.user_id }
        : formData;
      // const res = await postFetch("/api/auth/signup", formData);
      const res = await postFetch(endpoint, payload);
      //   if (!res.ok) {
      //     const err = await res.json();
      //     throw new Error(err.message || "Failed to create user");
      //   }
      // console.log(res.data, "RESPONSE");

      //   const createdUser = await res.json();
      if (res.status) {
        await fetchUsers(); // <-- call function to refresh list
        handleClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await AxiosGetWithParams("/api/auth/search");
      setUsers(data.users);
    } catch (error) {
      console.error("User fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // const handleEdit = (item) => {
  //   console.log("Edit clicked:", item);
  //   setFormData(item); // You can open a modal with prefilled form
  //   setOpen(true); // If you're using a modal for edit
  // };
  const handleEdit = (item) => {
    setFormData({
      ...item,
      originalPassword: item.password || "", // optional mapping
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (item) => {
    setSelectedUser(item);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await postFetch("/api/auth/delete/user", {
        user_id: selectedUser.user_id,
      });
      if (res.status) {
        fetchUsers();
        setConfirmOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header with Add User button */}
      {/* <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Created Users
        </Typography>
        <Button variant="contained" onClick={handleOpen}>
          Add User
        </Button>
      </Box> */}

      {/* Users Table */}
      {users.length === 0 ? (
        <Typography>No users created yet.</Typography>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  // mb: 2,
                  p: 1,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Created Users
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField size="small" placeholder="Search Here.." />
                  <Button variant="contained" size="small" onClick={handleOpen}>
                    Add User
                  </Button>
                  {/* <Button variant="contained" sx={{ borderRadius: 2, px: 3 }}>
                  + ADD
                </Button> */}
                </Box>
              </Box>
              <Divider />
              <Table stickyHeader sx={{ p: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item.user_id}>
                        <TableCell>{item.user_id}</TableCell>
                        <TableCell>{item.first_name}</TableCell>
                        <TableCell>{item.last_name}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.role}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil size={15} />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash size={15} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Box>
      )}

      {/* Modal for Create User */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="User Id"
              name="user_login_id"
              value={formData.user_login_id}
              onChange={handleInputChange}
              // required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              name="originalPassword"
              value={formData.originalPassword}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              margin="normal"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Policy"
              name="policy_id"
              value={formData.policy_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedPolicy = policyOptions.find(
                  (p) => String(p.policy_id) === String(selectedId)
                );
                setFormData((prev) => ({
                  ...prev,
                  policy_id: selectedPolicy?.policy_id || "",
                  policy_name: selectedPolicy?.policy_name || "",
                }));
              }}
              required
              margin="normal"
            >
              {policyOptions.map((policy) => (
                <MenuItem key={policy.policy_id} value={policy.policy_id}>
                  {policy.policy_name}
                </MenuItem>
              ))}
            </TextField>

            {/* <Typography variant="subtitle1" sx={{ mt: 2 }}>
              User Access Permissions
            </Typography>
            <FormGroup>
              {permissionOptions.map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={formData.user_access[key]}
                      onChange={handleInputChange}
                      name={key}
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup> */}

            {/* <Typography variant="subtitle1" sx={{ mt: 2 }}>
              File Access Permissions
            </Typography>
            <FormGroup>
              {fileAccessOptions.map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={formData.file_access[key]}
                      onChange={handleInputChange}
                      name={key}
                    />
                  }
                  label={label}
                />
              ))}
            </FormGroup> */}
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            type="submit"
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save"
              : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete User{" "}
            <strong>
              {selectedUser?.first_name} {selectedUser?.last_name}
            </strong>
            ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateUser;

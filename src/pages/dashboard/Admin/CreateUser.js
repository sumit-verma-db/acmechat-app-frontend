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
} from "@mui/material";
import {
  axiosGet,
  AxiosGetWithParams,
  postFetch,
} from "../../../services/apiServices";

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

  const handleOpen = () => setOpen(true);
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
      !formData.password ||
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
      const res = await postFetch("/api/auth/signup", formData);

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
  return (
    <Box sx={{ p: 1 }}>
      {/* Header with Add User button */}
      <Box
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
      </Box>

      {/* Users Table */}
      {users.length === 0 ? (
        <Typography>No users created yet.</Typography>
      ) : (
        <Paper>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(({ user_id, first_name, last_name, email, role }) => (
                    <TableRow key={user_id}>
                      <TableCell>{user_id}</TableCell>
                      <TableCell>{first_name}</TableCell>
                      <TableCell>{last_name}</TableCell>
                      <TableCell>{email}</TableCell>
                      <TableCell>{role}</TableCell>
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
      )}

      {/* Modal for Create User */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
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
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateUser;

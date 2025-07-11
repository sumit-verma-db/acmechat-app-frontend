import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Pencil, Trash } from "phosphor-react";
import axios from "axios";
import { axiosGet } from "../../../services/apiServices";

export default function CallLogs() {
  const userId = localStorage.getItem("userId"); // or pull from auth context
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [loading, setLoading] = useState(false);
  const [callLogs, setCallLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all users
  useEffect(() => {
    setLoading(true);
    axiosGet("/api/auth/search")
      .then((data) => {
        setUsers(data.users);
      })
      .catch((error) => console.error("User list error:", error))
      .finally(() => setLoading(false));
  }, []);

  const fetchCallLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://apps.acme.in:5001/api/calls/history/${selectedUserId}`
      );
      setCallLogs(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Failed to fetch call logs", err);
    }
  };

  useEffect(() => {
    if (!selectedUserId) return;
    fetchCallLogs();
  }, [selectedUserId]);
  const getStatusBadge = (status) => {
    const base = {
      px: 1.5,
      py: 0.3,
      borderRadius: "8px",
      fontSize: "0.75rem",
      fontWeight: 500,
      color: "white",
      display: "inline-block",
    };

    switch (status) {
      case "accepted":
        return { ...base, bgcolor: "green" };
      case "rejected":
        return { ...base, bgcolor: "red" };
      case "missed":
        return { ...base, bgcolor: "orange" };
      default:
        return { ...base, bgcolor: "gray" };
    }
  };

  return (
    <Box>
      {callLogs.length === 0 ? (
        <Typography>No call logs available.</Typography>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Call Logs
              </Typography>

              <Box sx={{ display: "flex", gap: 2 }}>
                <Select
                  size="small"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  displayEmpty
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>
                    Select User
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
                <TextField size="small" placeholder="Search Here.." />
              </Box>
            </Box>
            <Divider />
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>From User</TableCell>
                  <TableCell>To User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Room ID</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Duration (s)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {callLogs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>{log.fromUserId}</TableCell>
                      <TableCell>{log.toUserId}</TableCell>
                      <TableCell>{log.callType}</TableCell>
                      <TableCell>
                        <Box sx={getStatusBadge(log.status)}>
                          {log.status.charAt(0).toUpperCase() +
                            log.status.slice(1)}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ maxWidth: 150, overflowWrap: "break-word" }}
                      >
                        {log.roomId}
                      </TableCell>
                      <TableCell>
                        {new Date(log.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.endTime
                          ? new Date(log.endTime).toLocaleString()
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {log.durationSeconds != null
                          ? `${log.durationSeconds}s`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={callLogs.length}
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
    </Box>
  );
}

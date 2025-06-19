import React, { useEffect, useState } from "react";
import CreateGroup from "../../../sections/main/CreateGroup";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { axiosGet } from "../../../services/apiServices";

export default function GroupCreate() {
  const [groups, setGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [policyOptions, setPolicyOptions] = useState([]);

  const handleOpen = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // resetForm();
  };
  useEffect(() => {
    if (openDialog) {
      // Fetch policies when modal opens
      axiosGet("/api/auth/policy-dd").then((data) => {
        setPolicyOptions(data); // Assuming data is the array as in your response
      });
    }
  }, [openDialog]);
  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      const data = await axiosGet("/api/auth/getAll-groups");
      // console.log(data, "fetchGroups");

      setGroups(data.groups); // Adjust if your API returns { groups: [...] }
    } catch (err) {
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);
  return (
    <>
      <Box sx={{ p: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Created Groups
          </Typography>

          <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
            Create Group
          </Button>
        </Box>
        {groups.length === 0 ? (
          <Typography>No Groups created yet.</Typography>
        ) : (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Group ID</TableCell>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.group_id}>
                    <TableCell>{group.group_id}</TableCell>
                    <TableCell>{group.group_name}</TableCell>
                    <TableCell>
                      {/* Try to resolve full name from members list if available */}
                      {(() => {
                        // Find created_by in members array
                        const creator = group.members?.find(
                          (m) => m.user_id === group.created_by
                        );
                        return creator ? creator.full_name : group.created_by;
                      })()}
                    </TableCell>
                    <TableCell>
                      {/* Comma-separated full names */}
                      {group.members && group.members.length > 0
                        ? group.members.map((m) => m.full_name).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {group.created_at
                        ? new Date(group.created_at).toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
      {openDialog && (
        <CreateGroup
          open={openDialog}
          handleClose={handleCloseDialog}
          policyOptions={policyOptions}
        />
      )}
    </>
  );
}

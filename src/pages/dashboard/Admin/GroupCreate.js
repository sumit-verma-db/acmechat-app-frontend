import React, { useEffect, useState } from "react";
import CreateGroup from "../../../sections/main/CreateGroup";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { axiosGet, postFetch } from "../../../services/apiServices";
import { Pencil, Trash } from "phosphor-react";

export default function GroupCreate() {
  const [groups, setGroups] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [policyOptions, setPolicyOptions] = useState([]);

  const handleOpen = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEdit(false);
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

  const handleEdit = (item) => {
    console.log(item, "handleEdit");

    //  title: "",
    // members: [],
    // policy_id: "",
    // policy_name: "",
    setMembers({
      group_id: item.group_id,
      title: item.group_name,
      members: item.members,
      policy_id: item.group_policy.policy_id,
      policy_name: item.group_policy.policy_name,
    });
    // setMembers({
    //   ...item,
    // });
    setIsEdit(true);
    setOpenDialog(true);
  };

  const handleDelete = async (item) => {
    setSelectedGroup(item);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedGroup) return;

    try {
      const res = await postFetch("/api/auth/delete/group", {
        group_id: selectedGroup.group_id,
      });
      if (res.status) {
        fetchGroups();
        setConfirmOpen(false);
        setSelectedGroup(null);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };
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
                  <TableCell>Action</TableCell>
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
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(group)}
                      >
                        <Pencil size={15} />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(group)}
                      >
                        <Trash size={15} />
                      </IconButton>
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
          members={members}
          setMembers={setMembers}
          isEdit={isEdit}
        />
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Group{" "}
            <strong>{selectedGroup?.group_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

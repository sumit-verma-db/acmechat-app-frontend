import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";
import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { multiple } from "./../../components/Conversation/MsgTypes";
import CreateGroupForm from "./CreateGroupForm";

const MEMBERS = ["Name 1", "Name 2", "Name 3"];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGroup = ({
  open,
  handleClose,
  policyOptions,
  members,
  setMembers,
  isEdit,
}) => {
  // console.log(members, "MEMBERS");

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      sx={{ p: 4 }}
    >
      {/* Title */}
      <DialogTitle sx={{ mb: 3 }}>
        {" "}
        {isEdit ? "Edit Group" : "Create New Group"}
      </DialogTitle>
      {/* Content */}
      <DialogContent>
        {/* Form */}
        <CreateGroupForm
          handleClose={handleClose}
          open={open}
          policyOptions={policyOptions}
          members={members}
          setMembers={setMembers}
          isEdit={isEdit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;

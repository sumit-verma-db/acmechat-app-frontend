import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, MenuItem, Stack, TextField } from "@mui/material";

import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { AxiosGetWithParams, postFetch } from "../../services/apiServices";
const CreateGroupForm = ({ handleClose, open, policyOptions = [] }) => {
  const [members, setMembers] = useState([]);
  const [fetched, setFetched] = useState(false);

  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    members: Yup.array().min(2, "Must have at least 2 members"),
    policy_id: Yup.string().required("Policy is required"),
  });

  const defaultValues = {
    title: "",
    members: [],
    policy_id: "",
    policy_name: "",
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    // console.log("Group Create Payload:", data);
    try {
      const response = await postFetch("/api/auth/create-group", data);
      // console.log("Group Created Successfully:", response.data);
      handleCloseModal(); // close modal on success
    } catch (error) {
      console.error("Failed to create group:", error);
    }
    // add create-group API call here if needed
  };
  const handleCloseModal = () => {
    handleClose();
    setFetched(false);
  };
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await AxiosGetWithParams("/api/auth/search");
        // console.log(response, "CHECK RESPONSE S");
        const formatted = response.users.map((user) => ({
          label: `${user.first_name} ${user.last_name}`,
          value: user.user_id,
        }));
        setMembers(formatted);
        setFetched(true);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    if (open && !fetched) {
      fetchMembers();
    }
  }, [open, fetched]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Title" />
        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          options={members}
          ChipProps={{ size: "medium" }}
        />
        {policyOptions.length > 0 && (
          <TextField
            select
            fullWidth
            label="Policy"
            name="policy_id"
            value={methods.watch("policy_id")}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedPolicy = policyOptions.find(
                (p) => String(p.policy_id) === String(selectedId)
              );
              methods.setValue("policy_id", selectedPolicy?.policy_id || "");
              methods.setValue(
                "policy_name",
                selectedPolicy?.policy_name || ""
              );
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
        )}

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default CreateGroupForm;

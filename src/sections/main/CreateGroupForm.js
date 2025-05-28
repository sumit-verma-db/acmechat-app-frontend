import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { Button, Stack } from "@mui/material";

import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { AxiosGetWithParams, postFetch } from "../../services/apiServices";
const CreateGroupForm = ({ handleClose, open }) => {
  const [members, setMembers] = useState([]);
  const [fetched, setFetched] = useState(false);

  const NewGroupSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    members: Yup.array().min(2, "Must have at least 2 members"),
  });

  const defaultValues = {
    title: "",
    members: [],
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
    console.log("Group Create Payload:", data);
    try {
      const response = await postFetch("/api/auth/create-group", data);
      console.log("Group Created Successfully:", response.data);
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
        console.log(response, "CHECK RESPONSE S");
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

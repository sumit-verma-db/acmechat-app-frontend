import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, TextField, Button } from "@mui/material";
import RegisterForm from "../../../sections/auth/RegisterForm";
import CreateUser from "./CreateUser";
import GroupCreate from "./GroupCreate";
import NoChat from "../../../assets/Illustration/NoChat";
import PolicyPage from "./PolicyPage";

function Admin() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Simple form submit handler placeholder
  const handleCreateUser = (event) => {
    event.preventDefault();
    // Implement user creation logic here
    alert("User created!");
  };

  return (
    <Box sx={{ width: "100%", typography: "body1", p: 3 }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Admin scrollable tabs"
      >
        <Tab label="Create User" />
        <Tab label="Group Create" />
        <Tab label="Policies" />
      </Tabs>

      {tabIndex === 0 && (
        <>
          <CreateUser />
          {/* // <Box sx={{ mt: 3 }}>
        //   <Typography variant="h6" gutterBottom>
        //     Create User
        //   </Typography>
        //   <form onSubmit={handleCreateUser}>
        //     <TextField
        //       fullWidth
        //       label="Username"
        //       margin="normal"
        //       required
        //       name="username"
        //     />
        //     <TextField
        //       fullWidth
        //       label="Email"
        //       type="email"
        //       margin="normal"
        //       required
        //       name="email"
        //     />
        //     <TextField
        //       fullWidth
        //       label="Password"
        //       type="password"
        //       margin="normal"
        //       required
        //       name="password"
        //     />
        //     <Button variant="contained" type="submit" sx={{ mt: 2 }}>
        //       Create User
        //     </Button>
        //   </form>
        // </Box> */}
        </>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 3 }}>
          <GroupCreate />
          {/* <Typography variant="h6">Other Admin Functionality</Typography> */}
          {/* Add other admin content here */}
        </Box>
      )}
      {tabIndex === 2 && (
        <>
          <PolicyPage />
        </>
      )}
    </Box>
  );
}

export default Admin;

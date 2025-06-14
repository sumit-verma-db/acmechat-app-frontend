import { Link, Stack, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import AuthSocial from "../../sections/auth/AuthSocial";
import LoginForm from "../../sections/auth/LoginForm";
import { motion } from "framer-motion";

const Login = () => {
  return (
    <>
      <Stack spacing={2} sx={{ position: "relative" }}>
        {/* <Typography variant="h4">Login to Acme Chat</Typography> */}
        {/* <Stack direction="row" spacing={0.5}>
          <Typography variant="body2">New User?</Typography>
          <Link to="/auth/register" component={RouterLink} variant="subtitle2">
            Create an account
          </Link>
        </Stack> */}
        {/* Login form */}

        <LoginForm />

        {/* Auth Social */}
        {/* <AuthSocial /> */}
      </Stack>
    </>
  );
};

export default Login;

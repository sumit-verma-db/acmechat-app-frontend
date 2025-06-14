import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import FormProvider from "../../components/hook-form/FormProvider";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
} from "@mui/material";
import { RHFTextField } from "../../components/hook-form";
import { Eye, EyeSlash } from "phosphor-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { postFetch } from "../../services/apiServices";
import socket from "../../socket";

const LoginForm = () => {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  //validation rules
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Email must be a valid email address"),
    password: Yup.string().required("Password is required"),
  });

  const defaultValues = {
    email: "",
    password: "",
  };
  const warmupRingtone = () => {
    const audio = new Audio("/audio/ringtone.mp3");
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        console.log("🔊 Ringtone unlocked.");
      })
      .catch(() => {
        console.warn("⚠️ Audio warmup failed");
      });
  };

  const methods = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    console.log(data, "Login data");
    // login();
    try {
      let payload = {
        ...data,
        source: "web",
      };
      //submit data to backend
      const response = await postFetch("/api/auth/login", payload);
      console.log(response, "response");
      if (response.status) {
        const { accessToken, refreshToken, user_id } = response.data;
        // console.log(accessToken, refreshToken, "ACCCCC___+++");

        // ? Use upgraded login method from useAuth
        login({
          accessToken,
          refreshToken,
          user_id,
        });

        warmupRingtone();
      }
    } catch (error) {
      console.log(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField name="email" label="Email address" />
        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment>
                <IconButton
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack alignItems={"flex-end"} sx={{ my: 2 }}>
        <Link
          component={RouterLink}
          to="/auth/reset-password"
          variant="body2"
          color="inherit"
          underline="always"
        >
          Forgot Password?
        </Link>
      </Stack>
      <Button
        disabled={isSubmitting}
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        sx={{
          mt: 2,
          bgcolor: "text.primary",
          color: (theme) =>
            theme.palette.mode === "light" ? "common.white" : "grey.800",
          "&:hover": {
            bgcolor: "text.primary",
            color: (theme) =>
              theme.palette.mode === "light" ? "common.white" : "grey.800",
          },
        }}
        // sx={{
        //   bgcolor: "text.primary",
        //   color: (theme) =>
        //     theme.palette.mode === "light" ? "common.white" : "grey.800",
        //   "&:hover": {
        //     bgcolor: "text.primary",
        //     color: (theme) =>
        //       theme.palette.mode === "light" ? "common.white" : "grey.800",
        //   },
        // }}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </FormProvider>
  );
};

export default LoginForm;

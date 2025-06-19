import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Box,
  Typography,
  TextField,
} from "@mui/material";
import { ArrowsCounterClockwise, Eye, EyeSlash } from "phosphor-react";
import { Link as RouterLink } from "react-router-dom";

import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import { useAuth } from "../../contexts/useAuth";
import { postFetch } from "../../services/apiServices";

const LoginForm = () => {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");

  const generateCaptcha = () => {
    const newCaptcha = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCaptcha(newCaptcha);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const loginSchema = Yup.object().shape({
    identifier: Yup.string().required("Login ID is required"),
    password: Yup.string().required("Password is required"),
    captcha: Yup.string().required("Enter the captcha"),
  });

  const defaultValues = {
    identifier: "",
    password: "",
    captcha: "",
  };

  const methods = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

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

  const onSubmit = async (data) => {
    if (data.captcha !== generatedCaptcha) {
      setError("captcha", {
        type: "manual",
        message: "Captcha does not match",
      });
      return;
    }

    try {
      const payload = {
        identifier: data.identifier,
        password: data.password,
        source: "web",
      };

      const response = await postFetch("/api/auth/login", payload);
      if (response.status) {
        const { accessToken, refreshToken, user_id } = response.data;

        login({
          accessToken,
          refreshToken,
          user_id,
        });
        // localStorage.setItem("user", JSON.stringify(user));

        warmupRingtone();
      }
    } catch (error) {
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message || "Login failed",
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField
          name="identifier"
          // label="Enter your registered email"
          label="Login ID (Email / Mobile / User ID)"
          placeholder="Enter your registered email"
        />

        <RHFTextField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              px: 2,
              py: 1.5,
              minWidth: 100,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#282f3c", // very dark text
              bgcolor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            {generatedCaptcha}
          </Box>

          {/* <Button
            variant="outlined"
            onClick={generateCaptcha}
            sx={{ minWidth: 40 }}
          >
            ↻
          </Button> */}
          <IconButton
            onClick={generateCaptcha}
            sx={{
              // border: "1px solid #cfd8dc",
              borderRadius: 1,
              height: "40px",
              width: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowsCounterClockwise size={36} weight="bold" color="#374151" />
          </IconButton>

          <RHFTextField name="captcha" label="Enter Captcha" sx={{ flex: 1 }} />
        </Stack>

        {/* <Stack alignItems="flex-end">
            <RouterLink
              to="/auth/reset-password"
              style={{
                textDecoration: "underline",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Forgot Password?
            </RouterLink>
          </Stack> */}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{
            mt: 2,
            bgcolor: "text.primary",
            // bgcolor: "#6366f1",

            color: (theme) =>
              theme.palette.mode === "light" ? "#fff" : "grey.800",
            "&:hover": {
              bgcolor: "text.primary",
              // "&:hover": {
              //   bgcolor: "#4f46e5",
            },
          }}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default LoginForm;

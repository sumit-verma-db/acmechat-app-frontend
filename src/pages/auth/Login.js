import React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Link,
  useTheme,
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LoginForm from "../../sections/auth/LoginForm";
import Logo from "../../assets/Images/ACME-Logo-SVG.svg";

const Login = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          theme.palette.mode === "light" ? "#f3f4f6" : "background.default",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <Card
            elevation={3}
            sx={{
              width: "100%",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Stack spacing={3} alignItems="center">
                <Box
                  component="img"
                  src={Logo}
                  alt="Logo"
                  sx={{
                    height: { xs: 80, sm: 100, md: 100 },
                    width: { xs: 150, sm: 200, md: 220 },
                    objectFit: "contain",
                  }}
                />
              </Stack>
              {/* <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Leading Through Innovation
              </Typography> */}
              <Typography
                variant="h5"
                color="text.secondary"
                fontWeight={600}
                mt={1}
              >
                Sign In – ACME BUDDY
              </Typography>
            </Box>

            <CardContent sx={{ px: 0 }}>
              <LoginForm />
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Footer aligned at bottom always */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          bgcolor: "transparent",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} ACME. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ textAlign: "center", marginBottom: 3, fontWeight: "bold" }}
        >
          🎖️ Military Asset Management
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: "center", marginBottom: 3, color: "#666" }}
        >
          Sign in to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 2, padding: 1.5 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Box
          sx={{
            marginTop: 3,
            padding: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ display: "block", marginBottom: 1, fontWeight: "bold" }}
          >
            Demo Credentials:
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Admin: admin@military.com / Admin@123
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Commander: commander@military.com / Commander@123
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Logistics: logistics@military.com / Logistics@123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

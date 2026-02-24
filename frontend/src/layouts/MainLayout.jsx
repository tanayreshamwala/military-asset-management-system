import React from "react";
import { Box, Container } from "@mui/material";
import { Navbar } from "../components/Navbar.jsx";

export const MainLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 3, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

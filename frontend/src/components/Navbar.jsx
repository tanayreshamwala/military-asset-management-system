import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as BasesIcon,
  Storage as AssetsIcon,
  ShoppingCart as PurchasesIcon,
  CompareArrows as TransfersIcon,
  Assignment as AssignmentsIcon,
  People as UsersIcon,
  History as AuditIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [profileAnchor, setProfileAnchor] = React.useState(null);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setProfileAnchor(null);
  };

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { label: "Assets", icon: <AssetsIcon />, path: "/assets" },
    { label: "Purchases", icon: <PurchasesIcon />, path: "/purchases" },
    { label: "Transfers", icon: <TransfersIcon />, path: "/transfers" },
    { label: "Assignments", icon: <AssignmentsIcon />, path: "/assignments" },
  ];

  const adminItems = [
    { label: "Bases", icon: <BasesIcon />, path: "/bases" },
    { label: "Users", icon: <UsersIcon />, path: "/users" },
    { label: "Audit Logs", icon: <AuditIcon />, path: "/audit-logs" },
  ];

  const drawerContent = (
    <Box sx={{ width: 280 }}>
      {/* User Profile Section */}
      <Box sx={{ p: 2, backgroundColor: "#1976d2", color: "white" }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sx={{ bgcolor: "#fff", color: "#1976d2", fontWeight: "bold" }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
              {user?.role?.replace("_", " ")}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Main Navigation */}
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#1976d2", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      {/* Admin Section */}
      {user?.role === "admin" && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography
            variant="caption"
            sx={{ display: "block", p: 2, fontWeight: "bold", color: "#666" }}
          >
            ADMIN TOOLS
          </Typography>
          <List>
            {adminItems.map((item) => (
              <ListItem
                button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#d32f2f", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Logout */}
      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            "&:hover": {
              backgroundColor: "#ffebee",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#d32f2f", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
          onClick={() => navigate("/")}
        >
          🎖️ Military Assets
        </Typography>

        {/* Profile Avatar in Navbar */}
        <Button
          color="inherit"
          onClick={(e) => setProfileAnchor(e.currentTarget)}
          sx={{ display: "flex", gap: 1 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "rgba(255,255,255,0.3)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {user?.name}
          </Typography>
        </Button>

        {/* Profile Dropdown */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
        >
          <MenuItem disabled>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {user?.email}
            </Typography>
          </MenuItem>
          <MenuItem disabled>
            <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
              Role: {user?.role?.replace("_", " ")}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Side Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

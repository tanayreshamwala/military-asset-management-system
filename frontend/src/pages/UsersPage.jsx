import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Table, Divider, message, Popconfirm } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { usersAPI, basesAPI } from "../api/endpoints.js";

export const UsersPage = () => {
  const { user } = useAuth();
  const {
    data: usersData,
    loading,
    fetch: fetchUsers,
  } = useData(usersAPI.getAll);
  const { data: bases, fetch: fetchBases } = useData(basesAPI.getAll);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "base_commander",
    baseId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBases(1, 100);
    fetchUsers();
  }, [fetchBases, fetchUsers]);

  const handleOpen = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({
        name: record.name,
        email: record.email,
        role: record.role,
        baseId: record.baseId?._id || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "base_commander",
        baseId: "",
      });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await usersAPI.update(editingId, formData);
        message.success("User updated successfully");
      } else {
        await usersAPI.create(formData);
        message.success("User created successfully");
      }
      setOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "25%" },
    { title: "Email", dataIndex: "email", key: "email", width: "30%" },
    { title: "Role", dataIndex: "role", key: "role", width: "20%" },
    {
      title: "Base",
      dataIndex: "baseId",
      key: "baseId",
      width: "15%",
      render: (base) => base?.name || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_, record) =>
        user.role === "admin" ? (
          <Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpen(record)}
              sx={{ marginRight: 1 }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete User"
              description="Are you sure?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" color="error">
                Delete
              </Button>
            </Popconfirm>
          </Box>
        ) : null,
    },
  ];

  return (
    <MainLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          👥 Users
        </Typography>
        {user?.role === "admin" && (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add User
          </Button>
        )}
      </Box>

      <Table
        columns={columns}
        dataSource={usersData?.users || []}
        loading={loading}
        rowKey="_id"
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingId ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            margin="normal"
            disabled={!!editingId}
          />
          {!editingId && (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              margin="normal"
              required={!editingId}
            />
          )}
          <TextField
            fullWidth
            label="Role"
            select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="admin">Admin</option>
            <option value="base_commander">Base Commander</option>
            <option value="logistics_officer">Logistics Officer</option>
          </TextField>
          <TextField
            fullWidth
            label="Assigned Base"
            select
            value={formData.baseId}
            onChange={(e) =>
              setFormData({ ...formData, baseId: e.target.value })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">No Base</option>
            {bases?.bases?.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Typography,
} from "@mui/material";
import { Table, Space, Popconfirm, message } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { basesAPI } from "../api/endpoints.js";

export const BasesPage = () => {
  const { user } = useAuth();
  const { data, loading, error, fetch } = useData(basesAPI.getAll);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetch(pagination.current, pagination.pageSize);
  }, [fetch, pagination.current, pagination.pageSize]);

  const handleOpen = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData({ name: record.name, location: record.location });
    } else {
      setEditingId(null);
      setFormData({ name: "", location: "" });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({ name: "", location: "" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await basesAPI.update(editingId, formData);
        message.success("Base updated successfully");
      } else {
        await basesAPI.create(formData);
        message.success("Base created successfully");
      }
      handleClose();
      fetch(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await basesAPI.delete(id);
      message.success("Base deleted successfully");
      fetch(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "35%" },
    { title: "Location", dataIndex: "location", key: "location", width: "35%" },
    {
      title: "Actions",
      key: "actions",
      width: "30%",
      render: (_, record) =>
        user?.role === "admin" ? (
          <Space>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleOpen(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Base"
              description="Are you sure?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" color="error">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">{error}</Alert>
      </MainLayout>
    );
  }

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
          Bases
        </Typography>
        {user?.role === "admin" && (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Base
          </Button>
        )}
      </Box>

      <Table
        columns={columns}
        dataSource={data?.bases || []}
        loading={loading}
        rowKey="_id"
        pagination={{
          total: data?.pagination?.total || 0,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Base" : "Create Base"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Base Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

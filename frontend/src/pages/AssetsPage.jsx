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
  CircularProgress,
  Typography,
} from "@mui/material";
import { Table, Tag, Space, Popconfirm, message } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { assetsAPI } from "../api/endpoints.js";

export const AssetsPage = () => {
  const { user } = useAuth();
  const { data, loading, error, fetch } = useData(assetsAPI.getAll);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Vehicle",
    serialNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetch(pagination.current, pagination.pageSize);
  }, []);

  const handleOpen = (record = null) => {
    if (record) {
      setEditingId(record._id);
      setFormData(record);
    } else {
      setFormData({ name: "", type: "Vehicle", serialNumber: "" });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: "", type: "Vehicle", serialNumber: "" });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editingId) {
        await assetsAPI.update(editingId, formData);
        message.success("Asset updated successfully");
      } else {
        await assetsAPI.create(formData);
        message.success("Asset created successfully");
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
      await assetsAPI.delete(id);
      message.success("Asset deleted successfully");
      fetch(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name", width: "30%" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "20%",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
      width: "30%",
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpen(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Asset"
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
      ),
    },
  ];

  if (error)
    return (
      <MainLayout>
        <Alert severity="error">{error}</Alert>
      </MainLayout>
    );

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
          📦 Assets
        </Typography>
        {user?.role === "admin" && (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Asset
          </Button>
        )}
      </Box>

      <Table
        columns={columns}
        dataSource={data?.assets || []}
        loading={loading}
        pagination={{
          total: data?.pagination?.total || 0,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: (page) => {
            setPagination({ ...pagination, current: page });
            fetch(page, pagination.pageSize);
          },
        }}
        rowKey="_id"
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Asset" : "Create Asset"}</DialogTitle>
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
            label="Type"
            select
            value={formData.type || "Vehicle"}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="Vehicle">Vehicle</option>
            <option value="Weapon">Weapon</option>
            <option value="Ammunition">Ammunition</option>
            <option value="Equipment">Equipment</option>
          </TextField>
          <TextField
            fullWidth
            label="Serial Number"
            value={formData.serialNumber}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

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
import { Table, Divider, message } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { inventoryAPI, basesAPI, assetsAPI } from "../api/endpoints.js";

export const TransfersPage = () => {
  const { user } = useAuth();
  const {
    data: transfers,
    loading,
    fetch: fetchTransfers,
  } = useData(inventoryAPI.getTransfers);
  const { data: bases, fetch: fetchBases } = useData(basesAPI.getAll);
  const { data: assets, fetch: fetchAssets } = useData(assetsAPI.getAll);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromBaseId: "",
    toBaseId: "",
    assetId: "",
    quantity: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchBases(1, 100);
    fetchAssets(1, 100);

    const baseFilter =
      user.role === "admin" ? undefined : user.baseId || undefined;
    fetchTransfers(baseFilter);
  }, [user, fetchBases, fetchAssets, fetchTransfers]);

  const handleOpen = () => {
    setFormData({ fromBaseId: "", toBaseId: "", assetId: "", quantity: 0 });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await inventoryAPI.recordTransfer(formData);
      message.success("Transfer recorded successfully");
      setOpen(false);
      const baseFilter =
        user?.role === "admin" ? undefined : user?.baseId || formData.fromBaseId;
      fetchTransfers(baseFilter);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "From Base",
      dataIndex: "fromBaseId",
      key: "fromBaseId",
      width: "20%",
      render: (base) => base?.name || "N/A",
    },
    {
      title: "To Base",
      dataIndex: "toBaseId",
      key: "toBaseId",
      width: "20%",
      render: (base) => base?.name || "N/A",
    },
    {
      title: "Asset",
      dataIndex: "assetId",
      key: "assetId",
      width: "20%",
      render: (asset) => asset?.name || "N/A",
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: "15%" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "10%",
      render: (user) => user?.name || "N/A",
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
          🚚 Transfers
        </Typography>
        {["admin", "logistics_officer"].includes(user?.role) && (
          <Button variant="contained" onClick={handleOpen}>
            Record Transfer
          </Button>
        )}
      </Box>

      <Table
        columns={columns}
        dataSource={transfers?.transfers || []}
        loading={loading}
        rowKey="_id"
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Transfer</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="From Base"
            select
            value={formData.fromBaseId}
            onChange={(e) =>
              setFormData({ ...formData, fromBaseId: e.target.value })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">Select Source Base</option>
            {bases?.bases?.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="To Base"
            select
            value={formData.toBaseId}
            onChange={(e) =>
              setFormData({ ...formData, toBaseId: e.target.value })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">Select Destination Base</option>
            {bases?.bases?.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Asset"
            select
            value={formData.assetId}
            onChange={(e) =>
              setFormData({ ...formData, assetId: e.target.value })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="">Select Asset</option>
            {assets?.assets?.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.name}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Record Transfer"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

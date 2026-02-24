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
import { Table, Space, Popconfirm, message } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { inventoryAPI, basesAPI, assetsAPI } from "../api/endpoints.js";

export const PurchasesPage = () => {
  const { user } = useAuth();
  const {
    data: purchases,
    loading,
    fetch: fetchPurchases,
  } = useData(inventoryAPI.getPurchases);
  const { data: bases, fetch: fetchBases } = useData(basesAPI.getAll);
  const { data: assets, fetch: fetchAssets } = useData(assetsAPI.getAll);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    baseId: "",
    assetId: "",
    quantity: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBases(1, 100);
    fetchAssets(1, 100);
    if (user?.baseId) {
      fetchPurchases(user.baseId);
    } else if (user?.role === "admin") {
      fetchPurchases(undefined);
    }
  }, [user, fetchBases, fetchAssets, fetchPurchases]);

  const handleOpen = () => {
    setFormData({ baseId: user?.baseId || "", assetId: "", quantity: 0 });
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await inventoryAPI.recordPurchase(formData);
      message.success("Purchase recorded successfully");
      setOpen(false);
      fetchPurchases(formData.baseId);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Base",
      dataIndex: "baseId",
      key: "baseId",
      width: "20%",
      render: (base) => base?.name || "N/A",
    },
    {
      title: "Asset",
      dataIndex: "assetId",
      key: "assetId",
      width: "25%",
      render: (asset) => asset?.name || "N/A",
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: "15%" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "20%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Recorded By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "20%",
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
          🛒 Purchases
        </Typography>
        {["admin", "logistics_officer"].includes(user?.role) && (
          <Button variant="contained" onClick={handleOpen}>
            Record Purchase
          </Button>
        )}
      </Box>

      <Table
        columns={columns}
        dataSource={purchases?.purchases || []}
        loading={loading}
        rowKey="_id"
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Purchase</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Base"
            select
            value={formData.baseId}
            onChange={(e) =>
              setFormData({ ...formData, baseId: e.target.value })
            }
            margin="normal"
            SelectProps={{ native: true }}
            disabled={user?.role !== "admin"}
          >
            <option value="">Select Base</option>
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
            {submitting ? "Saving..." : "Record Purchase"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

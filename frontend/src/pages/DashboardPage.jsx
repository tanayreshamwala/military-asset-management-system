import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { dashboardAPI, basesAPI } from "../api/endpoints.js";

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    data: metrics,
    loading,
    error,
    fetch: fetchMetrics,
  } = useData(dashboardAPI.getMetrics);
  const { data: basesData, fetch: fetchBases } = useData(basesAPI.getAll);
  const [selectedBaseId, setSelectedBaseId] = useState("");

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;

      if (user.role === "admin") {
        const response = await fetchBases(1, 100);
        const firstBaseId = response?.bases?.[0]?._id || "";
        setSelectedBaseId((current) => current || firstBaseId);
      } else {
        setSelectedBaseId(user.baseId || "");
      }
    };

    initialize();
  }, [user, fetchBases]);

  useEffect(() => {
    if (selectedBaseId) {
      fetchMetrics(selectedBaseId);
    }
  }, [selectedBaseId, fetchMetrics]);

  if (loading)
    return (
      <MainLayout>
        <CircularProgress />
      </MainLayout>
    );
  if (error)
    return (
      <MainLayout>
        <Alert severity="error">{error}</Alert>
      </MainLayout>
    );

  const {
    totals = {},
    transactionCounts = {},
    lowStockAlert = [],
  } = metrics?.metrics || {};

  const MetricCard = ({ title, value, color = "#1890ff" }) => (
    <Card sx={{ backgroundColor: color, color: "white" }}>
      <CardContent>
        <Typography variant="body2">{title}</Typography>
        <Typography variant="h5">{value || 0}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold" }}>
        Dashboard
      </Typography>

      {user?.role === "admin" && (
        <Box sx={{ marginBottom: 2, maxWidth: 420 }}>
          <TextField
            fullWidth
            label="Select Base"
            select
            value={selectedBaseId}
            onChange={(e) => setSelectedBaseId(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Select Base</option>
            {basesData?.bases?.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </TextField>
        </Box>
      )}

      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Opening Balance"
            value={totals.totalOpening || 0}
            color="#52c41a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Current Balance"
            value={totals.totalCurrent || 0}
            color="#1890ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Purchases"
            value={transactionCounts.purchases || 0}
            color="#faad14"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Transfers"
            value={transactionCounts.transfers || 0}
            color="#eb2f96"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Assignments"
            value={transactionCounts.assignments || 0}
            color="#13c2c2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Expenditures"
            value={transactionCounts.expenditures || 0}
            color="#f5222d"
          />
        </Grid>
      </Grid>

      {lowStockAlert && lowStockAlert.length > 0 && (
        <Card
          sx={{ backgroundColor: "#fff7e6", borderLeft: "4px solid #faad14" }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              Low Stock Alert
            </Typography>
            {lowStockAlert.map((item) => (
              <Typography key={item._id} variant="body2">
                {item.assetId?.name}: {item.currentQuantity} units remaining
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
};

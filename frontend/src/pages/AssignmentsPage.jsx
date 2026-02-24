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
  Divider,
} from "@mui/material";
import { Table, Tabs, message } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../hooks/useData.js";
import { inventoryAPI, basesAPI, assetsAPI } from "../api/endpoints.js";

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const {
    data: assignmentsData,
    loading: assignmentsLoading,
    fetch: fetchAssignments,
  } = useData(inventoryAPI.getAssignments);
  const {
    data: expendituresData,
    loading: expendituresLoading,
    fetch: fetchExpenditures,
  } = useData(inventoryAPI.getExpenditures);
  const { data: bases, fetch: fetchBases } = useData(basesAPI.getAll);
  const { data: assets, fetch: fetchAssets } = useData(assetsAPI.getAll);
  const [activeTab, setActiveTab] = useState("1");
  const [assignOpen, setAssignOpen] = useState(false);
  const [expenditureOpen, setExpenditureOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    baseId: user?.baseId || "",
    assetId: "",
    personnelName: "",
    personnelId: "",
    quantity: 0,
  });
  const [expenditureForm, setExpenditureForm] = useState({
    baseId: user?.baseId || "",
    assetId: "",
    quantity: 0,
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBases(1, 100);
    fetchAssets(1, 100);
    if (user?.baseId) {
      fetchAssignments(user.baseId);
      fetchExpenditures(user.baseId);
    } else if (user?.role === "admin") {
      fetchAssignments(undefined);
      fetchExpenditures(undefined);
    }
  }, [user, fetchBases, fetchAssets, fetchAssignments, fetchExpenditures]);

  const handleAssignment = async () => {
    setSubmitting(true);
    try {
      await inventoryAPI.assignAsset(assignmentForm);
      message.success("Asset assigned successfully");
      setAssignOpen(false);
      fetchAssignments(assignmentForm.baseId);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenditure = async () => {
    setSubmitting(true);
    try {
      await inventoryAPI.recordExpenditure(expenditureForm);
      message.success("Expenditure recorded successfully");
      setExpenditureOpen(false);
      fetchExpenditures(expenditureForm.baseId);
    } catch (err) {
      message.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const assignmentColumns = [
    {
      title: "Personnel",
      dataIndex: "personnelName",
      key: "personnelName",
      width: "25%",
    },
    {
      title: "Personnel ID",
      dataIndex: "personnelId",
      key: "personnelId",
      width: "20%",
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
      width: "20%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const expenditureColumns = [
    {
      title: "Asset",
      dataIndex: "assetId",
      key: "assetId",
      width: "20%",
      render: (asset) => asset?.name || "N/A",
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: "15%" },
    { title: "Reason", dataIndex: "reason", key: "reason", width: "35%" },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Recorded By",
      dataIndex: "recordedBy",
      key: "recordedBy",
      width: "15%",
      render: (user) => user?.name || "N/A",
    },
  ];

  return (
    <MainLayout>
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        📋 Assignments & Expenditures
      </Typography>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: `Assignments (${assignmentsData?.assignments?.length || 0})`,
            children: (
              <Box>
                {["admin", "base_commander"].includes(user?.role) && (
                  <Button
                    variant="contained"
                    onClick={() => setAssignOpen(true)}
                    sx={{ marginBottom: 2 }}
                  >
                    Assign Asset
                  </Button>
                )}
                <Table
                  columns={assignmentColumns}
                  dataSource={assignmentsData?.assignments || []}
                  loading={assignmentsLoading}
                  rowKey="_id"
                />
              </Box>
            ),
          },
          {
            key: "2",
            label: `Expenditures (${expendituresData?.expenditures?.length || 0})`,
            children: (
              <Box>
                {["admin", "base_commander"].includes(user?.role) && (
                  <Button
                    variant="contained"
                    onClick={() => setExpenditureOpen(true)}
                    sx={{ marginBottom: 2 }}
                  >
                    Record Expenditure
                  </Button>
                )}
                <Table
                  columns={expenditureColumns}
                  dataSource={expendituresData?.expenditures || []}
                  loading={expendituresLoading}
                  rowKey="_id"
                />
              </Box>
            ),
          },
        ]}
      />

      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Asset</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Base"
            select
            value={assignmentForm.baseId}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, baseId: e.target.value })
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
            value={assignmentForm.assetId}
            onChange={(e) =>
              setAssignmentForm({ ...assignmentForm, assetId: e.target.value })
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
            label="Personnel Name"
            value={assignmentForm.personnelName}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                personnelName: e.target.value,
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Personnel ID"
            value={assignmentForm.personnelId}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                personnelId: e.target.value,
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={assignmentForm.quantity}
            onChange={(e) =>
              setAssignmentForm({
                ...assignmentForm,
                quantity: parseInt(e.target.value),
              })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignment}
            variant="contained"
            disabled={submitting}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={expenditureOpen}
        onClose={() => setExpenditureOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Expenditure</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Base"
            select
            value={expenditureForm.baseId}
            onChange={(e) =>
              setExpenditureForm({ ...expenditureForm, baseId: e.target.value })
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
            value={expenditureForm.assetId}
            onChange={(e) =>
              setExpenditureForm({
                ...expenditureForm,
                assetId: e.target.value,
              })
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
            value={expenditureForm.quantity}
            onChange={(e) =>
              setExpenditureForm({
                ...expenditureForm,
                quantity: parseInt(e.target.value),
              })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Reason"
            value={expenditureForm.reason}
            onChange={(e) =>
              setExpenditureForm({ ...expenditureForm, reason: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenditureOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExpenditure}
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

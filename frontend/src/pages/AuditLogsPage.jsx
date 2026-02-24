import React, { useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { Table, DatePicker } from "antd";
import { MainLayout } from "../layouts/MainLayout.jsx";
import { useData } from "../hooks/useData.js";
import { auditAPI } from "../api/endpoints.js";

export const AuditLogsPage = () => {
  const {
    data: logsData,
    loading,
    fetch: fetchLogs,
  } = useData(auditAPI.getLogs);

  useEffect(() => {
    fetchLogs({});
  }, []);

  const columns = [
    {
      title: "User",
      dataIndex: "userId",
      key: "userId",
      width: "20%",
      render: (user) => user?.name || "N/A",
    },
    { title: "Action", dataIndex: "action", key: "action", width: "20%" },
    {
      title: "Entity Type",
      dataIndex: "entityType",
      key: "entityType",
      width: "15%",
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: "20%",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: "15%",
    },
  ];

  return (
    <MainLayout>
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        📜 Audit Logs
      </Typography>
      <Table
        columns={columns}
        dataSource={logsData?.logs || []}
        loading={loading}
        rowKey="_id"
        pagination={{
          total: logsData?.pagination?.total || 0,
          pageSize: logsData?.pagination?.limit || 50,
        }}
      />
    </MainLayout>
  );
};

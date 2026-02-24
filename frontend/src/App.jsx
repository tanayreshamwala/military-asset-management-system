import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { AssetsPage } from "./pages/AssetsPage.jsx";
import { BasesPage } from "./pages/BasesPage.jsx";
import { PurchasesPage } from "./pages/PurchasesPage.jsx";
import { TransfersPage } from "./pages/TransfersPage.jsx";
import { AssignmentsPage } from "./pages/AssignmentsPage.jsx";
import { UsersPage } from "./pages/UsersPage.jsx";
import { AuditLogsPage } from "./pages/AuditLogsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bases"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <BasesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transfers"
            element={
              <ProtectedRoute>
                <TransfersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <AssignmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/unauthorized"
            element={<div>Unauthorized Access</div>}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

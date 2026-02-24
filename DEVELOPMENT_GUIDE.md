# Development Guide - Military Asset Management System

## 📖 Guide for Future Development & Extension

This guide explains the patterns, conventions, and architecture of the system to help developers add new features.

---

## 🏗️ Architecture Overview

The system follows a **layered architecture** with clear separation of concerns:

```
HTTP Request
    ↓
Routes (/src/routes)
    ↓
Middleware (auth, validation, RBAC)
    ↓
Controllers (/src/controllers)
    ↓
Services (/src/services)
    ↓
Models (/src/models)
    ↓
MongoDB
```

### Key Principles

- **Don't put logic in controllers** - Controllers just handle HTTP
- **Business logic goes in services** - Services call models
- **Middleware for cross-cutting concerns** - Auth, RBAC, validation
- **Models handle database relationships** - Use Mongoose hooks
- **Always use transactions** for multi-step operations

---

## 📝 Adding a New Feature: Step-by-Step

### Scenario: Add "Maintenance Records" feature

Track when assets need maintenance.

#### Step 1: Create the Model

File: `backend/src/models/MaintenanceRecord.js`

```javascript
const mongoose = require("mongoose");

const maintenanceRecordSchema = new mongoose.Schema(
  {
    baseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Base",
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completionDate: Date,
    notes: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for fast queries
maintenanceRecordSchema.index({ baseId: 1, assetId: 1 });
maintenanceRecordSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("MaintenanceRecord", maintenanceRecordSchema);
```

**Key Points:**

- Use `mongoose.Schema.Types.ObjectId` for references
- Add appropriate indexes for query performance
- Use `timestamps: true` for automatic createdAt/updatedAt
- Validate enums for status fields

#### Step 2: Create the Service

File: `backend/src/services/maintenanceService.js`

```javascript
const MaintenanceRecord = require("../models/MaintenanceRecord");
const AuditLog = require("../models/AuditLog");
const auditService = require("./auditService");

class MaintenanceService {
  // Report maintenance issue
  async reportMaintenance(baseId, assetId, issueDescription, reportedBy) {
    const record = await MaintenanceRecord.create({
      baseId,
      assetId,
      issueDescription,
      reportedBy,
    });

    // Log to audit trail
    await auditService.logAction({
      userId: reportedBy,
      action: "MAINTENANCE_REPORTED",
      entityType: "MaintenanceRecord",
      entityId: record._id,
      newState: record,
    });

    return record;
  }

  // Get maintenance records for a base
  async getMaintenanceRecords(baseId, status = null) {
    const query = { baseId };
    if (status) query.status = status;

    return MaintenanceRecord.find(query)
      .populate("assetId", "name serialNumber")
      .populate("reportedBy", "email")
      .populate("completedBy", "email")
      .sort({ createdAt: -1 });
  }

  // Update maintenance status
  async updateMaintenanceStatus(recordId, status, completedBy, notes) {
    const record = await MaintenanceRecord.findById(recordId);
    if (!record) throw new Error("Maintenance record not found");

    const previousState = { ...record.toObject() };

    record.status = status;
    if (status === "completed") {
      record.completedBy = completedBy;
      record.completionDate = new Date();
    }
    if (notes) record.notes = notes;

    await record.save();

    // Log the change
    await auditService.logAction({
      userId: completedBy,
      action: "MAINTENANCE_UPDATED",
      entityType: "MaintenanceRecord",
      entityId: recordId,
      previousState,
      newState: record,
      changes: { status, notes },
    });

    return record;
  }
}

module.exports = new MaintenanceService();
```

**Key Points:**

- Always log to audit trail for important operations
- Use services to validate business rules
- Populate references for complete data
- Return the created/updated record

#### Step 3: Create the Controller

File: `backend/src/controllers/maintenanceController.js`

```javascript
const maintenanceService = require("../services/maintenanceService");
const { AppError, asyncHandler } = require("../utils/errors");

exports.reportMaintenance = asyncHandler(async (req, res) => {
  const { assetId, issueDescription } = req.body;
  const baseId = req.user.baseId; // From JWT token
  const reportedBy = req.user.id;

  const record = await maintenanceService.reportMaintenance(
    baseId,
    assetId,
    issueDescription,
    reportedBy,
  );

  res.status(201).json({
    success: true,
    data: record,
  });
});

exports.getMaintenanceRecords = asyncHandler(async (req, res) => {
  const { baseId } = req.params;
  const { status } = req.query;

  // Enforce base-level access for non-admins
  if (req.user.role !== "admin" && req.user.baseId !== baseId) {
    throw new AppError("Not authorized", 403);
  }

  const records = await maintenanceService.getMaintenanceRecords(
    baseId,
    status,
  );

  res.json({
    success: true,
    data: records,
  });
});

exports.updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const { recordId } = req.params;
  const { status, notes } = req.body;

  const record = await maintenanceService.updateMaintenanceStatus(
    recordId,
    status,
    req.user.id,
    notes,
  );

  res.json({
    success: true,
    data: record,
  });
});
```

**Key Points:**

- Use `asyncHandler` to catch async errors
- Extract baseId from JWT token, not request body
- Always enforce RBAC checks
- Return JSON with success flag and data

#### Step 4: Add Input Validation

File: `backend/src/middlewares/validation.js` (append to existing file)

```javascript
const { body, validationResult } = require("express-validator");

// Add this new validator
exports.validateReportMaintenance = [
  body("assetId").isMongoId().withMessage("Invalid asset ID"),
  body("issueDescription")
    .notEmpty()
    .withMessage("Issue description required")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be 10-500 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        errors
          .array()
          .map((e) => e.msg)
          .join(", "),
        400,
      );
    }
    next();
  },
];
```

#### Step 5: Create Routes

File: `backend/src/routes/maintenance.js` (new file)

```javascript
const express = require("express");
const maintenanceController = require("../controllers/maintenanceController");
const { authenticate } = require("../middlewares/auth");
const { authorizeRoles } = require("../middlewares/rbac");
const { validateReportMaintenance } = require("../middlewares/validation");

const router = express.Router();

// All maintenance routes require authentication
router.use(authenticate);

// Report new maintenance issue (base commander & logistics officer)
router.post(
  "/:baseId",
  authorizeRoles("admin", "base_commander", "logistics_officer"),
  validateReportMaintenance,
  maintenanceController.reportMaintenance,
);

// Get maintenance records (authorized users for their base)
router.get(
  "/:baseId",
  authorizeRoles("admin", "base_commander", "logistics_officer"),
  maintenanceController.getMaintenanceRecords,
);

// Update maintenance status (admins & base commanders)
router.patch(
  "/:recordId/status",
  authorizeRoles("admin", "base_commander"),
  maintenanceController.updateMaintenanceStatus,
);

module.exports = router;
```

#### Step 6: Mount Routes in App

File: `backend/src/app.js` (modify)

```javascript
// Add this line with other route mounts (around line 50)
app.use("/api/maintenance", require("./routes/maintenance"));
```

#### Step 7: Create Frontend Page

File: `frontend/src/pages/MaintenancePage.jsx` (new file)

```jsx
import React, { useState } from "react";
import { Table, Button, Modal, Form, Select, Input, Tag, Space } from "antd";
import { MaintenanceContext } from "../context/MaintenanceContext";
import MainLayout from "../layouts/MainLayout";

const MaintenancePage = () => {
  const { records, loading, reportMaintenance, updateStatus } =
    React.useContext(MaintenanceContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleReport = async (values) => {
    await reportMaintenance(values);
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Asset",
      dataIndex: ["assetId", "name"],
      key: "assetId",
    },
    {
      title: "Issue",
      dataIndex: "issueDescription",
      key: "issue",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "completed"
              ? "green"
              : status === "in_progress"
                ? "blue"
                : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Reported By",
      dataIndex: ["reportedBy", "email"],
      key: "reportedBy",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button size="small" onClick={() => updateStatus(record._id)}>
          Update
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <h1>Maintenance Records</h1>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Report Issue
      </Button>

      <Table
        dataSource={records}
        columns={columns}
        loading={loading}
        style={{ marginTop: 20 }}
      />

      <Modal
        title="Report Maintenance Issue"
        visible={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleReport}>
          <Form.Item name="assetId" label="Asset" rules={[{ required: true }]}>
            <Select placeholder="Select asset" />
          </Form.Item>
          <Form.Item
            name="issueDescription"
            label="Issue Description"
            rules={[
              { required: true },
              { min: 10, message: "Minimum 10 characters" },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default MaintenancePage;
```

#### Step 8: Add Context (if needed)

File: `frontend/src/context/MaintenanceContext.jsx` (new file)

```jsx
import React, { createContext, useState, useEffect } from "react";
import { maintenanceAPI } from "../api/endpoints";

export const MaintenanceContext = createContext();

export const MaintenanceProvider = ({ children, userId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await maintenanceAPI.getRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch maintenance records:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const reportMaintenance = async (issue) => {
    try {
      await maintenanceAPI.report(issue);
      await fetchRecords();
    } catch (error) {
      throw error;
    }
  };

  const updateStatus = async (recordId, status) => {
    try {
      await maintenanceAPI.updateStatus(recordId, status);
      await fetchRecords();
    } catch (error) {
      throw error;
    }
  };

  return (
    <MaintenanceContext.Provider
      value={{ records, loading, reportMaintenance, updateStatus }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};
```

---

## 🔄 Common Patterns

### Pattern 1: Add a Simple Field to Existing Model

```javascript
// 1. Update model schema
const schema = new mongoose.Schema({
  existingField: String,
  newField: String,  // ← Add here
  // ...
});

// 2. Update service to handle field
async updateRecord(id, data) {
  const record = await Model.findByIdAndUpdate(id, data);
  await auditService.logAction({
    action: 'RECORD_UPDATED',
    newState: record,
    changes: { newField: data.newField }
  });
  return record;
}

// 3. Update controller validation
exports.validateUpdate = [
  body('newField')
    .optional()
    .isString()
    .trim(),
  // ...
];

// 4. Update frontend form
<Form.Item name="newField" label="New Field">
  <Input />
</Form.Item>
```

### Pattern 2: Add a New Role

```javascript
// 1. Update User model enum
role: {
  type: String,
  enum: ['admin', 'base_commander', 'logistics_officer', 'new_role'],
  required: true
}

// 2. Update RBAC middleware usage
authorizeRoles('admin', 'new_role')

// 3. Update seed data
users: [
  { email: 'new_role@example.com', role: 'new_role', ... }
]
```

### Pattern 3: Add Complex Query with Filtering

```javascript
// Service method with filtering
async getRecords(filters = {}) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.startDate) {
    query.createdAt = { $gte: new Date(filters.startDate) };
  }
  if (filters.baseId) query.baseId = filters.baseId;

  return Model.find(query)
    .populate('reference')
    .sort({ createdAt: -1 })
    .limit(100);
}

// Controller passes filters from query params
async getRecords(req, res) {
  const records = await service.getRecords(req.query);
  res.json({ success: true, data: records });
}

// Frontend passes filters
const getRecords = (filters) => {
  return api.get('/endpoint', { params: filters });
}
```

### Pattern 4: Add Transaction-Based Operation

```javascript
async complexOperation(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate
    const item = await Model1.findById(data.id).session(session);
    if (!item) throw new Error('Not found');

    // Update multiple collections
    await Model1.updateOne(
      { _id: data.id },
      { $inc: { quantity: -data.amount } },
      { session }
    );

    await Model2.create([{
      relatedId: data.id,
      amount: data.amount
    }], { session });

    // Log
    await AuditLog.create([{
      action: 'OPERATION',
      entityId: data.id
    }], { session });

    await session.commitTransaction();

  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}
```

---

## 🧪 Testing New Features

### Manual Testing Checklist

- [ ] Test with valid data
- [ ] Test with invalid data (validation)
- [ ] Test with missing required fields
- [ ] Test RBAC (try as different roles)
- [ ] Test base-level access control
- [ ] Verify audit log entry created
- [ ] Test frontend form submission
- [ ] Test error handling and display
- [ ] Test pagination (if applicable)
- [ ] Test with no records

### Example Test Request (using curl)

```bash
# Set token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"commander@military.com","password":"Commander@123"}' \
  | jq -r '.data.token')

# Create maintenance record
curl -X POST http://localhost:5000/api/maintenance/baseId123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetId":"assetId123",
    "issueDescription":"Engine making strange sounds during operation"
  }' | jq

# Get records
curl -X GET http://localhost:5000/api/maintenance/baseId123 \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by status
curl -X GET "http://localhost:5000/api/maintenance/baseId123?status=pending" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## 📊 Debugging Tips

### Enable Verbose Logging

```javascript
// In backend .env
// LOG_LEVEL removed (console logging in use)

// Or in controller
console.log("DEBUG: Data received:", req.body);
console.log("DEBUG: User:", req.user);
```

### Check Audit Logs

```bash
# MongoDB shell
db.auditlogs.find({ action: 'MAINTENANCE_REPORTED' }).pretty()
```

### Frontend Debugging

```javascript
// Add in service
async reportMaintenance(data) {
  console.log('Sending data:', data);
  try {
    const response = await api.post('/maintenance', data);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data);
    throw error;
  }
}
```

---

## 📈 Performance Optimization

### Add Indexes for New Collections

```javascript
// For frequent queries
maintenanceRecordSchema.index({ baseId: 1, status: 1 });
maintenanceRecordSchema.index({ assetId: 1, createdAt: -1 });

// For sorting
maintenanceRecordSchema.index({ createdAt: -1 });
```

### Use Aggregation for Complex Reports

```javascript
async getMaintenanceStats(baseId) {
  return MaintenanceRecord.aggregate([
    { $match: { baseId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
}
```

---

## 🔧 Configuration Changes

### Add to .env

```env
# Maintenance feature
MAINTENANCE_ALERT_THRESHOLD=10
MAINTENANCE_AUTO_CLOSE_DAYS=30
```

### Reference in Code

```javascript
const ALERT_THRESHOLD = process.env.MAINTENANCE_ALERT_THRESHOLD || 10;
```

---

## 📚 Code Examples Summary

| Task              | File                                  | Pattern                    |
| ----------------- | ------------------------------------- | -------------------------- |
| New CRUD Feature  | Model + Service + Controller + Routes | Follow maintenance example |
| Simple CRUD       | Existing pattern in dataService       | Mirror existing code       |
| Complex Operation | inventoryService                      | Use transactions           |
| Reporting         | dashboardService                      | Use aggregation pipeline   |
| Frontend Page     | AssetsPage.jsx                        | Use context + hooks        |
| Access Control    | RBAC middleware                       | Add to routes              |
| Audit Trail       | auditService.logAction                | Call after state change    |

---

## 🎯 Common Issues & Solutions

### Issue: Audit log not created

**Solution**: Check if `auditService.logAction()` is called in service

### Issue: RBAC returning 403

**Solution**: Check `authorizeRoles()` has correct roles and route mounts it

### Issue: Data not updating on frontend

**Solution**: Check if context is re-fetching after API call

### Issue: Transaction failing silently

**Solution**: Check error handling and `session.abortTransaction()`

### Issue: Validation not working

**Solution**: Check if validation middleware is mounted on route before controller

---

## 📖 Code Standards

### Naming Conventions

- **Collections**: Singular (e.g., `User`, not `Users`)
- **Files**: PascalCase for classes/models, camelCase for functions
- **Variables**: camelCase (e.g., `userId`, `baseId`)
- **Constants**: UPPER_SNAKE_CASE

### Comments

```javascript
// Use for WHY, not WHAT
// ❌ Set the quantity to 10
quantity = 10;

// ✅ Allocate 10 units for new assignment
quantity = 10;
```

### Error Messages

```javascript
// ❌ Not found
throw new AppError("Not found", 404);

// ✅ User with ID user123 not found
throw new AppError(`User with ID ${userId} not found`, 404);
```

---

## 🚀 Deployment Checklist for New Feature

- [ ] Model created with indexes
- [ ] Service with business logic
- [ ] Controller with error handling
- [ ] Routes with RBAC
- [ ] Validation middleware
- [ ] Audit logging added
- [ ] Frontend page/component
- [ ] Context/API client updated
- [ ] Error handling tested
- [ ] RBAC tested
- [ ] Audit trail verified
- [ ] Documentation updated

---

## 📞 Support

For questions about specific patterns:

1. Check existing similar features in codebase
2. Review IMPLEMENTATION.md for architecture details
3. Check error messages in browser console/server logs
4. Review validation rules in middleware

Happy developing! 🎉

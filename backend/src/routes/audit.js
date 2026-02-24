import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/rbac.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles("admin"), getAuditLogs);

export default router;

import express from "express";
import {
  getInventory,
  setOpeningBalance,
  recordPurchase,
  getPurchases,
  recordTransfer,
  getTransfers,
  assignAsset,
  getAssignments,
  recordExpenditure,
  getExpenditures,
} from "../controllers/inventoryController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizeRoles, restrictToBase } from "../middlewares/rbac.js";
import {
  validateInventory,
  validatePurchase,
  validateTransfer,
  validateAssignment,
  validateExpenditure,
} from "../middlewares/validation.js";

const router = express.Router();

router.put(
  "/opening-balance",
  authenticate,
  authorizeRoles("admin"),
  validateInventory,
  setOpeningBalance,
);

router.post(
  "/purchases",
  authenticate,
  authorizeRoles("admin", "logistics_officer"),
  validatePurchase,
  recordPurchase,
);
router.get("/purchases", authenticate, getPurchases);

router.post(
  "/transfers",
  authenticate,
  authorizeRoles("admin", "logistics_officer"),
  validateTransfer,
  recordTransfer,
);
router.get("/transfers", authenticate, getTransfers);

router.post(
  "/assignments",
  authenticate,
  authorizeRoles("admin", "base_commander"),
  validateAssignment,
  assignAsset,
);
router.get("/assignments", authenticate, getAssignments);

router.post(
  "/expenditures",
  authenticate,
  authorizeRoles("admin", "base_commander"),
  validateExpenditure,
  recordExpenditure,
);
router.get("/expenditures", authenticate, getExpenditures);

// Keep dynamic route last so it doesn't shadow static routes like /purchases.
router.get("/:baseId", authenticate, getInventory);

export default router;

import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getBases,
  createBase,
  updateBase,
  deleteBase,
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/dataController.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/rbac.js";
import {
  validateUser,
  validateBase,
  validateAsset,
} from "../middlewares/validation.js";

const router = express.Router();

// User Routes
router.get("/users", authenticate, authorizeRoles("admin"), getUsers);
router.post(
  "/users",
  authenticate,
  authorizeRoles("admin"),
  validateUser,
  createUser,
);
router.put("/users/:id", authenticate, authorizeRoles("admin"), updateUser);
router.delete("/users/:id", authenticate, authorizeRoles("admin"), deleteUser);

// Base Routes
router.get("/bases", authenticate, getBases);
router.post(
  "/bases",
  authenticate,
  authorizeRoles("admin"),
  validateBase,
  createBase,
);
router.put(
  "/bases/:id",
  authenticate,
  authorizeRoles("admin"),
  validateBase,
  updateBase,
);
router.delete("/bases/:id", authenticate, authorizeRoles("admin"), deleteBase);

// Asset Routes
router.get("/assets", authenticate, getAssets);
router.post(
  "/assets",
  authenticate,
  authorizeRoles("admin"),
  validateAsset,
  createAsset,
);
router.put("/assets/:id", authenticate, authorizeRoles("admin"), updateAsset);
router.delete(
  "/assets/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteAsset,
);

export default router;

import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:baseId", authenticate, getDashboard);

export default router;

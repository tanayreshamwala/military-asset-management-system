import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateAuth } from "../middlewares/validation.js";

const router = express.Router();

router.post("/register", validateAuth, register);
router.post("/login", validateAuth, login);
router.get("/me", authenticate, getMe);

export default router;

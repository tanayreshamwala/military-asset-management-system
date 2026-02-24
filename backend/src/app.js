import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import inventoryRoutes from "./routes/inventory.js";
import dashboardRoutes from "./routes/dashboard.js";
import auditRoutes from "./routes/audit.js";

const app = express();
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", dataRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

export default app;

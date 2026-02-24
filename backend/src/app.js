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
const isDevelopment = process.env.NODE_ENV !== "production";

const configuredOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isDevelopment) {
  configuredOrigins.push("http://localhost:5173");
}

const allowedOrigins = [...new Set(configuredOrigins)];

// Middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients like curl/postman with no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
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

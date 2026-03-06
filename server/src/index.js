// server/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import fs from "node:fs";
import util from "node:util";

// Route imports
import auth from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import inquiryRoutes from "./routes/inquiries.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notifications.js";
import packageRoutes from "./routes/packages.js";
import panelBrandRoutes from "./routes/panel-brands.js";
import panelCapacityRoutes from "./routes/panel-capacities.js";
import inverterBrandRoutes from "./routes/inverter-brands.js";
import inverterCapacityRoutes from "./routes/inverter-capacities.js";
import batteriesRouter from "./routes/batteries.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ────────────────────────────────────────────────
// 1. Initialize Express app
// ────────────────────────────────────────────────
const app = express();

// Trust proxy (critical for cPanel/hosting with reverse proxy)
app.set("trust proxy", 1); // Trust first proxy (X-Forwarded-For)

// ────────────────────────────────────────────────
// 2. Global logging to file + console override
// ────────────────────────────────────────────────
const logFilePath = path.join(__dirname, "server-logs.txt");
let logFile;

try {
  logFile = fs.createWriteStream(logFilePath, { flags: "a" });
  console.log(`Logging initialized → ${logFilePath}`);
} catch (err) {
  console.error("Failed to open log file:", err.message);
}

const originalLog = console.log;
const originalError = console.error;

function formatArg(arg) {
  if (typeof arg === "object" && arg !== null) {
    return util.inspect(arg, { depth: 4, colors: false });
  }
  return String(arg);
}

console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(formatArg).join(" ");
  logFile?.write(`[${timestamp}] [LOG] ${message}\n`);
  originalLog(`\x1b[36m[${timestamp}]\x1b[0m`, ...args);
};

console.error = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(formatArg).join(" ");
  logFile?.write(`[${timestamp}] [ERROR] ${message}\n`);
  originalError(`\x1b[31m[${timestamp}] ERROR\x1b[0m`, ...args);
};

console.log("Server starting... PID:", process.pid);

// ────────────────────────────────────────────────
// 3. Middleware – Order matters!
// ────────────────────────────────────────────────

// Request logging (always first)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// Morgan HTTP request logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Security headers
app.use(helmet());

// CORS – allow frontend origins only
app.use(
  cors({
    origin: [
      "https://sanddsolutions.lk",
      "https://www.sanddsolutions.lk",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting – applied to all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// ────────────────────────────────────────────────
// 4. Body parsers – IMPORTANT: order & selective use
// ────────────────────────────────────────────────

// JSON parser – only for JSON routes (prevents multipart crash)
const jsonParser = express.json({ limit: "10mb" });
// Parse urlencoded bodies (for multipart text fields + files)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Apply JSON parser selectively to JSON-only routes
app.use("/api/auth", jsonParser, auth);
app.use("/api/inquiries", jsonParser, inquiryRoutes);
app.use("/api/admin", jsonParser, adminRoutes);
app.use("/api/notifications", jsonParser, notificationRoutes);
app.use("/api/packages", jsonParser, packageRoutes);
app.use("/api/panel-brands", jsonParser, panelBrandRoutes);
app.use("/api/panel-capacities", jsonParser, panelCapacityRoutes);
app.use("/api/inverter-brands", jsonParser, inverterBrandRoutes);
app.use("/api/inverter-capacities", jsonParser, inverterCapacityRoutes);
app.use("/api/batteries", jsonParser, batteriesRouter);

// File upload routes (multer) – do NOT use jsonParser here
app.use("/api/projects", express.urlencoded({ extended: true, limit: "10mb" }), projectRoutes);

// Fallback JSON parser for any missed JSON routes
app.use(jsonParser);

// ────────────────────────────────────────────────
// 5. Static file serving
// ────────────────────────────────────────────────

// Serve uploaded images/videos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));

  // SPA fallback – serve index.html for non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "public/index.html"));
  });
}

// ────────────────────────────────────────────────
// 6. Temporary test route
// ────────────────────────────────────────────────
app.get("/api/test-alive", (req, res) => {
  res.json({
    status: "API is alive!",
    path: req.originalUrl,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ────────────────────────────────────────────────
// 7. Global error handler (last middleware)
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR]", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ────────────────────────────────────────────────
// 8. Start server
// ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// server/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit"; // NEW: For rate limiting
import morgan from "morgan"; // NEW: For logging (optional but recommended)

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import inquiryRoutes from "./routes/inquiries.js";

// NEW: v2 routes
import authRoutesV2 from "./routes/auth-v2.js";
import projectRoutesV2 from "./routes/projects-v2.js";
import inquiryRoutesV2 from "./routes/inquiries-v2.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// To confirm if requests even reach the app
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// NEW: Logging middleware (add before routes)
app.use(morgan("combined")); // Or 'dev' for development

// NEW: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter); // Apply to all /api routes

// Temporary global test route – add at the TOP
app.get("/api/test-alive", (req, res) => {
  res.json({
    status: "API is alive!",
    path: req.originalUrl,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://sanddsolutions.lk"
        : true,
    credentials: true,
  }),
); // Tightened for prod
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API v1 routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/inquiries", inquiryRoutes);

// NEW: API v2 routes
app.use("/api/v2/auth", authRoutesV2);
app.use("/api/v2/projects", projectRoutesV2);
app.use("/api/v2/inquiries", inquiryRoutesV2);

// Serve React frontend in production (updated to serve from 'public' subdir)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public"))); // Assume client/dist copied to server/public

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next(); // Skip catch-all for APIs
    res.sendFile(path.join(__dirname, "public/index.html"));
  });
}

// NEW: Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

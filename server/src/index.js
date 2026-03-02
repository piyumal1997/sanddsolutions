// server/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import inquiryRoutes from "./routes/inquiries.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notifications.js";
import packageRoutes from './routes/packages.js';
import panelBrandRoutes from './routes/panel-brands.js';
import panelCapacityRoutes from './routes/panel-capacities.js';
import inverterBrandRoutes from './routes/inverter-brands.js';
import inverterCapacityRoutes from './routes/inverter-capacities.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//CORS configuration - tightened for production, open for development
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
  }),
);

// To confirm if requests even reach the app
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`,
  );
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

// Temporary global test route
app.get("/api/test-alive", (req, res) => {
  res.json({
    status: "API is alive!",
    path: req.originalUrl,
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API v1 routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/panel-brands', panelBrandRoutes);
app.use('/api/panel-capacities', panelCapacityRoutes);
app.use('/api/inverter-brands', inverterBrandRoutes);
app.use('/api/inverter-capacities', inverterCapacityRoutes);


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

import express from "express";
import pool from "../config/db.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs"; // Added missing import
import { fileURLToPath } from "node:url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- MULTER CONFIGURATION ---
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpg, jpeg, png, gif) and mp4 videos allowed"));
  },
});

// --- VALIDATION SCHEMA ---
const projectSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string()
    .valid("residential-solar", "industrial-solar", "automation", "engineering", "cooling solution")
    .required(),
  date: Joi.date().required(),
  details: Joi.string().allow(""),
  existingImages: Joi.string().allow(""), // JSON string from frontend
});

// --- PUBLIC ROUTES ---

// GET all projects
router.get("/", async (req, res) => {
  try {
    let query = "SELECT id, title, description, type, date, details, images FROM projects WHERE 1=1";
    const params = [];

    if (req.query.type && req.query.type !== "all") {
      query += " AND type = ?";
      params.push(req.query.type);
    }

    if (req.query.search?.trim()) {
      const term = `%${req.query.search.trim()}%`;
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(term, term);
    }

    query += " ORDER BY date DESC";

    const [rows] = await pool.query(query, params);

    const baseUrl = process.env.NODE_ENV === "production" 
      ? "https://sanddsolutions.lk" 
      : "http://localhost:3000";

    const projects = rows.map((p) => ({
      ...p,
      images: p.images
        ? JSON.parse(p.images).map((img) => (img.startsWith("http") ? img : `${baseUrl}${img}`))
        : [],
    }));

    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("GET /projects error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

// --- PROTECTED ROUTES ---
router.use(protect);
router.use(restrictTo("admin", "manager"));

// POST create project
router.post("/", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { title, description, type, date, details } = req.body;
    const files = req.files || [];
    
    const imagePaths = files.map((f) => `/uploads/${f.filename}`);
    const imagesJson = JSON.stringify(imagePaths);

    const [result] = await pool.query(
      `INSERT INTO projects (title, description, type, date, details, images, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title.trim(), description.trim(), type, date, details?.trim() || null, imagesJson, req.user.id]
    );

    res.status(201).json({ success: true, message: "Project created successfully", id: result.insertId });
  } catch (err) {
    console.error("[PROJECT POST] Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT update project
router.put("/:id", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const { title, description, type, date, details, existingImages } = req.body;

    // Parse existing images safely
    let images = [];
    try {
      images = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      images = [];
    }

    // Add new uploads
    const newFiles = req.files || [];
    const newPaths = newFiles.map((f) => `/uploads/${f.filename}`);
    const updatedImagesJson = JSON.stringify([...images, ...newPaths]);

    const [result] = await pool.query(
      `UPDATE projects 
       SET title=?, description=?, type=?, date=?, details=?, images=?, updated_at=NOW()
       WHERE id = ?`,
      [title.trim(), description.trim(), type, date, details?.trim() || null, updatedImagesJson, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("PUT /projects error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
});

// DELETE project
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE /projects error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
});

export default router;
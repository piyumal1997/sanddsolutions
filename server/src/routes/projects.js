import express from "express";
import pool from "../config/db.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// --- MULTER CONFIGURATION ---
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4/;
    const isAllowed =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    if (isAllowed) return cb(null, true);
    cb(new Error("Only images (jpg, jpeg, png, gif) and mp4 videos allowed"));
  },
});

// --- VALIDATION SCHEMA ---
const projectSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  type: Joi.string()
    .valid(
      "residential-solar",
      "industrial-solar",
      "automation",
      "engineering",
      "cooling solution",
    )
    .required(),
  date: Joi.date().required(),
  details: Joi.string().allow(""),
  existingImages: Joi.string().allow(""),
});

// --- PUBLIC ROUTES ---

router.get("/", async (req, res) => {
  try {
    let query =
      "SELECT id, title, description, type, date, details, images FROM projects WHERE 1=1";
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

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://api.sanddsolutions.lk" // Ensure this matches your API domain
        : "http://localhost:3000";

    const projects = rows.map((p) => {
      let parsedImages = [];
      try {
        // FAIL-SAFE: Handle null, empty strings, or invalid JSON
        if (p.images && p.images.trim() !== "") {
          parsedImages = JSON.parse(p.images);
        }
      } catch (e) {
        console.error(`JSON Parse Error for project ${p.id}:`, e.message);
        parsedImages = [];
      }

      return {
        ...p,
        images: Array.isArray(parsedImages)
          ? parsedImages.map((img) =>
              img.startsWith("http") ? img : `${baseUrl}${img}`,
            )
          : [],
      };
    });

    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("GET /projects error details:", err); // Log full error for debugging
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch projects" });
  }
});

// --- PROTECTED ROUTES ---
router.use(protect);
router.use(restrictTo("admin", "manager"));

router.post("/", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const { title, description, type, date, details } = req.body;
    const imagePaths = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const [result] = await pool.query(
      `INSERT INTO projects (title, description, type, date, details, images, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        title.trim(),
        description.trim(),
        type,
        date,
        details?.trim() || null,
        JSON.stringify(imagePaths),
        req.user?.id,
      ],
    );

    res
      .status(201)
      .json({
        success: true,
        message: "Project created successfully",
        id: result.insertId,
      });
  } catch (err) {
    console.error("[PROJECT POST] Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/:id", upload.array("images", 10), async (req, res) => {
  const { error } = projectSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });

  try {
    const { id } = req.params;
    const { title, description, type, date, details, existingImages } =
      req.body;

    let images = [];
    try {
      images = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      images = [];
    }

    const newPaths = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const finalImages = JSON.stringify([...images, ...newPaths]);

    const [result] = await pool.query(
      `UPDATE projects SET title=?, description=?, type=?, date=?, details=?, images=?, updated_at=NOW() WHERE id = ?`,
      [
        title.trim(),
        description.trim(),
        type,
        date,
        details?.trim() || null,
        finalImages,
        id,
      ],
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("PUT /projects error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete project" });
  }
});

export default router;
